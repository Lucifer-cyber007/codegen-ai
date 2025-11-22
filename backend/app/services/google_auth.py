import httpx
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

async def verify_google_token(token: str) -> Optional[Dict]:
    """
    Verify Google OAuth token and return user info
    
    Args:
        token: Google OAuth access token
        
    Returns:
        Dictionary with user info if valid, None otherwise
    """
    try:
        logger.info("Verifying Google token...")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'},
                timeout=10.0
            )
            
            if response.status_code == 200:
                user_info = response.json()
                logger.info(f"Token verified successfully for user: {user_info.get('email')}")
                
                return {
                    'google_id': user_info.get('sub'),
                    'email': user_info.get('email'),
                    'name': user_info.get('name'),
                    'given_name': user_info.get('given_name'),
                    'family_name': user_info.get('family_name'),
                    'picture': user_info.get('picture'),
                    'verified_email': user_info.get('email_verified', False),
                    'locale': user_info.get('locale')
                }
            else:
                logger.error(f"Google token verification failed with status: {response.status_code}")
                logger.error(f"Response: {response.text}")
                return None
                
    except httpx.TimeoutException:
        logger.error("Timeout while verifying Google token")
        return None
    except httpx.RequestError as e:
        logger.error(f"Request error while verifying Google token: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying Google token: {e}")
        return None


async def verify_google_id_token(id_token: str, client_id: str) -> Optional[Dict]:
    """
    Verify Google ID token (alternative method)
    
    Args:
        id_token: Google ID token (JWT)
        client_id: Your Google OAuth client ID
        
    Returns:
        Dictionary with user info if valid, None otherwise
    """
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests
        
        logger.info("Verifying Google ID token...")
        
        # Verify the token
        idinfo = google_id_token.verify_oauth2_token(
            id_token, 
            requests.Request(), 
            client_id
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            logger.error("Invalid token issuer")
            return None
        
        logger.info(f"ID token verified successfully for user: {idinfo.get('email')}")
        
        return {
            'google_id': idinfo.get('sub'),
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'verified_email': idinfo.get('email_verified', False)
        }
        
    except ValueError as e:
        logger.error(f"Invalid ID token: {e}")
        return None
    except Exception as e:
        logger.error(f"Error verifying ID token: {e}")
        return None


async def get_google_user_info(access_token: str) -> Optional[Dict]:
    """
    Get detailed user information from Google using access token
    
    Args:
        access_token: Google OAuth access token
        
    Returns:
        Dictionary with detailed user info
    """
    try:
        async with httpx.AsyncClient() as client:
            # Get basic user info
            userinfo_response = await client.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10.0
            )
            
            if userinfo_response.status_code != 200:
                logger.error(f"Failed to get user info: {userinfo_response.status_code}")
                return None
            
            user_info = userinfo_response.json()
            
            # Optionally get additional profile data from Google+ API
            # Note: Google+ API is deprecated, use People API instead
            try:
                people_response = await client.get(
                    'https://people.googleapis.com/v1/people/me',
                    headers={'Authorization': f'Bearer {access_token}'},
                    params={'personFields': 'names,emailAddresses,photos'},
                    timeout=10.0
                )
                
                if people_response.status_code == 200:
                    people_data = people_response.json()
                    # Merge additional data if needed
                    logger.info("Retrieved additional user data from People API")
            except Exception as e:
                logger.warning(f"Could not fetch additional profile data: {e}")
            
            return user_info
            
    except Exception as e:
        logger.error(f"Error getting Google user info: {e}")
        return None


def validate_google_token_structure(token: str) -> bool:
    """
    Validate that the token has the correct structure
    
    Args:
        token: Token to validate
        
    Returns:
        True if structure is valid
    """
    if not token or not isinstance(token, str):
        return False
    
    # Access tokens are typically alphanumeric with underscores/hyphens
    # ID tokens are JWTs with 3 parts separated by dots
    if '.' in token:
        parts = token.split('.')
        return len(parts) == 3
    else:
        # Access token - should be reasonable length
        return 20 <= len(token) <= 2048


async def revoke_google_token(token: str) -> bool:
    """
    Revoke a Google OAuth token
    
    Args:
        token: Token to revoke
        
    Returns:
        True if successful
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://oauth2.googleapis.com/revoke',
                params={'token': token},
                headers={'content-type': 'application/x-www-form-urlencoded'},
                timeout=10.0
            )
            
            if response.status_code == 200:
                logger.info("Token revoked successfully")
                return True
            else:
                logger.error(f"Failed to revoke token: {response.status_code}")
                return False
                
    except Exception as e:
        logger.error(f"Error revoking token: {e}")
        return False