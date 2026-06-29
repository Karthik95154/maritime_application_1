import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_db
from models import InspectionSession
from pipeline_runner import load_json, save_json, resume_pipeline
from services.session_views import build_defects, build_summary
from session_manager import update_session, log_audit_trail, log_training_feedback

router = APIRouter(prefix="/internal/reviews", tags=["internal-review"])

review_executor = ThreadPoolExecutor(max_workers=1)

class DefectCorrection(BaseModel):
    defect_type: Optional[str] = None
    severity: Optional[str] = None
    repair_recommendation: Optional[str] = None
    repair_priority: Optional[str] = None
    reason: Optional[str] = None

class FrameCorrection(BaseModel):
    part_classification: Optional[str] = None
    reason: Optional[str] = None

class ReviewDecisionPayload(BaseModel):
    checkpoint: str
    decision: str
    notes: Optional[str] = None
    reviewer: Optional[str] = None
    reviewer_role: Optional[str] = None
    review_duration: Optional[int] = None
    defect_corrections: Optional[dict[str, DefectCorrection]] = None
    frame_corrections: Optional[dict[str, FrameCorrection]] = None


def _resume_pipeline_task(session_id: str):
    asyncio.run(resume_pipeline(session_id))

def _apply_corrections(doc: dict, payload: ReviewDecisionPayload):
    output_path = doc.get("output_path", "")
    session_id = doc.get("session_id")
    vessel_id = doc.get("vessel_id", "unknown")
    reviewer = payload.reviewer or "System"
    role = payload.reviewer_role or "Reviewer"

    if payload.frame_corrections:
        cds_json = os.path.join(output_path, "module_2_cds_output", "cds_outputs.json")
        if os.path.exists(cds_json):
            cds_outputs = load_json(cds_json)
            changed = False
            for frame in cds_outputs:
                frame_id = str(frame.get("frame_id"))
                if frame_id in payload.frame_corrections:
                    correction = payload.frame_corrections[frame_id]
                    if correction.part_classification:
                        old_val = (frame.get("classification") or {}).get("class_name", "Unknown")
                        new_val = correction.part_classification
                        if old_val != new_val:
                            if "classification" not in frame or frame["classification"] is None:
                                frame["classification"] = {}
                            frame["classification"]["class_name"] = new_val
                            changed = True
                            log_audit_trail(session_id, vessel_id, reviewer, role, "part_classification", str(old_val), str(new_val), correction.reason)
                            log_training_feedback(session_id, vessel_id, frame_id, "frame", correction.dict())
            if changed:
                save_json(cds_outputs, cds_json)

    if payload.defect_corrections:
        unique_json = os.path.join(output_path, "module_4_unique_defect_frame_output", "unique_defect_outputs.json")
        if os.path.exists(unique_json):
            unique_outputs = load_json(unique_json)
            changed = False
            for defect_id, defect in unique_outputs.items():
                if defect_id in payload.defect_corrections:
                    correction = payload.defect_corrections[defect_id]
                    updates = {}
                    if correction.defect_type and correction.defect_type != defect.get("defect_name"):
                        updates["defect_name"] = correction.defect_type
                    if correction.severity and correction.severity != defect.get("severity"):
                        updates["severity"] = correction.severity
                    if correction.repair_recommendation and correction.repair_recommendation != defect.get("repair_recommendation"):
                        updates["repair_recommendation"] = correction.repair_recommendation
                    if correction.repair_priority and correction.repair_priority != defect.get("repair_priority"):
                        updates["repair_priority"] = correction.repair_priority
                    
                    if updates:
                        for k, v in updates.items():
                            old_val = defect.get(k, "Unknown")
                            defect[k] = v
                            log_audit_trail(session_id, vessel_id, reviewer, role, k, str(old_val), str(v), correction.reason)
                        changed = True
                        log_training_feedback(session_id, vessel_id, defect_id, "defect", correction.dict())
            if changed:
                save_json(unique_outputs, unique_json)


def _frame_review_items(output_path: str):
    frame_json = os.path.join(output_path, "module_1_frame_extraction_output", "extracted_frames.json")
    if not os.path.exists(frame_json):
        return []

    frames = load_json(frame_json)
    items = []
    for frame in frames[:24]:
        path = (frame.get("frame_path") or "").replace("\\", "/")
        public_path = f"/{path}" if path.startswith("outputs/") else path
        items.append(
            {
                "frameId": frame.get("frame_id"),
                "timestamp": frame.get("timestamp"),
                "imageUrl": public_path,
                "sourceVideo": frame.get("source_video"),
            }
        )
    return items


def _confidence_review_items(output_path: str):
    cds_json = os.path.join(output_path, "module_2_cds_output", "cds_outputs.json")
    unique_json = os.path.join(output_path, "module_4_unique_defect_frame_output", "unique_defect_outputs.json")

    items = {"lowConfidenceFrames": [], "lowConfidenceDefects": []}

    if os.path.exists(cds_json):
        cds_outputs = load_json(cds_json)
        for frame in cds_outputs:
            classification = frame.get("classification") or {}
            confidence = float(classification.get("confidence") or 0)
            if confidence < 0.6:
                items["lowConfidenceFrames"].append(
                    {
                        "frameId": frame.get("frame_id"),
                        "framePath": frame.get("frame_path"),
                        "label": classification.get("class_name") or "Unknown",
                        "confidence": confidence,
                        "partDetections": len(frame.get("part_detections") or []),
                        "defectDetections": len(frame.get("defect_detections") or []),
                    }
                )

    if os.path.exists(unique_json):
        unique_outputs = load_json(unique_json)
        for defect_id, defect in unique_outputs.items():
            best_conf = float(defect.get("best_frame_confidence") or 0)
            avg_conf = float(defect.get("confidence_statistics", {}).get("avg_confidence") or 0)
            if best_conf < 0.65 or avg_conf < 0.55:
                items["lowConfidenceDefects"].append(
                    {
                        "defectId": defect_id,
                        "defectName": defect.get("defect_name"),
                        "bestFrame": defect.get("best_frame"),
                        "bestFramePath": defect.get("best_frame_path"),
                        "bestFrameConfidence": best_conf,
                        "avgConfidence": avg_conf,
                        "severity": defect.get("severity"),
                        "bbox": defect.get("bbox"),
                    }
                )

    return items


@router.get("")
async def review_queue():
    db = get_db()
    docs = await db.inspection_sessions.find().sort("created_at", -1).to_list(length=None)
    return [build_summary(InspectionSession(**doc)) for doc in docs]


@router.get("/{session_id}")
async def review_detail(session_id: str):
    db = get_db()
    doc = await db.inspection_sessions.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")

    session = InspectionSession(**doc)
    summary = build_summary(session)
    return {
        **summary,
        "frameReviewItems": _frame_review_items(doc.get("output_path", "")),
        "confidenceReviewItems": _confidence_review_items(doc.get("output_path", "")),
        "defectReviewItems": build_defects(session),
    }


@router.post("/{session_id}/decision")
async def submit_review_decision(session_id: str, payload: ReviewDecisionPayload):
    db = get_db()
    doc = await db.inspection_sessions.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")

    active_checkpoint = doc.get("review_checkpoint")
    if payload.checkpoint != active_checkpoint:
        raise HTTPException(status_code=409, detail=f"Session is currently waiting at {active_checkpoint}")

    decision = payload.decision.lower().strip()
    reviewer = payload.reviewer or "Internal reviewer"
    notes = payload.notes or ""

    if decision == "assess_continue":
        _apply_corrections(doc, payload)
        update_session(
            session_id,
            review_status="approved",
            review_notes=notes,
            review_updated_by=reviewer,
            status="processing",
            current_stage="Assessment Completed"
        )
        loop = asyncio.get_running_loop()
        loop.run_in_executor(review_executor, _resume_pipeline_task, session_id)
        return {"status": "accepted", "message": "Assessment recorded. Pipeline resumed."}

    if decision == "save_assessment":
        _apply_corrections(doc, payload)
        update_session(
            session_id,
            status="assessment_in_progress",
            review_status="pending",
            review_notes=notes,
            review_updated_by=reviewer,
            current_stage="Assessment In Progress"
        )
        return {"status": "accepted", "message": "Assessment saved. Pipeline not resumed."}

    if decision == "reject":
        update_session(
            session_id,
            status="rejected",
            current_stage="Confidence Review Rejected",
            review_status="rejected",
            review_notes=notes,
            review_updated_by=reviewer,
        )
        return {"status": "accepted", "message": "Rejection recorded. Session held for developer action."}

    raise HTTPException(status_code=400, detail="Decision must be assess_continue, save_assessment, or reject")
