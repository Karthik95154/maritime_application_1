import json
import os
import traceback
from collections import Counter

from loguru import logger

from database import get_db
from modules.cds_module import CDSModule
from modules.document_generation_module import DocumentGenerationModule
from modules.frame_extraction_module import FrameExtractionModule
from modules.repair_estimation_module import RepairEstimationModule
from modules.temporal_consistency_module import TemporalConsistencyModule
from modules.unique_defect_frame_extraction_module import UniqueDefectFrameExtractor
from session_manager import update_session

LOW_CLASSIFICATION_CONFIDENCE = 0.60
LOW_DEFECT_CONFIDENCE = 0.65
LOW_DEFECT_AVG_CONFIDENCE = 0.55


def save_json(data, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)


def load_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def _session_doc(session_id):
    db = get_db()
    return db.inspection_sessions.find_one({"session_id": session_id})


def _paths(session_folder):
    return {
        "frame_json": os.path.join(session_folder, "module_1_frame_extraction_output", "extracted_frames.json"),
        "cds_json": os.path.join(session_folder, "module_2_cds_output", "cds_outputs.json"),
        "temporal_json": os.path.join(session_folder, "module_3_temporal_output", "temporally_stable_outputs.json"),
        "unique_json": os.path.join(session_folder, "module_4_unique_defect_frame_output", "unique_defect_outputs.json"),
        "repair_json": os.path.join(session_folder, "module_5_repair_estimation_output", "repair_estimation_outputs.json"),
    }


def _pause_for_confidence_review(session_id, reason, resume_from):
    logger.info(f"[{session_id}] Human review required: {reason}")
    update_session(
        session_id,
        status="awaiting_review",
        current_stage="Awaiting Confidence Review",
        review_checkpoint="confidence_review",
        review_status="pending",
        review_notes=reason,
        pipeline_resume_from=resume_from,
    )


def _frame_extraction(session_id, session_folder, video_paths, previous_frame_jsons=None):
    update_session(session_id, progress=10, status="processing", current_stage="Frame Extraction")
    module_1_output = os.path.join(session_folder, "module_1_frame_extraction_output")
    os.makedirs(module_1_output, exist_ok=True)

    all_frames = []
    global_frame_id = 0

    for prev_json in previous_frame_jsons or []:
        try:
            prev_frames = load_json(prev_json)
            for frame in prev_frames:
                copied = frame.copy()
                copied["frame_id"] = global_frame_id
                all_frames.append(copied)
                global_frame_id += 1
        except Exception as exc:
            logger.error(f"[{session_id}] Failed to load previous frames {prev_json}: {exc}")

    for index, video_path in enumerate(video_paths):
        output_dir = module_1_output if len(video_paths) == 1 else os.path.join(module_1_output, f"video_{index}")
        os.makedirs(output_dir, exist_ok=True)
        extractor = FrameExtractionModule(
            output_dir=output_dir,
            frame_skip=5,
            blur_threshold=200,
            similarity_threshold=0.92,
            memory_size=20,
        )
        extracted_frames = extractor.process_video(video_path)
        for frame in extracted_frames:
            copied = frame.copy()
            copied["frame_id"] = global_frame_id
            all_frames.append(copied)
            global_frame_id += 1

    save_json(all_frames, _paths(session_folder)["frame_json"])
    logger.info(f"[{session_id}] Frame Extraction Completed. Total Frames: {len(all_frames)}")
    return all_frames


def _run_detection_and_confidence_review(session_id, session_folder, extracted_frames):
    paths = _paths(session_folder)

    update_session(session_id, progress=30, current_stage="CDS Detection")
    os.makedirs(os.path.dirname(paths["cds_json"]), exist_ok=True)
    cds_module = CDSModule(
        classification_model_path="final_models/yolo26m_classification_best.pt",
        part_segmentation_model_path="final_models/yolo26m_part_seg_best.pt",
        defect_segmentation_model_path="final_models/yolo_seg_deformation_best.pt",
        tracker="botsort.yaml",
    )
    cds_outputs = cds_module.process_frames(extracted_frames)
    save_json(cds_outputs, paths["cds_json"])

    update_session(session_id, progress=50, current_stage="Temporal Consistency")
    os.makedirs(os.path.dirname(paths["temporal_json"]), exist_ok=True)
    temporal_module = TemporalConsistencyModule(
        clip_similarity_threshold=0.88,
        iou_threshold=0.35,
        area_similarity_threshold=0.60,
        association_threshold=0.70,
    )
    temporal_module.process(paths["cds_json"], paths["temporal_json"])

    update_session(session_id, progress=65, current_stage="Unique Defect Extraction")
    os.makedirs(os.path.dirname(paths["unique_json"]), exist_ok=True)
    unique_defect_module = UniqueDefectFrameExtractor(
        defect_area_default=5,
        defect_area_metrics="sq.m",
        overlap_threshold=0.01,
    )
    unique_outputs = unique_defect_module.process(paths["temporal_json"], paths["unique_json"])

    reasons = []
    low_frames = [item for item in cds_outputs if (item.get("classification") or {}).get("confidence", 1.0) < LOW_CLASSIFICATION_CONFIDENCE]
    if low_frames:
        reasons.append(f"Low confidence in detecting part classification (deck/hull) in {len(low_frames)} frames")

    unique_conf = []
    for defect in unique_outputs.values():
        best_conf = float(defect.get("best_frame_confidence") or 0)
        avg_conf = float(defect.get("confidence_statistics", {}).get("avg_confidence") or 0)
        if best_conf < LOW_DEFECT_CONFIDENCE or avg_conf < LOW_DEFECT_AVG_CONFIDENCE:
            unique_conf.append(defect)

    if unique_conf:
        reasons.append(f"Low confidence in detecting defects for {len(unique_conf)} items")

    if reasons:
        _pause_for_confidence_review(session_id, " and ".join(reasons), resume_from="post_confidence_review")
        return {"needs_review": True, "cds_outputs": cds_outputs, "unique_outputs": unique_outputs}

    return {"needs_review": False, "cds_outputs": cds_outputs, "unique_outputs": unique_outputs}


def _run_final_stages(session_id, session_folder):
    paths = _paths(session_folder)

    update_session(session_id, progress=80, status="processing", current_stage="Repair Estimation")
    os.makedirs(os.path.dirname(paths["repair_json"]), exist_ok=True)
    repair_module = RepairEstimationModule(
        knowledge_folder="repair_process_docs",
        currency="INR",
    )
    repair_module.process(
        unique_defect_json_path=paths["unique_json"],
        output_json_path=paths["repair_json"],
    )

    try:
        db = get_db()
        analysis_doc = db.analysis_sessions.find_one({"session_id": session_id})
        visit_id = analysis_doc.get("visit_id") if analysis_doc else None
        from modules.defect_matching_engine import DefectMatchingEngine

        DefectMatchingEngine().process_session(session_id, paths["repair_json"], visit_id=visit_id)
    except Exception as exc:
        logger.error(f"[{session_id}] Defect Matching Failed: {exc}")

    update_session(session_id, progress=95, current_stage="Document Generation")
    module_6_output = os.path.join(session_folder, "module_6_document_generation_output")
    os.makedirs(module_6_output, exist_ok=True)
    report = DocumentGenerationModule(
        gemini_model_name="gemini-2.5-flash",
        output_folder=module_6_output,
    ).create_report(repair_estimation_json_path=paths["repair_json"])

    update_session(
        session_id,
        progress=100,
        status="completed",
        current_stage="Completed",
        document_path=report,
        review_checkpoint="completed",
        review_status="approved",
        pipeline_resume_from="completed",
    )


async def run_pipeline(session_id, video_path, session_folder):
    try:
        logger.info(f"[{session_id}] Pipeline Started")
        frames = _frame_extraction(session_id, session_folder, [video_path])
        review_result = _run_detection_and_confidence_review(session_id, session_folder, frames)
        if not review_result["needs_review"]:
            _run_final_stages(session_id, session_folder)
    except Exception as exc:
        logger.error(f"[{session_id}] Pipeline Failed")
        logger.error(str(exc))
        logger.error(traceback.format_exc())
        update_session(session_id, status="failed", current_stage="Failed")


async def run_batch_pipeline(session_id, video_paths, session_folder, previous_frame_jsons):
    try:
        logger.info(f"[{session_id}] Batch Pipeline Started")
        frames = _frame_extraction(session_id, session_folder, video_paths, previous_frame_jsons)
        review_result = _run_detection_and_confidence_review(session_id, session_folder, frames)
        if not review_result["needs_review"]:
            _run_final_stages(session_id, session_folder)
    except Exception as exc:
        logger.error(f"[{session_id}] Batch Pipeline Failed")
        logger.error(str(exc))
        logger.error(traceback.format_exc())
        update_session(session_id, status="failed", current_stage="Failed")


async def resume_pipeline(session_id):
    session_doc = _session_doc(session_id)
    if not session_doc:
        raise ValueError("Session not found")

    session_folder = session_doc.get("output_path")
    resume_from = session_doc.get("pipeline_resume_from")
    if not session_folder or not resume_from:
        raise ValueError("Session is missing resume information")

    if resume_from == "post_confidence_review":
        update_session(session_id, status="processing", review_status="approved", current_stage="Resuming Final Processing")
        _run_final_stages(session_id, session_folder)
        return

    logger.info(f"[{session_id}] No resume action required for {resume_from}")
