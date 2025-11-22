# app/services/gemma_service.py
import torch
import logging
import re
from typing import Optional
from app.config import settings
import os

logger = logging.getLogger(__name__)

class GemmaService:
    """
    Service for fine-tuned Gemma 2B merged model
    Uses Alpaca prompt format (matching training)
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.loaded = False
        
        logger.info(f"Initializing Gemma Service on device: {self.device}")
        
        if os.path.exists(settings.MODEL_PATH):
            logger.info(f"✅ Model path found: {settings.MODEL_PATH}")
            try:
                self._load_model()
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                import traceback
                logger.error(traceback.format_exc())
                logger.warning("⚠️ Service will operate in MOCK MODE")
        else:
            logger.warning(f"⚠️ Model path not found: {settings.MODEL_PATH}")
            logger.warning("⚠️ Service will operate in MOCK MODE")
    
    def _load_model(self):
        """Load merged Gemma model directly"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            
            # Step 1: Load tokenizer
            logger.info(f"📥 Loading tokenizer from: {settings.MODEL_PATH}")
            self.tokenizer = AutoTokenizer.from_pretrained(
                settings.MODEL_PATH,
                trust_remote_code=True,
                local_files_only=True
            )
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                self.tokenizer.pad_token_id = self.tokenizer.eos_token_id
            
            logger.info("✅ Tokenizer loaded")
            
            # Step 2: Load model directly (it's already merged!)
            logger.info(f"📥 Loading merged model from: {settings.MODEL_PATH}")
            logger.info("⏳ This may take 1-2 minutes...")
            
            self.model = AutoModelForCausalLM.from_pretrained(
                settings.MODEL_PATH,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                low_cpu_mem_usage=True,
                trust_remote_code=True,
                local_files_only=True
            )
            
            # Move to device if not using device_map
            if self.device == "cpu":
                self.model = self.model.to(self.device)
            
            self.model.eval()
            self.loaded = True
            
            # Log info
            num_params = sum(p.numel() for p in self.model.parameters()) / 1e9
            logger.info(f"✅ Model loaded successfully!")
            logger.info(f"📊 Parameters: {num_params:.2f}B")
            logger.info(f"📊 Device: {next(self.model.parameters()).device}")
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            import traceback
            logger.error(traceback.format_exc())
            self.loaded = False
    
    def _format_prompt(self, instruction: str, input_text: str = "") -> str:
        """
        Alpaca format - MUST match your training!
        """
        if input_text:
            return f"""Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Input:
{input_text}

### Response:
"""
        else:
            return f"""Below is an instruction that describes a task. Write a response that appropriately completes the request.

### Instruction:
{instruction}

### Response:
"""
    
    def _extract_response(self, full_output: str) -> str:
        """Extract only the response part and clean garbage"""
        if "### Response:" in full_output:
            response = full_output.split("### Response:")[-1].strip()
        else:
            response = full_output.strip()
        
        # Clean up trailing patterns
        for pattern in ["### Instruction:", "Below is an instruction", "###", "/code", "\n\n\n"]:
            if pattern in response:
                response = response.split(pattern)[0].strip()
        
        # Remove garbage number sequences (like "2.3.4.5.6.7...")
        garbage_pattern = r'\d+\.\d+\.\d+\.\d+[\d\.]*'
        if re.search(garbage_pattern, response):
            match = re.search(garbage_pattern, response)
            if match:
                response = response[:match.start()].strip()
        
        # Remove garbage like "3D:2.3.4..." or similar
        garbage_pattern2 = r'[A-Z0-9]{1,3}:\d+\.\d+'
        if re.search(garbage_pattern2, response):
            match = re.search(garbage_pattern2, response)
            if match:
                response = response[:match.start()].strip()
        
        # Remove trailing incomplete lines that are just numbers
        lines = response.split('\n')
        clean_lines = []
        for line in lines:
            # Skip lines that are just numbers or garbage
            if re.match(r'^[\d\.\s,]+$', line.strip()) and len(line.strip()) > 10:
                break
            # Skip lines with excessive dots/numbers pattern
            if re.match(r'.*\d+\.\d+\.\d+\.\d+.*', line):
                break
            clean_lines.append(line)
        
        return '\n'.join(clean_lines).strip()
    
    def _is_garbage_output(self, text: str) -> bool:
        """Check if output is garbage"""
        if not text or len(text) < 5:
            return True
        non_ascii = sum(1 for c in text if ord(c) > 127)
        if non_ascii > len(text) * 0.3:
            return True
        if not any(c.isalpha() for c in text):
            return True
        # Check for repetitive patterns
        words = text.split()
        if len(words) > 10 and len(set(words)) < len(words) * 0.3:
            return True
        return False
    
    def is_loaded(self) -> bool:
        return self.loaded
    
    def generate_code(
        self, 
        prompt: str, 
        max_length: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50,
    ) -> str:
        """Generate code using Alpaca format"""
        if not self.loaded:
            return self._mock_generate_code(prompt)
        
        try:
            logger.info(f"🚀 Generating: {prompt[:50]}...")
            
            instruction = f"Write Python code for: {prompt}"
            formatted_prompt = self._format_prompt(instruction)
            
            inputs = self.tokenizer(
                formatted_prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                )
            
            full_output = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = self._extract_response(full_output)
            
            if self._is_garbage_output(response):
                logger.warning("⚠️ Garbage output detected")
                return self._mock_generate_code(prompt)
            
            logger.info("✅ Generation complete")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return self._mock_generate_code(prompt)
    
    def explain_code(self, code: str, max_length: int = 256) -> str:
        """Explain code"""
        if not self.loaded:
            return self._mock_explain_code(code)
        
        try:
            instruction = "Explain what this code does in detail"
            formatted_prompt = self._format_prompt(instruction, code)
            
            inputs = self.tokenizer(
                formatted_prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    temperature=0.5,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                )
            
            full_output = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = self._extract_response(full_output)
            
            if self._is_garbage_output(response):
                return self._mock_explain_code(code)
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return self._mock_explain_code(code)
    
    def debug_code(self, code: str, error_message: str = None) -> str:
        """Fix buggy code"""
        if not self.loaded:
            return self._mock_debug_code(code, error_message)
        
        try:
            if error_message:
                instruction = f"Fix the bugs in this code. Error: {error_message}"
            else:
                instruction = "Fix any bugs in this code"
            
            formatted_prompt = self._format_prompt(instruction, code)
            
            inputs = self.tokenizer(
                formatted_prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=256,
                    temperature=0.5,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                )
            
            full_output = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = self._extract_response(full_output)
            
            if self._is_garbage_output(response):
                return self._mock_debug_code(code, error_message)
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return self._mock_debug_code(code, error_message)
    
    def refactor_code(self, code: str, instructions: str = "", max_length: int = 256) -> str:
        """Refactor code"""
        if not self.loaded:
            return self._mock_refactor_code(code, instructions)
        
        try:
            if instructions:
                instruction = f"Refactor this code: {instructions}"
            else:
                instruction = "Refactor this code to be cleaner and more efficient"
            
            formatted_prompt = self._format_prompt(instruction, code)
            
            inputs = self.tokenizer(
                formatted_prompt,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    temperature=0.6,
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.2,
                )
            
            full_output = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            response = self._extract_response(full_output)
            
            if self._is_garbage_output(response):
                return self._mock_refactor_code(code, instructions)
            return response
            
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return self._mock_refactor_code(code, instructions)
    
    # ==================== MOCK METHODS ====================
    
    def _mock_generate_code(self, prompt: str) -> str:
        return f"""```python
# Generated for: {prompt}

def solution():
    \"\"\"
    TODO: Implement {prompt}
    \"\"\"
    pass

if __name__ == "__main__":
    result = solution()
    print(result)
```

⚠️ **Note**: Model not loaded or output unclear.
"""
    
    def _mock_explain_code(self, code: str) -> str:
        lines = len(code.split('\n'))
        return f"""## Code Explanation

This code has **{lines} lines**.

*Load model for detailed analysis.*
"""
    
    def _mock_debug_code(self, code: str, error: str = None) -> str:
        return f"""## Debug Analysis

**Error:** {error or 'Not specified'}

**Suggestions:**
1. Check variable names
2. Add error handling
3. Test edge cases
"""
    
    def _mock_refactor_code(self, code: str, instructions: str) -> str:
        return f"""## Refactored Code

**Instructions:** {instructions or 'General cleanup'}

*Load model for actual refactoring.*
"""


# Global singleton
_gemma_service = None

def get_gemma_service() -> GemmaService:
    global _gemma_service
    if _gemma_service is None:
        _gemma_service = GemmaService()
    return _gemma_service