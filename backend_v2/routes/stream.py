from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
from database import get_db

router = APIRouter()

@router.get("/stream/inspections/{batch_id}")
async def stream_inspection_progress(batch_id: str):
    async def event_generator():
        last_progress = -1
        last_stage = ""
        
        while True:
            db = get_db()
            
            # Get all sessions for this batch
            sessions_cursor = db.inspection_sessions.find({"batch_id": batch_id})
            sessions = list(sessions_cursor)
            
            if not sessions:
                yield f"data: {json.dumps({'error': 'Batch not found'})}\n\n"
                break
            
            # For simplicity, track the overall progress (average) or the first session
            # If there are multiple videos, average the progress
            total_progress = sum(s.get("progress", 0) for s in sessions) / len(sessions)
            
            # We'll just show the stage of the first session for the log stream
            current_stage = sessions[0].get("current_stage", "")
            status = sessions[0].get("status", "")
            
            # If there's a change, emit an event
            if total_progress != last_progress or current_stage != last_stage:
                yield f"data: {json.dumps({'progress': total_progress, 'stage': current_stage, 'status': status, 'log_line': f'Currently processing: {current_stage}'})}\n\n"
                last_progress = total_progress
                last_stage = current_stage
            
            if all(s.get("status") in ["completed", "failed"] for s in sessions):
                yield f"data: {json.dumps({'progress': total_progress, 'stage': current_stage, 'status': status, 'log_line': f'Inspection {status}'})}\n\n"
                break
                
            await asyncio.sleep(0.5)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
