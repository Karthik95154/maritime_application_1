import os
from datetime import datetime
from database import get_db
import uuid

def migrate_visits():
    db = get_db()
    print("Starting migration to Dry Dock Visit Paradigm...")

    ships = list(db.vessels.find())
    
    for ship in ships:
        ship_id = ship.get("imo")
        if not ship_id: continue
        
        print(f"Processing ship: {ship_id}")
        
        # 1. Check if Visit 1 already exists
        visit = db.drydock_visits.find_one({"ship_id": ship_id, "visit_number": 1})
        if not visit:
            visit_id = str(uuid.uuid4())
            visit = {
                "visit_id": visit_id,
                "ship_id": ship_id,
                "visit_number": 1,
                "visit_type": "Dry Dock",
                "dockyard": "Unknown",
                "start_date": ship.get("created_at", datetime.utcnow()),
                "status": "Completed", # Existing ones are likely completed
                "report_version": 1,
                "total_defects": 0,
                "total_cost": 0.0,
                "created_at": ship.get("created_at", datetime.utcnow())
            }
            db.drydock_visits.insert_one(visit)
            print(f"Created Visit 1 for {ship_id}")
        else:
            visit_id = visit.get("visit_id")
            
        # 2. Update analysis_sessions
        db.analysis_sessions.update_many(
            {"vessel_id": ship_id, "visit_id": {"$exists": False}},
            {"$set": {"visit_id": visit_id}}
        )
        
        # 3. Update defect_registry
        db.defect_registry.update_many(
            {"vessel_id": ship_id, "visit_id": {"$exists": False}},
            {"$set": {"visit_id": visit_id}}
        )
        
        # 4. Update ship profile counters
        total_visits = db.drydock_visits.count_documents({"ship_id": ship_id})
        total_sessions = db.analysis_sessions.count_documents({"vessel_id": ship_id})
        
        db.vessels.update_one(
            {"imo": ship_id},
            {"$set": {"total_visits": total_visits, "total_reports": total_sessions}}
        )
        
    print("Visit Migration Complete.")

if __name__ == "__main__":
    migrate_visits()
