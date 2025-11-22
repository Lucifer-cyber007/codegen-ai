from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.routes.auth import get_current_user
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str = "python"

class CodeRefactorRequest(BaseModel):
    code: str
    instructions: str

class CodeExplainRequest(BaseModel):
    code: str
    language: str = "python"

class CodeFixRequest(BaseModel):
    code: str
    error_message: Optional[str] = None
    language: str = "python"

class CodeResponse(BaseModel):
    code: str
    language: str


# ==================== TEST ENDPOINT (NO AUTH) ====================

@router.post("/test-generate")
async def test_generate_code(request: Request, code_request: CodeGenerationRequest):
    """
    TEST ENDPOINT - No authentication required
    Use this to test if the model is working
    """
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model service not initialized"
            )
        
        if not gemma_service.is_loaded():
            return {
                "code": "# Model not loaded - using mock response",
                "language": code_request.language,
                "status": "mock_mode"
            }
        
        logger.info(f"🧪 TEST: Generating code for: {code_request.prompt[:50]}...")
        
        generated_code = gemma_service.generate_code(code_request.prompt)
        
        return {
            "code": generated_code,
            "language": code_request.language,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Test generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== AUTHENTICATED ENDPOINTS ====================

@router.post("/generate", response_model=CodeResponse)
async def generate_code(
    request: Request,
    code_request: CodeGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate code based on prompt"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        logger.info(f"📝 Code generation request from user {current_user['id']}")
        
        generated_code = gemma_service.generate_code(code_request.prompt)
        
        return {
            "code": generated_code,
            "language": code_request.language
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refactor")
async def refactor_code(
    request: Request,
    refactor_request: CodeRefactorRequest,
    current_user: dict = Depends(get_current_user)
):
    """Refactor existing code"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        logger.info(f"🔧 Code refactor request from user {current_user['id']}")
        
        refactored_code = gemma_service.refactor_code(
            refactor_request.code,
            refactor_request.instructions
        )
        
        return {"refactored_code": refactored_code}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refactoring code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain_code(
    request: Request,
    explain_request: CodeExplainRequest,
    current_user: dict = Depends(get_current_user)
):
    """Explain how code works"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        logger.info(f"📖 Code explanation request from user {current_user['id']}")
        
        explanation = gemma_service.explain_code(explain_request.code)
        
        return {"explanation": explanation}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error explaining code: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fix")
async def fix_code(
    request: Request,
    fix_request: CodeFixRequest,
    current_user: dict = Depends(get_current_user)
):
    """Fix buggy code"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        logger.info(f"🐛 Code fix request from user {current_user['id']}")
        
        fixed_code = gemma_service.debug_code(
            fix_request.code,
            fix_request.error_message
        )
        
        return {"fixed_code": fixed_code}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fixing code: {e}")
        raise HTTPException(status_code=500, detail=str(e))