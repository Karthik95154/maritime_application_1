import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    api_v1_str: str = "/api/v1"
    project_name: str = "Maritime Inspection API"
    
    # MongoDB Config
    mongo_uri: str = "mongodb://localhost:27017/"
    mongo_db_name: str = "maritime_inspection2"
    
    # Security Config
    jwt_secret_key: str = "your-secret-key-for-dev"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    
    # File Paths
    upload_folder: str = "uploads"
    output_folder: str = "outputs/sessions"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

os.makedirs(settings.upload_folder, exist_ok=True)
os.makedirs(settings.output_folder, exist_ok=True)