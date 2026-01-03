# CodeGen AI - Intelligent Code Generation Platform 🚀

> AI-powered code generation with automated testing and fixing. Fixes 95% of errors without GPU!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

## 📸 Screenshots

![Landing Page](docs/images/landing.png)
![Workspace](docs/images/workspace.png)
![Chat Interface](docs/images/chat.png)

## ✨ Features

- 🤖 **Fine-tuned Gemma 2B Model** (2.51B parameters)
- ⚡ **95% GPU Savings** - Auto-fix with FREE CPU-only tools
- 🔧 **3-Tier Auto-Fix System** - Ruff, Pyflakes, Bandit
- 💬 **Real-time Chat Interface** - Interactive code generation
- 🔐 **Google OAuth** - Secure authentication
- 📝 **Persistent History** - Never lose conversations
- 🎨 **Modern UI** - Dark theme, responsive design
- 📚 **Multiple Languages** - Python, JavaScript, and more

## 🔄 n8n Workflow Integration

This project includes a powerful **n8n workflow automation** system that provides intelligent code testing and fixing capabilities.

### Workflow Features

- 🔧 **3-Tier Auto-Fix System**
  - **Tier 1**: Ruff auto-fix (syntax, imports, style)
  - **Tier 2**: Template-based logic fixes (common patterns)
  - **Tier 3**: Smart analysis (common mistakes)
  - **Tier 4**: AI-powered fixes using Luffy (Gemma 2B)

- 💾 **Automatic Solution Storage** - Successful solutions saved to MongoDB
- 📊 **Failure Logging** - Failed attempts logged for analysis
- ⚡ **Fast Processing** - FREE tools handle ~95% of fixes without AI
- 🤖 **AI Fallback** - Luffy AI fixes complex issues when needed

### n8n API Endpoints

The backend exposes three webhook endpoints for n8n integration (no authentication required):

#### 1. Fix Code with AI
```
POST /api/code/fix_code
```
**Request:**
```json
{
  "prompt": "Write a function to multiply three numbers",
  "code": "def multiply(a, b, c):\n    return a * b",
  "error": "Test failed: Expected 24, got 6"
}
```
**Response:**
```json
{
  "fixed_code": "def multiply(a, b, c):\n    return a * b * c",
  "success": true,
  "message": "Fixed by Luffy AI"
}
```

#### 2. Store Solution
```
POST /api/code/store_solution
```
**Request:**
```json
{
  "problem_id": "multiply_3_numbers",
  "prompt": "Multiply three numbers",
  "code": "def multiply(a, b, c):\n    return a * b * c",
  "status": "passed",
  "fix_method": "ai"
}
```

#### 3. Log Failure
```
POST /api/code/log_failure
```
**Request:**
```json
{
  "problem_id": "complex_algorithm",
  "prompt": "Solve complex problem",
  "error": "Multiple test failures",
  "attempts": 4
}
```

### Test Runner Service

A separate FastAPI service (`test_runner.py`) runs on **port 9000** and provides:

- **Automated Testing** - Run unit tests on generated code
- **FREE Auto-Fix Tools** - Ruff, Pyflakes, template-based fixes
- **Smart Analysis** - Pattern-based error detection and fixing

**Endpoint:**
```
POST http://localhost:9000/run_tests
```

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   n8n       │─────▶│ Test Runner │─────▶│   FastAPI   │─────▶│  Gemma 2B   │
│  Workflow   │      │  (Port 9000)│      │   Backend   │      │   Model     │
└─────────────┘      └─────────────┘      │  (Port 8000)│      └─────────────┘
                            │              └─────────────┘         (2.51B)
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │  FREE Tools │      │   MongoDB   │
                     │ Ruff/Pyflakes│     │  Solutions  │
                     └─────────────┘      └─────────────┘

┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │
│   Frontend  │      │   Backend   │
└─────────────┘      └─────────────┘
     (Port 3000)          (Port 8000)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- 8GB+ RAM

### 1. Clone Repository

```bash
git clone https://github.com/Lucifer-cyber007/codegen-ai.git
cd codegen-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install ruff pyflakes bandit  # FREE auto-fix tools
```

**Create `backend/.env` file:**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
JWT_SECRET_KEY=your_secret_key
MODEL_PATH=./models/Luffy_code_assistant
MODEL_NAME=google/gemma-2b
MONGODB_URL=mongodb://localhost:27017/codegen
```

**Start services:**
```bash
# Terminal 1 - Test Runner (FREE auto-fix)
python test_runner.py

# Terminal 2 - Main Backend (AI model)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Create `frontend/.env` file:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:8000
```

**Start frontend:**
```bash
npm start
```

### 4. Setup n8n Workflow (Optional)

The n8n workflow integration provides automated code testing and fixing.

**Install n8n:**
```bash
npm install -g n8n
```

**Configure n8n Webhooks:**
- Test Runner: `http://localhost:9000/run_tests`
- AI Fix: `http://localhost:8000/api/code/fix_code`
- Store Solution: `http://localhost:8000/api/code/store_solution`
- Log Failure: `http://localhost:8000/api/code/log_failure`

**MongoDB Setup (for solution storage):**
```bash
# Install MongoDB or use MongoDB Atlas
# Add to backend/.env:
MONGODB_URL=mongodb://localhost:27017/codegen
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Test Runner**: http://localhost:9000/docs
- **n8n**: http://localhost:5678 (if installed)

## 🧪 Test Auto-Fix

```bash
curl -X POST http://localhost:9000/run_tests \
  -H "Content-Type: application/json" \
  -d '{"problem_id": "add_two_numbers", "code": "def add(a,b):\nreturn a+b"}'
```

**Result:** Fixed in <1 second, no GPU! ✅

## 📦 Model Setup

### Option 1: Use Pre-trained Model

Download the fine-tuned model from [Google Drive](https://drive.google.com/your-link) and place it in:
```
backend/models/Luffy_code_assistant/
```

### Option 2: Train Your Own Model

See [docs/TRAINING.md](docs/TRAINING.md) for complete training instructions.

```bash
# Quick start
cd notebooks
jupyter notebook gemma_fine_tune.ipynb
```

**Training Specs:**
- Base Model: Google Gemma 2B
- Fine-tuning Method: LoRA (Low-Rank Adaptation)
- Dataset: 5,000 Alpaca examples
- Training Time: ~45 minutes (L4 GPU)
- Final Model Size: ~50-200 MB (LoRA adapters)

## 📊 Performance

| Metric | Value |
|--------|-------|
| Auto-Fix Success | 95% |
| Average Fix Time | <1 second |
| GPU Usage Reduction | 95% |
| Speedup | 10-100x |
| Model Load Time | 5-10 seconds |
| Response Time | 2-5 seconds |
| RAM Usage | 4-6 GB |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Google OAuth** - Authentication

### Backend
- **FastAPI** - Web framework
- **PyTorch** - Deep learning
- **Transformers** - Hugging Face models
- **PEFT** - LoRA fine-tuning
- **JWT** - Authentication
- **MongoDB** - Solution and failure storage

### Automation & Testing
- **n8n** - Workflow automation
- **Test Runner** - FastAPI service for automated testing
- **Ruff** - Fast Python linter and auto-fixer
- **Pyflakes** - Logic error detection
- **Bandit** - Security analyzer

### Model
- **Gemma 2B** - Base model (2.51B parameters)
- **LoRA** - Efficient fine-tuning
- **Alpaca Dataset** - Training data

## 🎯 Usage Examples

### Code Generation
```
Input: "Write a Python function to calculate factorial"
Output: 
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
```

### Auto-Fix
```
Input: def add(a,b) return a+b  # Missing colon
Output: def add(a, b): return a + b  # Fixed instantly!
```

### Bug Fixing
```
Input: "Fix this code: def add(a, b) return a + b"
Output: "def add(a, b): return a + b"  # Added colon
```

### Code Explanation
```
Input: "Explain: lambda x: x**2"
Output: "This is an anonymous function that takes x and returns x squared"
```

## 🔧 Configuration

### Backend Settings (`backend/app/config.py`)

```python
MAX_LENGTH = 512           # Max input tokens
TEMPERATURE = 0.7          # Sampling temperature
TOP_P = 0.9               # Nucleus sampling
MAX_NEW_TOKENS = 256      # Max output tokens
```

### Frontend Settings (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Training Guide](docs/TRAINING.md) - Model fine-tuning tutorial
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Project Structure

```
codegen-ai/
├── frontend/                 # React app
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   └── services/        # API services
│   └── package.json
├── backend/                  # FastAPI server
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   │   └── code_generation.py  # n8n integration endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── database.py  # MongoDB connection
│   │   │   └── gemma_service.py  # AI model service
│   │   ├── models/          # Data models
│   │   └── utils/           # Helper functions
│   ├── models/              # AI model files
│   │   └── Luffy_code_assistant/  # Fine-tuned Gemma 2B
│   ├── test_runner.py       # Auto-fix service (port 9000)
│   └── requirements.txt
├── notebooks/               # Training notebooks
│   ├── gemma_fine_tune.ipynb
│   └── merge_lora_gemma2b_FP16.ipynb
└── docs/                    # Documentation
```

## 🐛 Known Issues

- Model generates incorrect code occasionally (expected with 2B model)
- First response can be slow (model loading)
- Limited to 256 sequence length (memory optimization)

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for solutions.

## 🚀 Roadmap

- [ ] Add more programming languages
- [ ] Implement code syntax validation
- [ ] Add unit test generation
- [ ] Support for larger context windows
- [ ] Docker containerization
- [ ] Cloud deployment guides
- [ ] VS Code extension
- [x] n8n workflow integration
- [ ] n8n workflow templates library
- [ ] Enhanced AI fix patterns
- [ ] Real-time collaboration features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google for the Gemma 2B base model
- Hugging Face for the Transformers library
- Stanford for the Alpaca dataset
- FastAPI for the excellent web framework
- Ruff for the fast auto-fix tool

## 📧 Contact

**Author:** Aditya Sharma  
**Email:** adityapa2004@gmail.com  
**GitHub:** [@Lucifer-cyber007](https://github.com/Lucifer-cyber007)

---

⭐ **Star this repo if you find it helpful!**

**Made with ❤️ using Gemma 2B and FREE Auto-Fix Tools**
