# AI Interview Analyzer & Career Assistant 🚀

A production-ready, full-stack AI application engineered to analyze resumes, calculate ATS scores (0-100), perform Job Description matching, conduct interactive AI mock & coding interviews, generate personalized career roadmaps, recommend motivational career movies, build ATS-friendly resumes, and present analytics.

---

## 🌟 Key Features

1. **Authentication & Profile Management**: JWT auth, profile attributes (education, experience, target job role, skills).
2. **Interactive Dashboard**: Overall Employability Index, ATS score trajectory line charts, skill radar charts, and weekly activity heatmaps using Recharts.
3. **AI Resume Analyzer & ATS Calculator**:
   - Parses PDF / DOCX files.
   - Calculates ATS Score (0-100) broken down into Formatting, Keywords, Skills Match, Experience, Education, Projects, and Certifications.
   - Highlights Strengths, Weaknesses, Missing Keywords, Missing Soft/Hard Skills, Grammar Suggestions, and AI Rewritten Summary.
4. **Job Description Matcher**: Pasting target JD calculates exact match % and missing tech stack keywords.
5. **AI Mock Interview Simulator**:
   - Select Roles (Software Engineer, Data Scientist, Frontend, Backend, AI Engineer, etc.).
   - Text-to-Speech audio question readouts & browser Web Speech API voice recognition.
   - Real-time per-answer evaluations (Confidence, Technical Accuracy, Communication, Problem Solving).
6. **Coding Interview Sandbox**: Interactive code editor supporting Python, JavaScript, Java, C++ with test case runner and AI complexity optimization feedback.
7. **Personalized Career Roadmap**: Interactive milestone timeline, weekly micro-goals, target certifications, and high-impact portfolio project suggestions.
8. **AI Learning Assistant**: Google Gemini chatbot for resume tips, behavioral STAR questions, system design guidance, and salary negotiation.
9. **Motivational Movie Recommendation System**: Filterable movie catalog (*The Pursuit of Happyness*, *The Social Network*, *Steve Jobs*, *Moneyball*, *Hidden Figures*, *The Founder*, *The Imitation Game*, *The Intern*) with posters, IMDb ratings, streaming availability, trailers, and custom AI rationale.
10. **ATS Resume Builder**: Live PDF preview with customizable templates (Modern, Minimal, Corporate, ATS-Friendly) and instant PDF download.
11. **Admin Panel**: System metrics, user directory management, and system activity logs.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Axios, Web Speech API.
- **Backend**: Python 3.10, FastAPI, Pydantic, SQLAlchemy, PyJWT, Passlib, Google GenAI SDK.
- **Database**: SQLite (Zero-config local setup) or MySQL (Production ready).
- **Deployment**: Docker & Docker Compose.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Start FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```

FastAPI interactive documentation will be live at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🐳 Docker Deployment

```bash
# Set your optional GEMINI_API_KEY in environment
export GEMINI_API_KEY="your_api_key_here"

# Build and start services using Docker Compose
docker-compose up --build
```

---

## 📄 License
MIT License.
