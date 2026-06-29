from fastapi import APIRouter
from database import get_db

router = APIRouter()

@router.get("/progress/{session_id}")
def get_progress(session_id: str):
    db = get_db()
    session = db.inspection_sessions.find_one({"session_id": session_id})

    if not session:
        return {"error": "Session not found"}

    return {
        "session_id": session.get("session_id"),
        "status": session.get("status"),
        "progress": session.get("progress"),
        "current_stage": session.get("current_stage"),
        "document_ready": session.get("document_path") is not None,
        "document_path": session.get("document_path")
    }