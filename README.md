# NexHire AI — AI Placement Readiness & Career Platform 🚀

A comprehensive, enterprise-grade AI career and placement preparation platform engineered to analyze resumes, calculate ATS scores, verify technical claims, conduct 7-round project defense vivas, simulate high-pressure technical interviews, diagnose topic-level weaknesses, provide personalized 7-day recovery curricula, and prepare candidates for top target companies.

---

## 🌟 Advanced Placement Readiness Features

1. **AI Resume Claim Verification (`/resume-claim-verification`)**:
   - Automatically extracts high-stakes technical claims from uploaded resumes or candidate profiles.
   - 4-question technical examination stepper verifying foundational understanding, architecture, trade-offs, and error handling.
   - Evaluates Technical Accuracy, Understanding, Confidence, and Communication.
   - Provides polite, constructive evidence analysis without accusatory language.

2. **AI Project Defense / Viva Mode (`/project-defense`)**:
   - Strict technical examiner conducting a multi-round viva on candidate projects.
   - **7 Rounds**: Project Overview, Technology Stack, Architecture & Data Flow, Implementation, "Why" Trade-off Justifications, Edge Cases & Challenges, and Deep Cross-Questioning reactive to candidate answers.
   - Generates comprehensive viva scorecards with strengths, weaknesses, and targeted practice recommendations.

3. **AI Interview Pressure Mode (`/mock-interview`)**:
   - Three selectable modes: **Normal** (supportive), **Technical** (in-depth), and **Pressure** (adversarial bar-raiser).
   - Pressure mode actively challenges weak explanations, asks for production code examples, tracks response latency, and evaluates **Pressure Resilience**.

4. **AI Weakness Radar & Drill-Down (`/dashboard`)**:
   - Cross-system diagnostic radar evaluating DSA, SQL, Python, Technical Interview, Projects Defense, Communication, and Resume.
   - Interactive drill-down modal uncovering sub-topic performance (Arrays, Strings, HashMaps, Trees, Graphs) with actionable diagnostic explanations.

5. **AI Weakness → Personalized 7-Day Practice (`/dashboard`)**:
   - Converts diagnosed weaknesses directly into custom 7-day recovery plans tailored to the candidate's exact diagnostic score.
   - Features daily milestone targets, coding challenges, concept deep dives, and interactive progress tracking.

6. **AI Retest & Improvement Tracking (`/dashboard`)**:
   - Candidates retest their diagnosed weak topics after completing recommended practice.
   - Visual Before-vs-After comparison demonstrating tangible score improvements (e.g., `+25 DSA`, `+11 SQL`).
   - Maintains full historical assessment records in `ReadinessSnapshot` without overwriting past data.

7. **Unified Placement Readiness Score (`/dashboard`)**:
   - Single readiness metric (`XX / 100`) with clear status indicators (*Ready*, *Almost Ready*, *Needs Preparation*).
   - Configurable backend category weights across Resume (15%), DSA (20%), SQL (15%), Technical Interview (20%), Projects (15%), and Communication (15%).

8. **Target Company Preparation (`/company-prep`)**:
   - Customized prep plans for companies like **TCS**, **Infosys**, **Google**, **Amazon**, **Microsoft**, or custom startups.
   - Tailored high-yield DSA topics, SQL queries, company interview questions, project viva prompts, and multi-week schedules.

---

## 🛠️ Additional Core Capabilities

- **AI Resume Analyzer & ATS Calculator**: PDF / DOCX resume parsing with detailed category breakdowns, missing keywords, and AI-rewritten summaries.
- **Job Description Matcher**: Analyzes job descriptions against candidate profiles with percentage match and gap analysis.
- **Coding Interview Sandbox**: Live multi-language code runner (Python, JavaScript, Java, C++) with complexity optimization feedback.
- **Personalized Career Roadmap**: Interactive milestone timeline with micro-goals and certifications.
- **AI Learning Assistant**: Google Gemini-powered career chatbot for interview preparation and system design guidance.
- **ATS Resume Builder**: Live PDF preview with customizable templates and one-click PDF generation.
- **System Administration Portal**: Administrator dashboard for managing users, tracking platform analytics, and reviewing audit logs.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Axios, Web Speech API.
- **Backend**: Python 3.10+, FastAPI, Pydantic, SQLAlchemy, PyJWT, Passlib, Google GenAI SDK (Gemini).
- **Database**: SQLite (Zero-config local setup) or MySQL (Production ready).
- **Deployment**: Docker & Docker Compose.

---

## 🚀 Quick Start Guide

### One-Click Launch (Windows)
Double-click `run.bat` in the project root to start both Backend (`http://localhost:8000`) and Frontend (`http://localhost:3000`) automatically.

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI dev server:
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at `http://localhost:8000/docs`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
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
