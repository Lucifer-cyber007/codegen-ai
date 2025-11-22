from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage
conversations_db = {}
messages_db = {}

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    message: str
    conversation_id: int
    timestamp: str

@router.post("/generate", response_model=ChatResponse)
async def generate_code_chat(request: Request, chat_message: ChatMessage):
    """Generate code based on chat message - NO AUTH FOR TESTING"""
    try:
        logger.info("="*80)
        logger.info(f"💬 NEW CHAT REQUEST: {chat_message.message[:100]}")
        logger.info(f"📋 Conversation ID: {chat_message.conversation_id}")
        logger.info("="*80)
        
        # Get service from app.state
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            logger.error("❌ Service not initialized!")
            raise HTTPException(
                status_code=503,
                detail="Model service not available"
            )
        
        logger.info(f"📊 Model loaded: {gemma_service.is_loaded()}")
        
        # Create or get conversation
        if chat_message.conversation_id is None:
            conv_id = len(conversations_db) + 1
            conversations_db[conv_id] = {
                'id': conv_id,
                'user_id': 1,
                'title': chat_message.message[:50] + ('...' if len(chat_message.message) > 50 else ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'messages': []
            }
            logger.info(f"📝 Created new conversation: {conv_id}")
        else:
            conv_id = chat_message.conversation_id
            if conv_id not in conversations_db:
                logger.warning(f"⚠️ Conversation {conv_id} not found, creating new one")
                conversations_db[conv_id] = {
                    'id': conv_id,
                    'user_id': 1,
                    'title': chat_message.message[:50] + ('...' if len(chat_message.message) > 50 else ''),
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat(),
                    'messages': []
                }
            logger.info(f"📝 Using conversation: {conv_id}")
        
        # Store user message
        user_msg_id = len(messages_db) + 1
        messages_db[user_msg_id] = {
            'id': user_msg_id,
            'conversation_id': conv_id,
            'role': 'user',
            'content': chat_message.message,
            'timestamp': datetime.utcnow().isoformat(),
        }
        
        # Add to conversation
        if 'messages' not in conversations_db[conv_id]:
            conversations_db[conv_id]['messages'] = []
        conversations_db[conv_id]['messages'].append(user_msg_id)
        
        # GENERATE WITH MODEL
        logger.info("🤖 Generating response with Luffy model...")
        
        if gemma_service.is_loaded():
            try:
                # ✅ CORRECT: Using exact parameters from gemma_service.generate_code()
                response_text = gemma_service.generate_code(
                    prompt=chat_message.message,
                    max_length=512,        # ✅ Correct parameter name
                    temperature=0.7,
                    top_p=0.9,
                    top_k=50
                )
                logger.info(f"✅ Generated {len(response_text)} characters")
                logger.info(f"📝 Preview: {response_text[:100]}...")
                
            except Exception as gen_error:
                logger.error(f"❌ Generation error: {gen_error}")
                import traceback
                logger.error(traceback.format_exc())
                response_text = f"Sorry, I encountered an error: {str(gen_error)}"
        else:
            logger.error("❌ MODEL NOT LOADED!")
            response_text = """❌ **Model Not Loaded**

The Luffy AI model is not initialized. Please:
1. Check model files exist at `./models/Luffy_code_assistant`
2. Restart backend server
3. Check logs for errors"""
        
        # Store AI message
        ai_msg_id = len(messages_db) + 1
        messages_db[ai_msg_id] = {
            'id': ai_msg_id,
            'conversation_id': conv_id,
            'role': 'assistant',
            'content': response_text,
            'timestamp': datetime.utcnow().isoformat(),
        }
        
        conversations_db[conv_id]['messages'].append(ai_msg_id)
        conversations_db[conv_id]['updated_at'] = datetime.utcnow().isoformat()
        
        logger.info("="*80)
        logger.info("✅ CHAT REQUEST COMPLETE")
        logger.info("="*80)
        
        return {
            "message": response_text,
            "conversation_id": conv_id,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("="*80)
        logger.error(f"❌ CRITICAL ERROR: {e}")
        import traceback
        logger.error(traceback.format_exc())
        logger.error("="*80)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/conversations")
async def get_conversations():
    """Get all conversations"""
    try:
        conversations = [
            {
                'id': conv['id'],
                'title': conv['title'],
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at'],
                'message_count': len(conv.get('messages', []))
            }
            for conv in conversations_db.values()
        ]
        conversations.sort(key=lambda x: x['updated_at'], reverse=True)
        logger.info(f"📚 Returning {len(conversations)} conversations")
        return {"conversations": conversations}
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        return {"conversations": []}

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: int):
    """Get specific conversation with messages"""
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        conversation = conversations_db[conversation_id]
        conv_messages = []
        
        for msg_id in conversation.get('messages', []):
            if msg_id in messages_db:
                msg = messages_db[msg_id]
                conv_messages.append({
                    'id': msg['id'],
                    'role': msg['role'],
                    'content': msg['content'],
                    'timestamp': msg['timestamp']
                })
        
        return {
            'id': conversation['id'],
            'title': conversation['title'],
            'created_at': conversation['created_at'],
            'updated_at': conversation['updated_at'],
            'messages': conv_messages
        }
    except Exception as e:
        logger.error(f"Error getting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int):
    """Delete a conversation"""
    if conversation_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    try:
        conversation = conversations_db[conversation_id]
        
        # Delete all messages
        for msg_id in conversation.get('messages', []):
            if msg_id in messages_db:
                del messages_db[msg_id]
        
        # Delete conversation
        del conversations_db[conversation_id]
        
        logger.info(f"🗑️ Deleted conversation {conversation_id}")
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))