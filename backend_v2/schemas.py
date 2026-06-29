from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization: Optional[str] = "BlueWave Marine Services"
    isAdmin: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    name: str
    email: EmailStr
    role: str
    organization: Optional[str]
    isAdmin: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
