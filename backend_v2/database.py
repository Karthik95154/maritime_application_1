from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from loguru import logger

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(
        settings.mongo_uri,
        maxPoolSize=10,
        minPoolSize=2
    )
    # Check connection
    await db.client.admin.command('ping')
    logger.info("Successfully connected to MongoDB!")
    
    # Initialize critical indexes asynchronously
    _db = db.client[settings.mongo_db_name]
    try:
        await _db.vessels.create_index("imo", unique=True)
        await _db.defect_registry.create_index("defect_id", unique=True)
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB indexes: {e}")

async def close_mongo_connection():
    if db.client is not None:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    """Dependency generator for FastAPI routes."""
    return db.client[settings.mongo_db_name]
