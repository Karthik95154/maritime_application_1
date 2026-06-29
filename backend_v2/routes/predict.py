import os
import uuid
import shutil
import asyncio
from datetime import datetime

from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from database import get_db
from models import InspectionSession, Vessel, DryDockVisit, AnalysisSession
from pipeline_runner import run_pipeline, run_batch_pipeline

router = APIRouter()

# =========================================================
# GLOBAL THREAD POOL
# =========================================================

executor = ThreadPoolExecutor(max_workers=1)

# =========================================================
# BACKGROUND WRAPPER
# =========================================================

def pipeline_task(session_id, video_path, session_folder):
    asyncio.run(
        run_pipeline(session_id, video_path, session_folder)
    )

def batch_pipeline_task(session_id, video_paths, session_folder, previous_frame_jsons):
    asyncio.run(
        run_batch_pipeline(session_id, video_paths, session_folder, previous_frame_jsons)
    )

# =========================================================
# HELPER: Ensure Vessel & Visit exist
# =========================================================
async def ensure_vessel_and_visit(db, imo_number, vessel_name, vessel_type, gross_tonnage, visit_id=None):
    if not imo_number:
        return None, None
        
    vessel = await db.vessels.find_one({"imo": imo_number})
    if not vessel:
        vessel = Vessel(
            vessel_id=imo_number,
            imo=imo_number,
            vessel_name=vessel_name or "Unknown",
            vessel_type=vessel_type,
            gross_tonnage=gross_tonnage,
            total_visits=0,
            total_reports=0
        )
        await db.vessels.insert_one(vessel.model_dump())
    
    if visit_id:
        visit = await db.drydock_visits.find_one({"visit_id": visit_id})
        if not visit:
            raise HTTPException(status_code=404, detail="Visit not found")
        # Update report version on append
        new_version = visit.get("report_version", 0) + 1
        await db.drydock_visits.update_one({"visit_id": visit_id}, {"$set": {"report_version": new_version}})
    else:
        # Create a new visit
        vessel_doc = await db.vessels.find_one({"imo": imo_number})
        visit_number = await db.drydock_visits.count_documents({"ship_id": imo_number}) + 1
        visit_id = str(uuid.uuid4())
        visit = DryDockVisit(
            visit_id=visit_id,
            ship_id=imo_number,
            visit_number=visit_number,
            report_version=1
        )
        await db.drydock_visits.insert_one(visit.model_dump())
        await db.vessels.update_one({"imo": imo_number}, {"$inc": {"total_visits": 1}})
        
    return imo_number, visit_id


# =========================================================
# PREDICT ENDPOINT (BATCH)
# =========================================================

@router.post("/predict/batch")
async def predict_videos(
    videos: list[UploadFile] = File(...),
    vessel_name: str | None = Form(default=None),
    imo_number: str | None = Form(default=None),
    vessel_type: str | None = Form(default=None),
    gross_tonnage: str | None = Form(default=None),
    inspector_name: str | None = Form(default=None),
    location: str | None = Form(default=None),
    inspection_date: str | None = Form(default=None),
    comments: str | None = Form(default=None),
    visit_id: str | None = Form(default=None),
):

    if not videos:
        raise HTTPException(
            status_code=400,
            detail="At least one video is required"
        )

    db = get_db()
    
    # 1. Resolve Vessel & Visit
    resolved_imo, resolved_visit_id = await ensure_vessel_and_visit(
        db, imo_number, vessel_name, vessel_type, gross_tonnage, visit_id
    )

    batch_id = str(uuid.uuid4()) # Keep batch_id for backwards compatibility
    
    # Find previous frame JSONs for this visit
    previous_frame_jsons = []
    if resolved_visit_id:
        previous_sessions = await db.analysis_sessions.find({"visit_id": resolved_visit_id}).to_list(length=None)
        for sess in previous_sessions:
            prev_session_id = sess.get("session_id")
            if prev_session_id:
                prev_json_path = os.path.join(
                    "outputs", "sessions", prev_session_id, 
                    "module_1_frame_extraction_output", "extracted_frames.json"
                )
                if os.path.exists(prev_json_path):
                    previous_frame_jsons.append(prev_json_path)

    session_id = str(uuid.uuid4())
    session_folder = f"outputs/sessions/{session_id}"
    os.makedirs(session_folder, exist_ok=True)

    video_paths = []
    video_names = []

    for video in videos:
        video_path = os.path.join(session_folder, video.filename)
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        video_paths.append(video_path)
        video_names.append(video.filename)

    # Legacy InspectionSession (For compatibility)
    new_session = InspectionSession(
        session_id=session_id,
        batch_id=batch_id,
        video_name=", ".join(video_names),
        vessel_name=vessel_name,
        imo_number=imo_number,
        vessel_type=vessel_type,
        gross_tonnage=gross_tonnage,
        inspector_name=inspector_name,
        location=location,
        inspection_date=inspection_date,
        comments=comments,
        video_path=video_paths[0] if video_paths else "",
        output_path=session_folder,
        status="processing",
        progress=0,
        current_stage="Queued"
    )
    await db.inspection_sessions.insert_one(new_session.model_dump())

    # Enterprise Lifecycle Session
    if resolved_imo:
        await db.vessels.update_one({"imo": resolved_imo}, {"$inc": {"total_reports": 1}})
        analysis = AnalysisSession(
            session_id=session_id,
            vessel_id=resolved_imo,
            visit_id=resolved_visit_id,
            uploaded_videos=video_names,
            status="processing"
        )
        await db.analysis_sessions.insert_one(analysis.model_dump())

    # Start background job
    loop = asyncio.get_running_loop()
    loop.run_in_executor(
        executor,
        batch_pipeline_task,
        session_id,
        video_paths,
        session_folder,
        previous_frame_jsons
    )

    return {
        "batch_id": batch_id,
        "visit_id": resolved_visit_id,
        "session_ids": [session_id],
        "status": "processing",
        "count": len(video_paths)
    }
