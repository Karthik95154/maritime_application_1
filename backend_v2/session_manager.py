from datetime import datetime
import pymongo
from config import settings

sync_client = pymongo.MongoClient(settings.mongo_uri)
sync_db = sync_client[settings.mongo_db_name]

def update_session(
    session_id,
    progress=None,
    status=None,
    current_stage=None,
    document_path=None,
    review_checkpoint=None,
    review_status=None,
    review_notes=None,
    review_updated_by=None,
    pipeline_resume_from=None,
):
    
    update_data = {}
    
    if progress is not None:
        update_data["progress"] = progress

    if status is not None:
        update_data["status"] = status

    if current_stage is not None:
        update_data["current_stage"] = current_stage

    if document_path is not None:
        update_data["document_path"] = document_path

    if review_checkpoint is not None:
        update_data["review_checkpoint"] = review_checkpoint

    if review_status is not None:
        update_data["review_status"] = review_status

    if review_notes is not None:
        update_data["review_notes"] = review_notes

    if review_updated_by is not None:
        update_data["review_updated_by"] = review_updated_by

    if pipeline_resume_from is not None:
        update_data["pipeline_resume_from"] = pipeline_resume_from

    if any(
        value is not None
        for value in (
            review_checkpoint,
            review_status,
            review_notes,
            review_updated_by,
            pipeline_resume_from,
        )
    ):
        update_data["review_updated_at"] = datetime.utcnow()

    if update_data:
        sync_db.inspection_sessions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )

def log_audit_trail(inspection_id: str, vessel_id: str, reviewer_id: str, reviewer_role: str, field: str, old_value: str, new_value: str, correction_reason: str = None):
    """Stores an audit record of a human-in-the-loop correction."""
    sync_db.assessment_audit_trail.insert_one({
        "inspection_id": inspection_id,
        "vessel_id": vessel_id,
        "reviewer_id": reviewer_id,
        "reviewer_role": reviewer_role,
        "field": field,
        "old_value": old_value,
        "new_value": new_value,
        "correction_reason": correction_reason,
        "timestamp": datetime.utcnow()
    })

def log_training_feedback(inspection_id: str, vessel_id: str, item_id: str, item_type: str, corrections: dict):
    """Stores an approved correction dataset for future model retraining."""
    sync_db.assessment_training_feedback.insert_one({
        "inspection_id": inspection_id,
        "vessel_id": vessel_id,
        "item_id": item_id,
        "item_type": item_type,
        "corrections": corrections,
        "timestamp": datetime.utcnow()
    })
