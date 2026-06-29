from loguru import logger
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.trustedhost import TrustedHostMiddleware

limiter = Limiter(key_func=get_remote_address)

from routes.batch_reports import router as batch_reports_router
from routes.inspections import router as inspections_router
from routes.predict import router as predict_router
from routes.progress import router as progress_router
from routes.history import router as history_router
from routes.download import router as download_router
from routes.auth import router as auth_router
from routes.internal_review import router as internal_review_router
from routes.stream import router as stream_router
from routes.dashboard import router as dashboard_router

from database import connect_to_mongo, close_mongo_connection
from config import settings

logger.add(
    "backend.log",
    rotation="100 MB"
)

app = FastAPI(
    title=settings.project_name,
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal server error occurred. Please try again later."},
    )

# Secure CORS - restricting from ["*"] to specific allowed hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*"]) # Change * in production

api_router = APIRouter(prefix=settings.api_v1_str)

from routes.vessels import router as vessels_router

api_router.include_router(predict_router)
api_router.include_router(progress_router)
api_router.include_router(stream_router)
api_router.include_router(download_router)
api_router.include_router(auth_router)
api_router.include_router(history_router)
api_router.include_router(batch_reports_router)
api_router.include_router(inspections_router)
api_router.include_router(internal_review_router)
api_router.include_router(dashboard_router)
api_router.include_router(vessels_router, prefix="/vessels", tags=["vessels"])

from routes.defects import router as defects_router
api_router.include_router(defects_router, prefix="/defects", tags=["defects"])

app.include_router(api_router)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

@app.get("/health")
@limiter.limit("60/minute")
def health_check(request: Request):
    return {"status": "ok", "version": "v1.1", "db": "async"}
