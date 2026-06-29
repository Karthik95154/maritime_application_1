import json
import os

from fastapi import APIRouter
from fastapi import HTTPException

from database import get_db
from models import InspectionSession

router = APIRouter()


def _read_json(path: str):
    if not os.path.exists(path):
        return None

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def _repair_json_path(session: InspectionSession) -> str:
    return os.path.join(
        session.output_path,
        "module_5_repair_estimation_output",
        "repair_estimation_outputs.json",
    )


def _best_frame_public_path(path: str | None) -> str | None:
    if not path:
        return None

    normalized = path.replace("\\", "/")

    if normalized.startswith("outputs/"):
        return f"/{normalized}"

    if "/outputs/" in normalized:
        return f"/outputs/{normalized.split('/outputs/', 1)[1]}"

    return normalized


@router.get("/batches/{batch_id}/report")
async def get_batch_report(batch_id: str):

    db = get_db()
    docs = await db.inspection_sessions.find({"batch_id": batch_id}).sort("created_at", 1).to_list(length=None)
    
    if not docs:
        # Fallback: Check if the provided batch_id is actually a visit_id (from the dashboard)
        analysis_docs = await db.analysis_sessions.find({"visit_id": batch_id}).to_list(length=None)
        if analysis_docs:
            session_ids = [doc.get("session_id") for doc in analysis_docs if doc.get("session_id")]
            docs = await db.inspection_sessions.find({"session_id": {"$in": session_ids}}).sort("created_at", 1).to_list(length=None)
            
    if not docs:
        raise HTTPException(status_code=404, detail="Batch not found")

    sessions = [InspectionSession(**doc) for doc in docs]

    total_cost = 0.0
    total_defects = 0
    critical_defects = 0
    defects = []
    completed_sessions = 0

    for session in sessions:
        repair_payload = _read_json(_repair_json_path(session)) or {}
        summary = repair_payload.get("repair_summary", {})
        session_defects = repair_payload.get("defect_repairs", {})

        if summary:
            completed_sessions += 1

        total_cost += float(summary.get("total_estimated_cost", 0))
        total_defects += int(summary.get("total_defects", 0))
        critical_defects += int(summary.get("severity_distribution", {}).get("high", 0))

        for defect_id, defect in session_defects.items():
            metadata = defect.get("defect_metadata", {})
            parts = metadata.get("overlapping_parts") or []
            part_name = parts[0]["part_name"].replace("_", " ").title() if parts else "General Area"
            defects.append(
                {
                    "defectId": defect_id,
                    "thumbnail": _best_frame_public_path(metadata.get("best_frame_path")),
                    "partName": part_name,
                    "defectType": (defect.get("defect_name") or "Unknown").replace("_", " ").title(),
                    "severity": (defect.get("severity") or "low").title(),
                    "area": float(metadata.get("defect_area", 0)),
                    "repairCost": round(float(defect.get("repair_estimation", {}).get("estimated_total_cost", 0)), 2),
                    "frameNumber": metadata.get("best_frame", 0),
                    "sourceVideo": session.video_name,
                }
            )

    health_score = max(25, min(96, 100 - (critical_defects * 8) - (total_defects * 2)))
    vessel_name = sessions[0].vessel_name or "Combined Vessel Inspection"
    current_stage = "Completed" if completed_sessions == len(sessions) else "Processing"

    return {
        "batchId": batch_id,
        "sessionIds": [session.session_id for session in sessions],
        "videoCount": len(sessions),
        "completedVideoCount": completed_sessions,
        "vesselName": vessel_name,
        "imoNumber": sessions[0].imo_number or "",
        "vesselType": sessions[0].vessel_type or "",
        "grossTonnage": sessions[0].gross_tonnage or "",
        "inspectorName": sessions[0].inspector_name or "",
        "location": sessions[0].location or "",
        "inspectionDate": sessions[0].inspection_date or None,
        "comments": sessions[0].comments or "",
        "status": current_stage,
        "progress": round((completed_sessions / len(sessions)) * 100) if sessions else 0,
        "currentStage": current_stage,
        "documentReady": completed_sessions == len(sessions),
        "documentPath": None,
        "createdAt": sessions[0].created_at.isoformat() if sessions[0].created_at else None,
        "defectCount": total_defects,
        "criticalDefects": critical_defects,
        "totalEstimatedCost": round(total_cost, 2),
        "healthScore": health_score,
        "sections": [
            "1 Executive Summary",
            "2 Batch Coverage",
            "3 Defect Summary",
            "4 Repair Estimation",
            "5 Recommendations",
            "6 Annexures",
        ],
        "executiveSummary": (
            f"{vessel_name} combined inspection batch includes {len(sessions)} uploaded videos. "
            f"{completed_sessions} of {len(sessions)} processing jobs are complete, with "
            f"{total_defects} detected defects and estimated repair exposure of INR {total_cost:,.0f}."
        ),
        "defects": defects,
        "downloadDocxUrl": f"/api/v1/batches/{batch_id}/download/docx?v={completed_sessions}" if completed_sessions > 0 else None,
        "downloadPdfUrl": f"/api/v1/batches/{batch_id}/download/pdf?v={completed_sessions}" if completed_sessions > 0 else None,
    }
