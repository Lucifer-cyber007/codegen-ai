from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.utils.helpers import create_access_token, verify_token
from app.services.google_auth import verify_google_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# In-memory database simulation
users_db = {}

class GoogleAuthRequest(BaseModel):
    token: str
    email: str = None
    name: str = None
    picture: str = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

@router.post("/google", response_model=AuthResponse)
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate with Google OAuth token or user info"""
    try:
        logger.info("📥 Received Google auth request")
        
        # Check if we have user info already (from frontend)
        if auth_request.email and auth_request.name:
            logger.info(f"✅ Using provided user info for: {auth_request.email}")
            user_info = {
                'google_id': auth_request.token,  # Using token as google_id
                'email': auth_request.email,
                'name': auth_request.name,
                'picture': auth_request.picture,
                'verified_email': True
            }
        else:
            # Try to verify with Google API
            logger.info("🔍 Verifying token with Google API...")
            user_info = await verify_google_token(auth_request.token)
            
            if not user_info:
                logger.error("❌ Token verification failed")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
        
        logger.info(f"✅ User authenticated: {user_info['email']}")
        
        # Check if user exists, create if not
        user_email = user_info['email']
        if user_email not in users_db:
            users_db[user_email] = {
                'id': len(users_db) + 1,
                'email': user_email,
                'google_id': user_info['google_id'],
                'name': user_info['name'],
                'picture': user_info['picture'],
            }
            logger.info(f"✅ New user registered: {user_email}")
        else:
            # Update user info
            users_db[user_email].update({
                'name': user_info['name'],
                'picture': user_info['picture'],
            })
            logger.info(f"✅ Existing user logged in: {user_email}")
        
        user = users_db[user_email]
        
        # Create access token
        access_token = create_access_token(data={
            "sub": user_email, 
            "user_id": user['id']
        })
        
        logger.info(f"✅ JWT token created for: {user_email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Authentication error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email = payload.get("sub")
    if email not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return users_db[email]

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user