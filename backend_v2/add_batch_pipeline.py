import os

with open("d:/maritime_web_codex/backend_v2/pipeline_runner.py", "a", encoding="utf-8") as f:
    f.write("""

# =========================================================
# BATCH PIPELINE
# =========================================================

async def run_batch_pipeline(session_id, video_paths, session_folder, previous_frame_jsons):
    try:
        logger.info(f"[{session_id}] Batch Pipeline Started")

        # =================================================
        # MODULE 1
        # FRAME EXTRACTION (INCREMENTAL)
        # =================================================

        update_session(session_id, progress=10, status="processing", current_stage="Frame Extraction")

        module_1_output = os.path.join(session_folder, "module_1_frame_extraction_output")
        os.makedirs(module_1_output, exist_ok=True)

        all_frames = []
        global_frame_id = 0

        # Load previous frames
        for prev_json in previous_frame_jsons:
            try:
                with open(prev_json, "r") as json_file:
                    import json
                    prev_frames = json.load(json_file)
                    for frame in prev_frames:
                        frame_copy = frame.copy()
                        frame_copy["frame_id"] = global_frame_id
                        all_frames.append(frame_copy)
                        global_frame_id += 1
                logger.info(f"[{session_id}] Loaded {len(prev_frames)} frames from {prev_json}")
            except Exception as e:
                logger.error(f"[{session_id}] Failed to load previous frames from {prev_json}: {e}")

        # Extract new frames
        for i, video_path in enumerate(video_paths):
            video_output_dir = os.path.join(module_1_output, f"video_{i}")
            os.makedirs(video_output_dir, exist_ok=True)

            frame_extractor = FrameExtractionModule(
                output_dir=video_output_dir,
                frame_skip=5,
                blur_threshold=200,
                similarity_threshold=0.92,
                memory_size=20
            )

            extracted_frames = frame_extractor.process_video(video_path)

            for frame in extracted_frames:
                frame_copy = frame.copy()
                frame_copy["frame_id"] = global_frame_id
                all_frames.append(frame_copy)
                global_frame_id += 1
                
        extracted_frames_json = os.path.join(module_1_output, "extracted_frames.json")
        save_json(all_frames, extracted_frames_json)

        logger.info(f"[{session_id}] Frame Extraction Completed. Total Frames: {len(all_frames)}")

        # =================================================
        # MODULE 2
        # CDS
        # =================================================

        update_session(session_id, progress=30, current_stage="CDS Detection")

        module_2_output = os.path.join(session_folder, "module_2_cds_output")
        os.makedirs(module_2_output, exist_ok=True)

        cds_module = CDSModule(
            classification_model_path="final_models/yolo26m_classification_best.pt",
            part_segmentation_model_path="final_models/yolo26m_part_seg_best.pt",
            defect_segmentation_model_path="final_models/yolo_seg_deformation_best.pt",
            tracker="botsort.yaml"
        )

        cds_outputs = cds_module.process_frames(all_frames)
        cds_output_json = os.path.join(module_2_output, "cds_outputs.json")
        save_json(cds_outputs, cds_output_json)

        logger.info(f"[{session_id}] CDS Completed")

        # =================================================
        # MODULE 3
        # TEMPORAL CONSISTENCY
        # =================================================

        update_session(session_id, progress=50, current_stage="Temporal Consistency")

        module_3_output = os.path.join(session_folder, "module_3_temporal_output")
        os.makedirs(module_3_output, exist_ok=True)

        temporal_module = TemporalConsistencyModule(
            clip_similarity_threshold=0.88,
            iou_threshold=0.35,
            area_similarity_threshold=0.60,
            association_threshold=0.70
        )

        temporal_output_json = os.path.join(module_3_output, "temporally_stable_outputs.json")
        temporal_outputs = temporal_module.process(
            cds_json_path=cds_output_json,
            output_json_path=temporal_output_json
        )

        logger.info(f"[{session_id}] Temporal Consistency Completed")

        # =================================================
        # MODULE 4
        # UNIQUE DEFECT EXTRACTION
        # =================================================

        update_session(session_id, progress=65, current_stage="Unique Defect Extraction")

        module_4_output = os.path.join(session_folder, "module_4_unique_defect_frame_output")
        os.makedirs(module_4_output, exist_ok=True)

        unique_defect_module = UniqueDefectFrameExtractor(
            defect_area_default=5,
            defect_area_metrics="sq.m",
            overlap_threshold=0.01
        )

        unique_defect_output_json = os.path.join(module_4_output, "unique_defect_outputs.json")
        unique_outputs = unique_defect_module.process(
            temporal_json_path=temporal_output_json,
            output_json_path=unique_defect_output_json
        )

        logger.info(f"[{session_id}] Unique Defect Extraction Completed")

        # =================================================
        # MODULE 5
        # REPAIR ESTIMATION
        # =================================================

        update_session(session_id, progress=80, current_stage="Repair Estimation")

        module_5_output = os.path.join(session_folder, "module_5_repair_estimation_output")
        os.makedirs(module_5_output, exist_ok=True)

        repair_module = RepairEstimationModule(
            knowledge_folder="repair_process_docs",
            currency="INR"
        )

        repair_output_json = os.path.join(module_5_output, "repair_estimation_outputs.json")
        repair_outputs = repair_module.process(
            unique_defect_json_path=unique_defect_output_json,
            output_json_path=repair_output_json
        )

        logger.info(f"[{session_id}] Repair Estimation Completed")

        # =================================================
        # MODULE 5.5 - LIFECYCLE DEFECT MATCHING
        # =================================================
        try:
            from database import get_db
            db = get_db()
            analysis_doc = db.analysis_sessions.find_one({"session_id": session_id})
            visit_id = analysis_doc.get("visit_id") if analysis_doc else None

            from modules.defect_matching_engine import DefectMatchingEngine
            matcher = DefectMatchingEngine()
            matcher.process_session(session_id, repair_output_json, visit_id=visit_id)
            logger.info(f"[{session_id}] Lifecycle Defect Matching Completed")
        except Exception as e:
            logger.error(f"[{session_id}] Defect Matching Failed: {e}")

        # =================================================
        # MODULE 6
        # DOCUMENT GENERATION
        # =================================================

        update_session(session_id, progress=95, current_stage="Document Generation")

        module_6_output = os.path.join(session_folder, "module_6_document_generation_output")
        os.makedirs(module_6_output, exist_ok=True)

        document_generator = DocumentGenerationModule(
            gemini_model_name="gemini-2.5-flash",
            output_folder=module_6_output
        )

        report_path = document_generator.create_report(
            repair_estimation_json_path=repair_output_json
        )

        logger.info(f"[{session_id}] Document Generated")

        # =================================================
        # FINAL SUCCESS
        # =================================================

        update_session(
            session_id,
            progress=100,
            status="completed",
            current_stage="Completed",
            document_path=report_path
        )

        logger.info(f"[{session_id}] Batch Pipeline Completed")

    except Exception as e:
        logger.error(f"[{session_id}] Batch Pipeline Failed")
        logger.error(str(e))
        logger.error(traceback.format_exc())
        update_session(session_id, status="failed", current_stage="Failed")

""")
