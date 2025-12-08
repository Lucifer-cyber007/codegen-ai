# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, chat, code_generation
from app.services.database import connect_to_database, close_database_connection
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting CodeGen AI backend...")
    
    # Connect to MongoDB
    logger.info("📊 Connecting to MongoDB...")
    await connect_to_database()
    
    # Initialize Gemma/Luffy model
    logger.info(f"🤖 Model path: {settings.MODEL_PATH}")
    logger.info(f"🤖 Model name: {settings.MODEL_NAME}")
    
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
        import traceback
        logger.error(traceback.format_exc())
        logger.warning("Starting without model - will return mock responses")
        app.state.gemma_service = None
    
    logger.info("✅ CodeGen AI backend started successfully!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Shutting down CodeGen AI backend...")
    await close_database_connection()
    logger.info("✅ Shutdown complete")

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
        "model_path": settings.MODEL_PATH,
        "database": "MongoDB Atlas"
    }

@app.get("/health")
async def health_check():
    from app.services.database import db
    
    model_status = app.state.gemma_service is not None and app.state.gemma_service.is_loaded()
    db_status = db.client is not None
    
    return {
        "status": "healthy",
        "model_loaded": model_status,
        "model_name": settings.MODEL_NAME if model_status else "mock",
        "database_connected": db_status,
        "model_path": settings.MODEL_PATH
    }