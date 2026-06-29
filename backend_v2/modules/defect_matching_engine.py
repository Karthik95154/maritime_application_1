import json
import os
import uuid
from datetime import datetime
from database import get_db

class DefectMatchingEngine:
    def __init__(self):
        self.db = get_db()

    def process_session(self, session_id: str, repair_json_path: str, visit_id: str = None):
        if not os.path.exists(repair_json_path):
            print(f"[DefectMatchingEngine] Repair JSON not found: {repair_json_path}")
            return

        # Fetch the analysis session to get vessel_id
        session = self.db.analysis_sessions.find_one({"session_id": session_id})
        if not session:
            print(f"[DefectMatchingEngine] Analysis session {session_id} not found in new collections.")
            # Fallback to inspection_sessions if migration is still ongoing for this record
            session = self.db.inspection_sessions.find_one({"session_id": session_id})
            if not session:
                return
            vessel_id = session.get("imo_number")
        else:
            vessel_id = session.get("vessel_id")

        if not vessel_id:
            print("[DefectMatchingEngine] No vessel ID associated with session.")
            return

        with open(repair_json_path, "r") as f:
            repair_data = json.load(f)

        defects = repair_data.get("defect_repairs", {})
        now = datetime.utcnow()
        
        for d_id, d_data in defects.items():
            metadata = d_data.get("defect_metadata", {})
            parts = metadata.get("overlapping_parts", [])
            part_name = parts[0]["part_name"].replace("_", " ").title() if parts else "General Area"
            defect_type = d_data.get("defect_name", "Unknown")
            severity = d_data.get("severity", "Low")
            area = metadata.get("defect_area", 0.0)
            cost = d_data.get("repair_estimation", {}).get("estimated_total_cost", 0)
            
            thumbnail_path = metadata.get("best_frame_path")
            if thumbnail_path and thumbnail_path.startswith("outputs/"):
                thumbnail_path = f"/{thumbnail_path}"
            elif thumbnail_path and "/outputs/" in thumbnail_path:
                thumbnail_path = f"/outputs/{thumbnail_path.split('/outputs/', 1)[1]}"

            history_entry = {
                "visit_id": visit_id,
                "session_id": session_id,
                "date": now,
                "area": area,
                "severity": severity,
                "cost": cost
            }

            # Heuristic match: Same vessel, same part, same type
            # We add {"session_ids": {"$ne": session_id}} so that multiple defects of the same type 
            # in the SAME session do not merge together into a single defect.
            existing_defect = self.db.defect_registry.find_one({
                "vessel_id": vessel_id,
                "component": part_name,
                "defect_type": defect_type,
                "session_ids": {"$ne": session_id}
            })

            if existing_defect:
                # Update existing defect
                self.db.defect_registry.update_one(
                    {"_id": existing_defect["_id"]},
                    {
                        "$set": {
                            "last_detected": now,
                            "severity": severity,  # Assuming latest severity overrides
                            "area": area,
                            "thumbnail": thumbnail_path,
                            "cost_estimation": cost,
                            "status": "Active" # Re-activate if it was closed
                        },
                        "$addToSet": {"session_ids": session_id},
                        "$push": {"history": history_entry}
                    }
                )
                print(f"[DefectMatchingEngine] Updated existing defect {existing_defect['defect_id']}")
            else:
                # Create new defect
                new_defect = {
                    "defect_id": str(uuid.uuid4()),
                    "vessel_id": vessel_id,
                    "visit_id": visit_id,
                    "component": part_name,
                    "defect_type": defect_type,
                    "severity": severity,
                    "area": area,
                    "thumbnail": thumbnail_path,
                    "location": None,
                    "status": "New",
                    "first_detected": now,
                    "last_detected": now,
                    "cost_estimation": cost,
                    "session_ids": [session_id],
                    "report_versions": [],
                    "history": [history_entry]
                }
                self.db.defect_registry.insert_one(new_defect)
                print(f"[DefectMatchingEngine] Created new defect {new_defect['defect_id']}")
        
        # Update vessel stats
        self.db.vessels.update_one(
            {"imo": vessel_id},
            {"$set": {"last_inspection_date": now, "updated_at": now}}
        )
