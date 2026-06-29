from fastapi import APIRouter, HTTPException
from database import get_db
from models import Vessel, DefectRegistry, AnalysisSession, DryDockVisit
import json

router = APIRouter()

@router.get("/")
async def list_vessels():
    db = get_db()
    vessels = await db.vessels.find().sort("last_inspection_date", -1).to_list(length=None)
    results = []
    for v in vessels:
        vessel_defects = await db.defect_registry.count_documents({"vessel_id": v.get("imo"), "severity": "Critical"})
        health = v.get("health_score", 100)
        risk = "Critical" if health < 60 else "High" if health < 75 else "Medium" if health < 90 else "Low"
        
        results.append({
            "imoNumber": v.get("imo"),
            "vesselName": v.get("vessel_name"),
            "vesselType": v.get("vessel_type"),
            "grossTonnage": v.get("gross_tonnage"),
            "lastInspectionDate": v.get("last_inspection_date").isoformat() if v.get("last_inspection_date") else None,
            "healthScore": health,
            "riskScore": risk,
            "criticalDefects": vessel_defects,
            "totalInspections": v.get("total_visits", 0),
            "owner": v.get("owner"),
            "operator": v.get("operator")
        })
    return results

@router.get("/{imo_number}")
async def get_vessel(imo_number: str):
    db = get_db()
    vessel = await db.vessels.find_one({"imo": imo_number})
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
        
    vessel_defects = await db.defect_registry.count_documents({"vessel_id": imo_number, "severity": "Critical"})
    health = vessel.get("health_score", 100)
    risk = "Critical" if health < 60 else "High" if health < 75 else "Medium" if health < 90 else "Low"
    
    return {
        "imoNumber": vessel.get("imo"),
        "vesselName": vessel.get("vessel_name"),
        "vesselType": vessel.get("vessel_type"),
        "grossTonnage": vessel.get("gross_tonnage"),
        "healthScore": health,
        "riskScore": risk,
        "criticalDefects": vessel_defects,
        "totalVisits": vessel.get("total_visits", 0)
    }

@router.delete("/{imo_number}")
async def delete_vessel(imo_number: str):
    db = get_db()
    vessel = await db.vessels.find_one({"imo": imo_number})
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
        
    await db.vessels.delete_one({"imo": imo_number})
    await db.drydock_visits.delete_many({"ship_id": imo_number})
    await db.defect_registry.delete_many({"vessel_id": imo_number})
    
    return {"status": "success", "message": f"Vessel {imo_number} deleted successfully"}

@router.get("/{imo_number}/visits")
async def get_vessel_visits(imo_number: str):
    db = get_db()
    visits = await db.drydock_visits.find({"ship_id": imo_number}).sort("visit_number", -1).to_list(length=None)
    
    response = []
    for v in visits:
        vid = v.get("visit_id")
        # Fetch sessions for this visit
        sessions = await db.analysis_sessions.find({"visit_id": vid}).sort("created_at", -1).to_list(length=None)
        
        response.append({
            "visitId": vid,
            "visitNumber": v.get("visit_number"),
            "visitType": v.get("visit_type"),
            "startDate": v.get("start_date").isoformat() if v.get("start_date") else None,
            "status": v.get("status"),
            "reportVersion": v.get("report_version"),
            "totalDefects": v.get("total_defects"),
            "sessions": [
                {
                    "sessionId": s.get("session_id"),
                    "videos": s.get("uploaded_videos", []),
                    "status": s.get("status"),
                    "createdAt": s.get("created_at").isoformat() if s.get("created_at") else None
                } for s in sessions
            ]
        })
    return response

@router.get("/{imo_number}/defects")
async def get_vessel_defects(imo_number: str):
    db = get_db()
    docs = await db.defect_registry.find({"vessel_id": imo_number}).sort("last_detected", -1).to_list(length=None)
    
    all_defects = []
    for defect in docs:
        all_defects.append({
            "defectId": defect.get("defect_id"),
            "visitId": defect.get("visit_id"),
            "thumbnail": defect.get("thumbnail"),
            "partName": defect.get("component"),
            "defectType": defect.get("defect_type"),
            "severity": defect.get("severity"),
            "area": defect.get("area"),
            "status": defect.get("status"),
            "repairCost": defect.get("cost_estimation", 0.0),
            "firstDetected": defect.get("first_detected").isoformat() if defect.get("first_detected") else None,
            "lastDetected": defect.get("last_detected").isoformat() if defect.get("last_detected") else None,
            "sessionIds": defect.get("session_ids", []),
            "history": defect.get("history", [])
        })
            
    return all_defects

@router.get("/{imo_number}/reports/compare")
async def compare_reports(imo_number: str, v1: str, v2: str):
    """
    Simulates a comparison by fetching defect deltas across two sessions.
    In a fully fleshed out ReportVersion engine, this would query report_versions.
    """
    db = get_db()
    # In lieu of full report_versions, we find defects that exist in v2 but not v1 (new),
    # or that were updated in v2.
    
    all_defects = await db.defect_registry.find({"vessel_id": imo_number}).to_list(length=None)
    
    new_defects = []
    updated_defects = []
    resolved_defects = []
    cost_diff = 0.0
    
    for defect in all_defects:
        sessions = defect.get("session_ids", [])
        if v2 in sessions and v1 not in sessions:
            new_defects.append(defect.get("defect_type"))
            cost_diff += defect.get("cost_estimation", 0)
        elif v2 in sessions and v1 in sessions:
            updated_defects.append(defect.get("defect_type"))
        elif v1 in sessions and v2 not in sessions and defect.get("status") in ["Repaired", "Closed"]:
            resolved_defects.append(defect.get("defect_type"))
            
    return {
        "fromVersion": v1,
        "toVersion": v2,
        "newDefects": new_defects,
        "updatedDefects": updated_defects,
        "resolvedDefects": resolved_defects,
        "costDifference": cost_diff,
        "healthScoreDifference": 0 # Placeholder for advanced heuristic
    }
