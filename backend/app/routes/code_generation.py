from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.routes.auth import get_current_user
from typing import Optional
import logging
from datetime import datetime
from app.services.database import get_solutions_collection, get_failures_collection
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter()

# ==================== REQUEST/RESPONSE MODELS ====================

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

# ==================== n8n INTEGRATION MODELS ====================

class N8nFixCodeRequest(BaseModel):
    """Request from n8n to fix code using Luffy AI"""
    prompt: str
    code: str
    error: str

class N8nFixCodeResponse(BaseModel):
    """Response to n8n with fixed code"""
    fixed_code: str
    success: bool
    message: str

class N8nStoreSolutionRequest(BaseModel):
    """Request from n8n to store approved solution"""
    problem_id: str
    prompt: str
    code: str
    status: str
    fix_method: Optional[str] = None

class N8nStoreSolutionResponse(BaseModel):
    """Response to n8n after storing"""
    success: bool
    message: str
    solution_id: Optional[str] = None

class N8nLogFailureRequest(BaseModel):
    """Request from n8n to log failure"""
    problem_id: str
    prompt: str
    error: str
    attempts: int

class N8nLogFailureResponse(BaseModel):
    """Response to n8n after logging"""
    success: bool
    message: str
    failure_id: Optional[str] = None

# ==================== TEST ENDPOINT (NO AUTH) ====================

@router.post("/test-generate")
async def test_generate_code(request: Request, code_request: CodeGenerationRequest):
    """TEST ENDPOINT - No authentication required"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(status_code=503, detail="Model service not initialized")
        
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

# ==================== n8n WORKFLOW ENDPOINTS (NO AUTH) ====================

@router.post("/fix_code", response_model=N8nFixCodeResponse)
async def fix_code_with_ai(request: Request, fix_request: N8nFixCodeRequest):
    """
    n8n Endpoint: Fix code using Luffy AI (NO AUTH)
    Called when FREE auto-fix tools fail
    """
    try:
        logger.info("="*80)
        logger.info("🤖 AI FIX REQUEST from n8n")
        logger.info(f"   Prompt: {fix_request.prompt[:50]}...")
        logger.info(f"   Error: {fix_request.error[:100]}...")
        logger.info("="*80)
        
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service or not gemma_service.is_loaded():
            logger.warning("⚠️ Model not loaded - returning original code")
            return N8nFixCodeResponse(
                fixed_code=fix_request.code,
                success=False,
                message="Model not loaded - unable to fix"
            )
        
        logger.info("🔧 Using Luffy AI to fix code...")
        fixed_code = gemma_service.debug_code(
            code=fix_request.code,
            error_message=fix_request.error
        )
        
        # Check if Luffy returned mock/unclear output
        if "TODO:" in fixed_code or "Load model" in fixed_code or "Model not loaded" in fixed_code:
            logger.warning("⚠️ Luffy returned mock/unclear output")
            return N8nFixCodeResponse(
                fixed_code=fix_request.code,
                success=False,
                message="AI unable to fix - unclear output"
            )
        
        logger.info("✅ Luffy AI fixed code successfully!")
        logger.info("="*80)
        return N8nFixCodeResponse(
            fixed_code=fixed_code,
            success=True,
            message="Fixed by Luffy AI"
        )
        
    except Exception as e:
        logger.error(f"❌ Error in AI fix: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return N8nFixCodeResponse(
            fixed_code=fix_request.code,
            success=False,
            message=f"Error: {str(e)}"
        )

@router.post("/store_solution", response_model=N8nStoreSolutionResponse)
async def store_solution(request: Request, solution_request: N8nStoreSolutionRequest):
    """
    n8n Endpoint: Store approved solution in MongoDB (NO AUTH)
    Stores solutions that passed tests (either naturally or after auto-fix)
    """
    try:
        logger.info("="*80)
        logger.info("💾 STORE SOLUTION from n8n")
        logger.info(f"   Problem ID: {solution_request.problem_id}")
        logger.info(f"   Status: {solution_request.status}")
        logger.info(f"   Fix Method: {solution_request.fix_method}")
        logger.info("="*80)
        
        # Get solutions collection from MongoDB
        solutions = get_solutions_collection()
        
        if solutions is None:
            logger.error("❌ Database not connected!")
            # Fallback to file storage
            try:
                import json
                import os
                solutions_dir = "solutions"
                os.makedirs(solutions_dir, exist_ok=True)
                solution_id = f"{solution_request.problem_id}_{int(datetime.utcnow().timestamp())}"
                filename = f"{solutions_dir}/{solution_id}.json"
                
                solution_data = {
                    "problem_id": solution_request.problem_id,
                    "prompt": solution_request.prompt,
                    "code": solution_request.code,
                    "status": solution_request.status,
                    "fix_method": solution_request.fix_method or "none",
                    "created_at": datetime.utcnow().isoformat(),
                    "language": "python"
                }
                
                with open(filename, 'w') as f:
                    json.dump(solution_data, f, indent=2)
                
                logger.warning(f"⚠️ Stored to file instead: {filename}")
                return N8nStoreSolutionResponse(
                    success=True,
                    message="Solution stored to file (DB unavailable)",
                    solution_id=solution_id
                )
            except Exception as file_error:
                logger.error(f"❌ File storage also failed: {file_error}")
                return N8nStoreSolutionResponse(
                    success=False,
                    message="Database and file storage failed",
                    solution_id=None
                )
        
        # Create solution document for MongoDB
        solution_data = {
            "problem_id": solution_request.problem_id,
            "prompt": solution_request.prompt,
            "code": solution_request.code,
            "status": solution_request.status,
            "fix_method": solution_request.fix_method or "none",
            "created_at": datetime.utcnow(),
            "language": "python",
            "user_id": None  # n8n requests don't have user context
        }
        
        # Insert into MongoDB
        result = await solutions.insert_one(solution_data)
        solution_id = str(result.inserted_id)
        
        logger.info(f"✅ Solution stored in MongoDB successfully!")
        logger.info(f"   MongoDB ID: {solution_id}")
        logger.info(f"   Code length: {len(solution_request.code)} chars")
        logger.info("="*80)
        
        return N8nStoreSolutionResponse(
            success=True,
            message="Solution stored successfully in MongoDB",
            solution_id=solution_id
        )
        
    except Exception as e:
        logger.error(f"❌ Error storing solution: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return N8nStoreSolutionResponse(
            success=False,
            message=f"Error: {str(e)}",
            solution_id=None
        )

@router.post("/log_failure", response_model=N8nLogFailureResponse)
async def log_failure(request: Request, failure_request: N8nLogFailureRequest):
    """
    n8n Endpoint: Log failed attempts in MongoDB (NO AUTH)
    Called when code fails after all fixing attempts (including AI)
    """
    try:
        logger.info("="*80)
        logger.warning("❌ LOG FAILURE from n8n")
        logger.warning(f"   Problem ID: {failure_request.problem_id}")
        logger.warning(f"   Attempts: {failure_request.attempts}")
        logger.warning(f"   Error: {failure_request.error[:200]}...")
        logger.info("="*80)
        
        # Get failures collection from MongoDB
        failures = get_failures_collection()
        
        if failures is None:
            logger.error("❌ Database not connected!")
            # Fallback to file storage
            try:
                import json
                import os
                failures_dir = "failures"
                os.makedirs(failures_dir, exist_ok=True)
                failure_id = f"FAIL_{failure_request.problem_id}_{int(datetime.utcnow().timestamp())}"
                filename = f"{failures_dir}/{failure_id}.json"
                
                failure_data = {
                    "problem_id": failure_request.problem_id,
                    "prompt": failure_request.prompt,
                    "error": failure_request.error,
                    "attempts": failure_request.attempts,
                    "created_at": datetime.utcnow().isoformat(),
                    "status": "failed"
                }
                
                with open(filename, 'w') as f:
                    json.dump(failure_data, f, indent=2)
                
                logger.warning(f"⚠️ Failure saved to file instead: {filename}")
                return N8nLogFailureResponse(
                    success=True,
                    message=f"Failure logged to file after {failure_request.attempts} attempts",
                    failure_id=failure_id
                )
            except Exception as file_error:
                logger.error(f"❌ File storage also failed: {file_error}")
                return N8nLogFailureResponse(
                    success=False,
                    message="Database and file storage failed",
                    failure_id=None
                )
        
        # Create failure document for MongoDB
        failure_data = {
            "problem_id": failure_request.problem_id,
            "prompt": failure_request.prompt,
            "error": failure_request.error,
            "attempts": failure_request.attempts,
            "created_at": datetime.utcnow(),
            "status": "failed"
        }
        
        # Insert into MongoDB
        result = await failures.insert_one(failure_data)
        failure_id = str(result.inserted_id)
        
        logger.warning(f"⚠️ Failure logged in MongoDB: {failure_id}")
        logger.warning(f"⚠️ This problem needs manual review!")
        logger.info("="*80)
        
        return N8nLogFailureResponse(
            success=True,
            message=f"Failure logged in MongoDB after {failure_request.attempts} attempts",
            failure_id=failure_id
        )
        
    except Exception as e:
        logger.error(f"❌ Error logging failure: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return N8nLogFailureResponse(
            success=False,
            message=f"Error: {str(e)}",
            failure_id=None
        )

# ==================== AUTHENTICATED ENDPOINTS ====================

@router.post("/generate", response_model=CodeResponse)
async def generate_code(
    request: Request,
    code_request: CodeGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate code based on prompt (requires authentication)"""
    try:
        gemma_service = request.app.state.gemma_service
        
        if not gemma_service:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please try again later."
            )
        
        logger.info(f"📝 Code generation request from user {current_user['id']}")
        logger.info(f"   Prompt: {code_request.prompt[:100]}...")
        
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
    """Refactor existing code (requires authentication)"""
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
    """Explain how code works (requires authentication)"""
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
    """Fix buggy code (requires authentication)"""
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