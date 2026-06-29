from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from schemas import UserCreate, UserLogin, TokenResponse
from services.security import verify_password, get_password_hash, create_access_token
from config import settings
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserCreate, db = Depends(get_db)):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    user_dict = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": "Platform Administrator" if user.isAdmin else "Regional Survey Lead",
        "organization": user.organization,
        "isAdmin": user.isAdmin,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_dict)
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user_dict["role"],
            "organization": user.organization,
            "isAdmin": user.isAdmin
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, db = Depends(get_db)):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "name": db_user.get("name"),
            "email": db_user.get("email"),
            "role": db_user.get("role"),
            "organization": db_user.get("organization"),
            "isAdmin": db_user.get("isAdmin", False)
        }
    }

@router.get("/users")
async def get_users(db = Depends(get_db)):
    users = await db.users.find().to_list(length=None)
    if not users:
        return [
            {"id": "u1", "name": "System Admin", "email": "admin@maritime.com", "role": "Platform Administrator", "status": "Active"},
            {"id": "u2", "name": "John Inspector", "email": "john@maritime.com", "role": "Regional Survey Lead", "status": "Active"}
        ]
    return [{"id": str(u["_id"]), "name": u.get("name"), "email": u.get("email"), "role": u.get("role", "Regional Survey Lead"), "status": "Active"} for u in users]

@router.post("/users/{email}/role")
async def update_role(email: str, payload: dict, db = Depends(get_db)):
    new_role = payload.get("role")
    if not new_role:
        raise HTTPException(status_code=400, detail="Role is required")
    await db.users.update_one({"email": email}, {"$set": {"role": new_role}})
    return {"status": "success", "message": f"User {email} role updated to {new_role}"}

@router.post("/users/{email}/password")
async def update_password(email: str, payload: dict, db = Depends(get_db)):
    new_password = payload.get("password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Password is required")
    
    hashed_password = get_password_hash(new_password)
    result = await db.users.update_one(
        {"email": email}, 
        {"$set": {"hashed_password": hashed_password}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": f"Password updated successfully for {email}"}
