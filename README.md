# CodeGen AI - Full Stack Code Generation Platform 🚀

> AI-powered code generation platform using fine-tuned Gemma 2B model with React frontend and FastAPI backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

## 📸 Screenshots

![Landing Page](docs/images/landing.png)
![Workspace](docs/images/workspace.png)
![Chat Interface](docs/images/chat.png)

## ✨ Features

- 🤖 **Fine-tuned Gemma 2B Model** - Specialized for code generation
- 💬 **Real-time Chat Interface** - Interactive code assistance
- 📝 **Persistent Chat History** - Never lose your conversations
- 🔐 **Google OAuth** - Secure authentication
- 🎨 **Modern UI** - Dark theme with responsive design
- ⚡ **Fast Performance** - Optimized model inference
- 📚 **Multiple Languages** - Python, JavaScript, and more

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │─────▶│  Gemma 2B   │
│   Frontend  │      │   Backend   │      │   Model     │
└─────────────┘      └─────────────┘      └─────────────┘
     (Port 3000)          (Port 8000)         (3.03B params)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- 8GB+ RAM
- CUDA GPU (optional, for training)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codegen-ai.git
cd codegen-ai
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Create `.env` file:**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET_KEY=your_secret_key
MODEL_PATH=./models/Luffy_code_assistant
```

**Start backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

**Create `.env` file:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:8000
```

**Start frontend:**
```bash
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs

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

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation instructions
- [Training Guide](docs/TRAINING.md) - Model fine-tuning tutorial
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Google OAuth** - Authentication

### Backend
- **FastAPI** - Web framework
- **PyTorch** - Deep learning
- **Transformers** - Hugging Face models
- **PEFT** - LoRA fine-tuning
- **JWT** - Authentication

### Model
- **Gemma 2B** - Base model (Google)
- **LoRA** - Efficient fine-tuning
- **Alpaca Dataset** - Training data
- **3.03B parameters** - Model size

## 📊 Performance

| Metric | Value |
|--------|-------|
| Model Load Time | 5-10 seconds |
| Response Time | 2-5 seconds |
| RAM Usage | 4-6 GB |
| Model Size | 50-200 MB (LoRA) |
| Training Time | 45 minutes (5K examples) |

## 🎯 Usage Examples

### Code Completion
```
Input: "Write a Python function to calculate factorial"
Output: 
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
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
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   └── services/        # API services
│   └── package.json
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   └── utils/           # Helper functions
│   ├── models/              # AI models
│   └── requirements.txt
├── notebooks/               # Jupyter notebooks
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google for the Gemma 2B base model
- Hugging Face for the Transformers library
- Stanford for the Alpaca dataset
- FastAPI for the excellent web framework

## 📧 Contact

- **Author**: Your Name
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/codegen-ai&type=Date)](https://star-history.com/#yourusername/codegen-ai&Date)

---

**Made with ❤️ using Gemma 2B and React**
