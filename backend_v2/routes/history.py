from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter()

@router.get("/history")
def get_history():
    db = get_db()
    sessions = db.inspection_sessions.find()
    
    response = []
    for s in sessions:
        response.append({
            "session_id": s.get("session_id"),
            "video_name": s.get("video_name"),
            "status": s.get("status"),
            "progress": s.get("progress"),
            "created_at": s.get("created_at"),
            "document_path": s.get("document_path")
        })

    return response

@router.delete("/history/{session_id}")
def delete_history(session_id: str):
    db = get_db()
    result = db.inspection_sessions.delete_one({"session_id": session_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {"message": "Session deleted successfully"}
