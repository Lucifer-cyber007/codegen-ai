from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, chat, code_generation
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemma service on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting CodeGen AI backend...")
    logger.info(f"Model path: {settings.MODEL_PATH}")
    
    try:
        from app.services.gemma_service import GemmaService
        logger.info("Initializing Gemma/Luffy model...")
        gemma_service = GemmaService()
        app.state.gemma_service = gemma_service
        
        if gemma_service.is_loaded():
            logger.info("✅ Model loaded successfully!")
        else:
            logger.warning("⚠️ Model not loaded - using mock responses")
            app.state.gemma_service = None
    except Exception as e:
        logger.error(f"❌ Failed to initialize model: {e}")
        logger.warning("Starting without model - will return mock responses")
        app.state.gemma_service = None

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(code_generation.router, prefix=f"{settings.API_V1_STR}/code", tags=["code generation"])

@app.get("/")
async def root():
    return {
        "message": "CodeGen AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "model": settings.MODEL_NAME,
        "model_path": settings.MODEL_PATH
    }

@app.get("/health")
async def health_check():
    model_status = app.state.gemma_service is not None and app.state.gemma_service.is_loaded()
    return {
        "status": "healthy",
        "model_loaded": model_status,
        "model_name": settings.MODEL_NAME if model_status else "mock"
    }