import os
import bcrypt
from pymongo import MongoClient
from config import settings
from datetime import datetime

client = MongoClient(settings.mongo_uri)
db = client[settings.mongo_db_name]
admin_email = "admin@bluewavemarine.com"

existing_user = db.users.find_one({"email": admin_email})
if existing_user:
    print(f"Admin user {admin_email} already exists.")  
else:
    # Use bcrypt directly to avoid passlib version conflicts
    salt = bcrypt.gensalt(rounds=12)
    hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), salt).decode('utf-8')
    
    user_dict = {
        "name": "System Admin",
        "email": admin_email,
        "hashed_password": hashed_password,
        "role": "Platform Administrator",
        "organization": "BlueWave Marine Services",
        "isAdmin": True,
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user_dict)
    print(f"Created default admin user. Email: {admin_email}, Password: admin123")
