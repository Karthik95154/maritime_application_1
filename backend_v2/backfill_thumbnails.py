import os
import json
from database import get_db

db = get_db()

def _public_output_path(path: str) -> str:
    if not path:
        return None
    normalized = path.replace("\\", "/")
    if normalized.startswith("outputs/"):
        return f"/{normalized}"
    if "/outputs/" in normalized:
        return f"/outputs/{normalized.split('/outputs/', 1)[1]}"
    return normalized

def update_thumbnails():
    defects = list(db.defect_registry.find({"thumbnail": {"$exists": False}}))
    for defect in defects:
        sessions = defect.get("session_ids", [])
        thumbnail = None
        for s_id in reversed(sessions): # Get from latest session
            # Try to find output path
            session_doc = db.analysis_sessions.find_one({"session_id": s_id})
            if not session_doc:
                session_doc = db.inspection_sessions.find_one({"session_id": s_id})
            if not session_doc: continue
            
            output_path = session_doc.get("output_path")
            if not output_path:
                output_path = f"outputs/{s_id}"
                
            repair_json_path = os.path.join(output_path, "module_5_repair_estimation_output", "repair_estimation_outputs.json")
            if os.path.exists(repair_json_path):
                try:
                    with open(repair_json_path, "r") as f:
                        repair_data = json.load(f)
                    
                    # We have to find the matching defect by type/component since we lost the internal d_id
                    comp = defect.get("component", "").lower().replace(" ", "_")
                    dtype = defect.get("defect_type", "").lower()
                    
                    repairs = repair_data.get("defect_repairs", {})
                    for d_id, d_data in repairs.items():
                        parts = d_data.get("defect_metadata", {}).get("overlapping_parts", [])
                        part_name = parts[0]["part_name"].lower() if parts else "general_area"
                        d_name = d_data.get("defect_name", "").lower()
                        
                        if d_name == dtype or part_name == comp:
                            best_frame = d_data.get("defect_metadata", {}).get("best_frame_path")
                            if best_frame:
                                thumbnail = _public_output_path(best_frame)
                                break
                    if thumbnail: break
                except:
                    pass
                    
        if thumbnail:
            db.defect_registry.update_one({"_id": defect["_id"]}, {"$set": {"thumbnail": thumbnail}})
            print(f"Updated {defect['defect_id']} with {thumbnail}")
        else:
            print(f"Could not find thumbnail for {defect['defect_id']}")

if __name__ == '__main__':
    update_thumbnails()
