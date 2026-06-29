import os
import json
from datetime import datetime
from database import get_db
import uuid

def migrate():
    db = get_db()
    print("Starting migration to Enterprise Vessel Lifecycle format...")

    # 1. Fetch all existing inspection sessions
    sessions = list(db.inspection_sessions.find().sort("created_at", 1))
    
    vessels_dict = {}
    
    for session in sessions:
        imo = session.get("imo_number")
        if not imo:
            continue
            
        # 1. Ensure Vessel exists
        if imo not in vessels_dict:
            vessels_dict[imo] = {
                "vessel_id": imo,
                "imo": imo,
                "vessel_name": session.get("vessel_name", "Unknown"),
                "vessel_type": session.get("vessel_type"),
                "gross_tonnage": session.get("gross_tonnage"),
                "owner": None,
                "operator": None,
                "created_at": session.get("created_at", datetime.utcnow()),
                "updated_at": session.get("created_at", datetime.utcnow()),
                "latest_report_version": 0,
                "health_score": 100,
                "last_inspection_date": session.get("created_at")
            }
            db.vessels.update_one({"imo": imo}, {"$set": vessels_dict[imo]}, upsert=True)
            print(f"Created/Updated Vessel: {imo}")

        vessel_id = imo
        session_id = session.get("session_id")
        
        # 2. Create Analysis Session
        analysis_session = {
            "session_id": session_id,
            "vessel_id": vessel_id,
            "uploaded_videos": [session.get("video_name")],
            "analysis_results": os.path.join(session.get("output_path", ""), "module_5_repair_estimation_output", "repair_estimation_outputs.json") if session.get("output_path") else None,
            "generated_cost": 0.0,
            "generated_report": session.get("document_path"),
            "created_at": session.get("created_at", datetime.utcnow()),
            "status": session.get("status", "Completed")
        }
        db.analysis_sessions.update_one({"session_id": session_id}, {"$set": analysis_session}, upsert=True)
        
        # 3. Populate Defect Registry
        if analysis_session["analysis_results"] and os.path.exists(analysis_session["analysis_results"]):
            with open(analysis_session["analysis_results"], "r") as f:
                repair_data = json.load(f)
                
            defects = repair_data.get("defect_repairs", {})
            for d_id, d_data in defects.items():
                metadata = d_data.get("defect_metadata", {})
                parts = metadata.get("overlapping_parts", [])
                part_name = parts[0]["part_name"].replace("_", " ").title() if parts else "General Area"
                
                # Check if defect already exists for this vessel and component
                existing_defect = db.defect_registry.find_one({
                    "vessel_id": vessel_id,
                    "component": part_name,
                    "defect_type": d_data.get("defect_name", "Unknown")
                })
                
                cost = d_data.get("repair_estimation", {}).get("estimated_total_cost", 0)
                
                if existing_defect:
                    # Update existing defect
                    db.defect_registry.update_one(
                        {"_id": existing_defect["_id"]},
                        {
                            "$set": {
                                "last_detected": session.get("created_at", datetime.utcnow()),
                                "severity": d_data.get("severity", existing_defect.get("severity")),
                                "area": metadata.get("defect_area", existing_defect.get("area")),
                                "cost_estimation": cost
                            },
                            "$addToSet": {"session_ids": session_id}
                        }
                    )
                else:
                    # Create new defect
                    new_defect = {
                        "defect_id": str(uuid.uuid4()),
                        "vessel_id": vessel_id,
                        "component": part_name,
                        "defect_type": d_data.get("defect_name", "Unknown"),
                        "severity": d_data.get("severity", "Low"),
                        "area": metadata.get("defect_area", 0.0),
                        "location": None,
                        "status": "New",
                        "first_detected": session.get("created_at", datetime.utcnow()),
                        "last_detected": session.get("created_at", datetime.utcnow()),
                        "cost_estimation": cost,
                        "session_ids": [session_id],
                        "report_versions": []
                    }
                    db.defect_registry.insert_one(new_defect)
                    
        # Update vessel stats
        vessels_dict[imo]["last_inspection_date"] = session.get("created_at", datetime.utcnow())
        vessels_dict[imo]["updated_at"] = datetime.utcnow()
        db.vessels.update_one({"imo": imo}, {"$set": vessels_dict[imo]})
        
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
