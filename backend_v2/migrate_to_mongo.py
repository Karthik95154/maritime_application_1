import os
from pymongo import MongoClient
from sqlalchemy.orm import class_mapper

# Import from existing sqlalchemy models before we change them
from database import SessionLocal
from models import InspectionSession

def object_as_dict(obj):
    """Converts a SQLAlchemy object to a dictionary."""
    return {c.key: getattr(obj, c.key) for c in class_mapper(obj.__class__).columns}

def migrate():
    # 1. Connect to SQLite
    db = SessionLocal()
    sessions = db.query(InspectionSession).all()
    
    if not sessions:
        print("No sessions found in SQLite database.")
        db.close()
        return

    # 2. Connect to MongoDB
    # Assume local MongoDB without auth for now
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    mongo_db = client["maritime_inspection2"]
    collection = mongo_db["inspection_sessions"]
    
    # Check if already migrated
    if collection.count_documents({}) > 0:
        print(f"MongoDB already contains {collection.count_documents({})} documents. Skipping migration to avoid duplicates.")
        db.close()
        return

    # 3. Migrate data
    docs_to_insert = []
    for session in sessions:
        doc = object_as_dict(session)
        # remove the sqlalchemy id, let mongo assign _id
        if 'id' in doc:
            del doc['id']
        docs_to_insert.append(doc)
    
    if docs_to_insert:
        collection.insert_many(docs_to_insert)
        print(f"Successfully migrated {len(docs_to_insert)} sessions to MongoDB.")
    
    db.close()

if __name__ == "__main__":
    migrate()
