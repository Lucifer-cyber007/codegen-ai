# app/services/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

db = Database()

async def connect_to_database():
    """Connect to MongoDB on startup"""
    try:
        mongodb_url = os.getenv("MONGODB_URL")
        database_name = os.getenv("DATABASE_NAME", "codegen_ai")
        
        if not mongodb_url:
            logger.error("❌ MONGODB_URL not found in environment variables!")
            logger.warning("⚠️ Running without database - solutions will be stored to files")
            return
        
        logger.info(f"🔌 Connecting to MongoDB: {database_name}...")
        
        # Create MongoDB client
        db.client = AsyncIOMotorClient(
            mongodb_url,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=5000
        )
        
        # Get database
        db.db = db.client[database_name]
        
        # Test connection
        await db.client.admin.command('ping')
        
        logger.info("✅ Successfully connected to MongoDB!")
        logger.info(f"📊 Database: {database_name}")
        
        # Create indexes
        await create_indexes()
        
    except ConnectionFailure as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        logger.warning("⚠️ Running without database - solutions will be stored to files")
        db.client = None
        db.db = None
    except Exception as e:
        logger.error(f"❌ Unexpected error connecting to MongoDB: {e}")
        logger.warning("⚠️ Running without database - solutions will be stored to files")
        db.client = None
        db.db = None

async def close_database_connection():
    """Close MongoDB connection on shutdown"""
    if db.client:
        logger.info("🔌 Closing MongoDB connection...")
        db.client.close()
        logger.info("✅ MongoDB connection closed")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        if db.db is None:
            return
            
        # Index on solutions collection
        await db.db.solutions.create_index("problem_id")
        await db.db.solutions.create_index("status")
        await db.db.solutions.create_index("created_at")
        await db.db.solutions.create_index([("problem_id", 1), ("status", 1)])
        
        # Index on failures collection
        await db.db.failures.create_index("problem_id")
        await db.db.failures.create_index("created_at")
        
        # Index on chat_history collection
        await db.db.chat_history.create_index("user_id")
        await db.db.chat_history.create_index("created_at")
        await db.db.chat_history.create_index([("user_id", 1), ("created_at", -1)])
        
        logger.info("✅ Database indexes created")
    except Exception as e:
        logger.warning(f"⚠️ Error creating indexes: {e}")

def get_database():
    """Get database instance"""
    return db.db

# Collection helpers - THESE ARE THE MISSING FUNCTIONS
def get_solutions_collection():
    """Get solutions collection"""
    if db.db is None:
        logger.warning("⚠️ Database not connected - get_solutions_collection returning None")
        return None
    return db.db.solutions

def get_failures_collection():
    """Get failures collection"""
    if db.db is None:
        logger.warning("⚠️ Database not connected - get_failures_collection returning None")
        return None
    return db.db.failures

def get_analytics_collection():
    """Get analytics collection"""
    if db.db is None:
        logger.warning("⚠️ Database not connected - get_analytics_collection returning None")
        return None
    return db.db.analytics

def get_chat_history_collection():
    """Get chat history collection"""
    if db.db is None:
        logger.warning("⚠️ Database not connected - get_chat_history_collection returning None")
        return None
    return db.db.chat_history