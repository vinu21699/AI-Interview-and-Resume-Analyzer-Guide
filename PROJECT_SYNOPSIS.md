# PROJECT SYNOPSIS

## 1. Project Title
**AI-Powered Interview Analyzer, Career Assistant & 100% ATS-Compliant Resume Engineering Platform**

---

## 2. Executive Summary / Abstract
In the modern technical recruitment landscape, over 75% of submitted resumes are automatically filtered out by Applicant Tracking Systems (ATS) before ever reaching a human recruiter. Simultaneously, candidates struggle to quantify their real-world impact using industry-standard frameworks (such as the STAR methodology) and lack targeted preparation for technical and behavioral interviews.

This project delivers a comprehensive, full-stack career acceleration ecosystem designed to close these gaps. The platform combines:
1. An intelligent **ATS Resume Analyzer** utilizing multi-stage stream text extraction and a 6-factor weighted scoring algorithm.
2. A dedicated **100% ATS Resume Builder & AI Generator** that produces company-ready, high-contrast, ATS-compliant resumes formatted in industry-approved typography (`Arial / Calibri`) with direct client-side PDF rendering.
3. A **Job Description Matcher** for targeted keyword alignment and gap analysis.
4. An **AI Mock Technical & Behavioral Interview Suite** with real-time feedback.
5. An interactive **Career Roadmap & Analytics Dashboard** featuring zero-state onboarding and live trajectory tracking.

---

## 3. Problem Statement
Job seekers and candidates encounter major hurdles when navigating automated hiring funnels:
- **ATS Parsing Failures:** Complex multi-column layouts, graphics, non-standard fonts, and tables frequently cause parsers (e.g., Workday, Taleo, Greenhouse, Lever) to fail to extract text accurately.
- **Static & Generic Resume Content:** Resumes often lack quantifiable metrics (percentages, throughput, dollar savings) and job-specific technical keywords.
- **Unrealistic Assessment Tools:** Existing online resume graders often produce arbitrary, static scores that do not reflect candidate improvements or changes in text density.
- **Fragmented Preparation Tools:** Candidates must switch between separate platforms for resume building, job matching, technical interview prep, and coding assessments.

---

## 4. Objectives of the Project
- **Develop a Deterministic & AI-Assisted ATS Evaluation Engine:** Provide authentic, mathematically grounded scoring (0–100%) across six weighted evaluation pillars.
- **Automate 100% ATS-Compliant Resume Generation:** Build a resume creation tool that adheres strictly to single-column standards, approved typography, categorized skill matrices, and STAR-based achievements.
- **Direct Client-Side Document Export:** Implement direct system PDF generation via `html2pdf.js` eliminating browser print dialogs, URL footers, and unwanted webpage headers.
- **Contextual Job Matching:** Align candidate resumes against real-world job descriptions to highlight missing technical competencies and soft skills.
- **Holistic Interview & Career Preparation:** Integrate mock interview simulations, coding environments, and 4-month structured career roadmaps.

---

## 5. System Architecture & Methodology

```
+---------------------------------------------------------------------------------+
|                                PRESENTATION TIER                                |
|   React 18 + Vite SPA | Tailwind CSS | Framer Motion | Recharts | html2pdf.js   |
|   (Dashboard, Resume Builder, Analyzer, Job Match, Mock Interview, Roadmap)     |
+---------------------------------------------------------------------------------+
                                      |  HTTP / REST (Axios)
                                      v
+---------------------------------------------------------------------------------+
|                                APPLICATION TIER                                 |
|                       FastAPI (Python 3.11) + Uvicorn                           |
|   - Authentication & JWT Middleware                                             |
|   - Multi-Stage Stream Resume Text Extractor (PyPDF2 + Stream Regex Recovery)    |
|   - Dynamic ATS Scoring & Gap Analyzer                                          |
|   - Google Gemini 2.5 Flash GenAI Engine & Fallback Heuristic System            |
+---------------------------------------------------------------------------------+
                                      |  SQLAlchemy ORM
                                      v
+---------------------------------------------------------------------------------+
|                                   DATA TIER                                     |
|              SQLite / Relational Database Engine                                |
|   - Users & Profiles | Resumes & Analyses | Job Matches | Interview Sessions    |
+---------------------------------------------------------------------------------+
```

### Dynamic Multi-Factor ATS Scoring Formula
The platform computes authentic resume health using a multi-factor weighted equation:

$$\text{ATS Score} = (0.20 \times \text{FMT}) + (0.25 \times \text{KW}) + (0.20 \times \text{SK}) + (0.20 \times \text{EXP}) + (0.08 \times \text{EDU}) + (0.07 \times \text{PROJ})$$

- **Formatting ($\text{FMT}$):** Validates standard structural headers (`SUMMARY`, `SKILLS`, `EXPERIENCE`, `EDUCATION`, `PROJECTS`) and optimal word count ($150 \le \text{words} \le 700$).
- **Keyword Density ($\text{KW}$):** Evaluates presence of targeted technical terms against an active 150+ technology domain dictionary.
- **Skills Matrix ($\text{SK}$):** Assesses categorized technical skills across Languages, Frameworks, Databases, and Cloud/DevOps tools.
- **Experience Quality ($\text{EXP}$):** Detects strong action verbs (*Spearheaded*, *Architected*, *Optimized*) and quantitative metrics ($99.9\%$, $45\%$, $\$150\text{k}$).
- **Education ($\text{EDU}$) & Projects ($\text{PROJ}$):** Evaluates academic background and portfolio links (GitHub, live deployment URLs).

---

## 6. Key Modules & Features

| Module | Description | Technical Details |
| :--- | :--- | :--- |
| **1. Resume Analyzer** | Uploads and parses candidate resumes in PDF, DOCX, or TXT format. Evaluates ATS compatibility score and identifies present vs. missing competencies. | Multi-tier text extraction (`PyPDF2` + stream regex), 6-pillar score breakdown, dynamic personalized feedback. |
| **2. 100% ATS Resume Generator** | Generates an optimized, single-column resume document incorporating missing skills and STAR-formatted metrics. | Clean A4 card rendering, explicit `Arial/Calibri` typography, direct system PDF download via `html2pdf.js`. |
| **3. Resume Builder from Scratch** | Full form-based resume builder with dedicated fields for LinkedIn, GitHub, Portfolio URL, Contact Phone, and Categorized Skills. | Real-time live ATS document preview, instant PDF generation with no web-UI artifacts. |
| **4. Job Description Matcher** | Compares resume text with target job descriptions to compute alignment index and missing keywords. | Natural language matching, tech vs. soft skill classification, tailored experience gap analysis. |
| **5. AI Mock Interview Suite** | Simulates technical, behavioral, and managerial interview scenarios with immediate AI evaluation. | Scoring across confidence, grammar, technical accuracy, and communication with sample answers. |
| **6. Coding Interview Environment** | Integrated coding sandbox for algorithmic interview prep with automated test case evaluation. | Multi-language coding sandbox with code execution feedback. |
| **7. Career Roadmap & Analytics** | 4-month structured career roadmap and real-time candidate analytics tracking ATS trajectory. | Zero-state onboarding (shows 0% for new users), Recharts competency radar, score progression curves. |

---

## 7. Technical Specifications

### Hardware & Environment Requirements
- **Development OS:** Windows 10/11, Linux, or macOS
- **Processor:** Intel Core i5 / AMD Ryzen 5 or higher
- **RAM:** Minimum 8 GB (16 GB recommended)
- **Disk Space:** 500 MB for source repository and virtual environment

### Software Stack
- **Frontend Framework:** React 18 (Vite SPA bundler)
- **Styling & UI:** Tailwind CSS, Lucide React Icons, Framer Motion
- **Data Visualization & Export:** Recharts, `html2pdf.js`
- **Backend Framework:** FastAPI (Python 3.11) with Uvicorn ASGI server
- **Database & ORM:** SQLite / PostgreSQL with SQLAlchemy ORM
- **AI / LLM Integration:** Google Gemini 2.5 Flash via official `google-genai` SDK with deterministic fallback heuristics
- **Text & PDF Processing:** `PyPDF2`, `python-docx`, regex stream token parsers

---

## 8. Expected Outcomes & Societal Impact
- **Empowering Job Candidates:** Equips students and seasoned professionals with transparent ATS grading, removing the guesswork from resume screening.
- **Elevated Hiring Visibility:** Ensures candidate resumes bypass automated filters and reach human recruiters with high impact.
- **Accessible Interview Coaching:** Democratizes technical interview coaching through on-demand AI mock interviews and targeted roadmaps.

---

## 9. Future Scope & Enhancements
- **Multi-lingual ATS Parsing:** Support resume parsing and generation across European and Asian languages.
- **Real-time Audio Mock Interviews:** Transition text/voice simulation into real-time WebRTC audio-visual avatar interviews.
- **Direct Recruiter Job Board Integration:** Enable 1-click applications to partner job boards and automated ATS portal testing.
- **Export to Multiple ATS Formats:** Provide downloadable `.docx` formats tailored to specific enterprise ATS profiles (Workday, Taleo).

---

## 10. Conclusion
The **AI Interview Analyzer & 100% ATS Resume Engineering Platform** delivers an all-in-one solution for technical job seekers. By integrating multi-factor dynamic ATS grading, high-contrast ATS document generation, job-description gap analysis, and interactive interview simulations, the platform significantly enhances candidate employability in today's competitive job market.
