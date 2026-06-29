import os
import uuid
import shutil
import asyncio

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from database import SessionLocal

from models import InspectionSession

from pipeline_runner import run_pipeline

router = APIRouter()


@router.post("/predict")
async def predict_video(
    video: UploadFile = File(...)
):

    session_id = str(uuid.uuid4())

    session_folder = (
        f"outputs/sessions/{session_id}"
    )

    os.makedirs(session_folder, exist_ok=True)

    video_path = os.path.join(
        session_folder,
        video.filename
    )

    with open(video_path, "wb") as buffer:

        shutil.copyfileobj(
            video.file,
            buffer
        )

    db = SessionLocal()

    new_session = InspectionSession(

        session_id=session_id,

        video_name=video.filename,

        video_path=video_path,

        output_path=session_folder,

        status="processing",

        progress=0,

        current_stage="Queued"
    )

    db.add(new_session)

    db.commit()

    db.close()

    asyncio.create_task(

        run_pipeline(
            session_id,
            video_path,
            session_folder
        )
    )

    return {

        "session_id": session_id,

        "status": "processing"
    }