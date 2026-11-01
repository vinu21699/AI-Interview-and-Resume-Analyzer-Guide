import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import User, Resume, ResumeAnalysis, JobMatch
from app.auth import get_current_user, get_current_user_or_guest
from app.ai_engine import analyze_resume_ai, match_job_description_ai, generate_ats_optimized_resume_ai

router = APIRouter(prefix="/api/resume", tags=["Resume Analyzer"])

import re

def extract_text_from_file(file: UploadFile) -> str:
    filename = file.filename.lower()
    content = file.file.read()
    text = ""

    if filename.endswith(".pdf"):
        # 1. Primary: PyMuPDF - robust, accurate, fast
        try:
            import pymupdf
            doc = pymupdf.open(stream=content, filetype="pdf")
            for page in doc:
                p_text = page.get_text()
                if p_text:
                    text += p_text + "\n"
        except Exception as e:
            print(f"[PyMuPDF Extraction error]: {e}")

        # 2. Secondary fallback: pypdf modern
        if not text or len(text.strip()) < 15:
            try:
                import pypdf
                pdf_reader = pypdf.PdfReader(io.BytesIO(content))
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            except Exception:
                pass

        # 3. Tertiary fallback: PyPDF2
        if not text or len(text.strip()) < 15:
            try:
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            except Exception:
                pass

    elif filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception:
            text = content.decode("utf-8", errors="ignore")
    else:
        text = content.decode("utf-8", errors="ignore")

    return text.strip()

@router.post("/analyze")
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    try:
        resume_text = ""
        filename = "resume.txt"

        if file and hasattr(file, 'filename') and file.filename:
            filename = file.filename
            resume_text = extract_text_from_file(file)
            if not resume_text or len(resume_text.strip()) < 15:
                # Fallback: if user uploaded an image scan or re-uploaded an older generated ATS resume,
                # check if there is an existing resume text in DB for this user
                latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
                if latest_resume and latest_resume.raw_text and len(latest_resume.raw_text.strip()) >= 15:
                    print(f"[Resume Analyzer] Recovered text from previous user resume record for '{filename}'")
                    resume_text = latest_resume.raw_text
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not extract readable text from '{filename}'. Please ensure the PDF contains selectable text (not an image scan) or paste your resume text."
                    )
        elif raw_text and len(raw_text.strip()) >= 10:
            resume_text = raw_text.strip()
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a PDF or DOCX resume file, or paste your resume text."
            )

        # Save Resume Record
        db_resume = Resume(
            user_id=current_user.id,
            filename=filename,
            raw_text=resume_text,
            extracted_data={"char_count": len(resume_text)}
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        # Perform AI Analysis
        ai_result = analyze_resume_ai(resume_text)

        # Save Analysis Record
        analysis = ResumeAnalysis(
            resume_id=db_resume.id,
            user_id=current_user.id,
            ats_score=ai_result.get("ats_score", 0),
            formatting_score=ai_result.get("formatting_score", 0),
            keywords_score=ai_result.get("keywords_score", 0),
            skills_score=ai_result.get("skills_score", 0),
            experience_score=ai_result.get("experience_score", 0),
            education_score=ai_result.get("education_score", 0),
            projects_score=ai_result.get("projects_score", 0),
            certifications_score=ai_result.get("certifications_score", 0),
            strengths=ai_result.get("strengths", []),
            weaknesses=ai_result.get("weaknesses", []),
            missing_skills=ai_result.get("missing_skills", []),
            missing_keywords=ai_result.get("missing_keywords", []),
            grammar_suggestions=ai_result.get("grammar_suggestions", []),
            improved_summary=ai_result.get("improved_summary", ""),
            action_verb_suggestions=ai_result.get("action_verb_suggestions", []),
            detailed_checks=ai_result.get("detailed_checks", []),
            report_data=ai_result.get("report_data", {})
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "resume_id": db_resume.id,
            "filename": filename,
            "raw_text": db_resume.raw_text,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Resume Analysis Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/job-match")
def match_job(
    payload: dict,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    job_title = payload.get("job_title", "Target Role")
    job_desc = payload.get("job_description", "")
    resume_text = payload.get("resume_text", "")

    if not resume_text:
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
        if latest_resume:
            resume_text = latest_resume.raw_text
        else:
            resume_text = f"Skills: {current_user.skills or ''}\nExperience: {current_user.experience or ''}\nEducation: {current_user.education or ''}"

    match_res = match_job_description_ai(job_title, job_desc, resume_text)

    db_match = JobMatch(
        user_id=current_user.id,
        job_title=job_title,
        match_percentage=match_res.get("match_percentage", 75),
        missing_skills=match_res.get("missing_skills", []),
        missing_keywords=match_res.get("missing_keywords", []),
        missing_technologies=match_res.get("missing_technologies", []),
        experience_gap=match_res.get("experience_gap", ""),
        education_gap=match_res.get("education_gap", ""),
        recommendations=match_res.get("recommendations", [])
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    return db_match

@router.get("/history")
def get_resume_history(current_user: User = Depends(get_current_user_or_guest), db: Session = Depends(get_db)):
    analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == current_user.id).order_by(ResumeAnalysis.id.desc()).all()
    return analyses

@router.get("/my-stats")
def get_user_analytics(current_user: User = Depends(get_current_user_or_guest), db: Session = Depends(get_db)):
    analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == current_user.id).order_by(ResumeAnalysis.id.asc()).all()
    job_matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.id.desc()).all()
    
    total_resumes = len(analyses)
    latest_analysis = analyses[-1] if analyses else None
    
    # Generate real ATS score trajectory from uploaded resumes
    trajectory = []
    for idx, a in enumerate(analyses):
        trajectory.append({
            "name": f"Upload #{idx + 1}",
            "score": a.ats_score,
            "formatting": a.formatting_score,
            "keywords": a.keywords_score,
            "skills": a.skills_score,
            "experience": a.experience_score,
            "projects": a.projects_score
        })
        
    avg_ats = round(sum(a.ats_score for a in analyses) / total_resumes, 1) if total_resumes > 0 else 0

    return {
        "total_resumes": total_resumes,
        "avg_ats_score": avg_ats,
        "latest_ats_score": latest_analysis.ats_score if latest_analysis else 0,
        "formatting_score": latest_analysis.formatting_score if latest_analysis else 0,
        "keywords_score": latest_analysis.keywords_score if latest_analysis else 0,
        "skills_score": latest_analysis.skills_score if latest_analysis else 0,
        "experience_score": latest_analysis.experience_score if latest_analysis else 0,
        "education_score": latest_analysis.education_score if latest_analysis else 0,
        "projects_score": latest_analysis.projects_score if latest_analysis else 0,
        "trajectory": trajectory,
        "job_matches_count": len(job_matches)
    }

@router.post("/generate-ats-resume")
def generate_ats_resume(
    payload: dict,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    target_role = payload.get("target_role") or current_user.preferred_job_role or "Software Engineer"
    missing_skills = payload.get("missing_skills", [])
    missing_keywords = payload.get("missing_keywords", [])
    improved_summary = payload.get("improved_summary", "")
    resume_text = payload.get("resume_text", "")

    if not resume_text:
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
        if latest_resume:
            resume_text = latest_resume.raw_text

    generated_markdown = generate_ats_optimized_resume_ai(
        resume_text=resume_text,
        target_role=target_role,
        missing_skills=missing_skills,
        missing_keywords=missing_keywords,
        improved_summary=improved_summary
    )

    # Persist the generated 100% ATS resume into the DB for seamless re-analysis and recovery
    try:
        db_resume = Resume(
            user_id=current_user.id,
            filename="100%_ATS_Optimized_Resume.pdf",
            raw_text=generated_markdown,
            extracted_data={"source": "ats_optimizer", "target_role": target_role}
        )
        db.add(db_resume)
        db.commit()
    except Exception as e:
        print(f"[Generate ATS Resume Persistence Error]: {e}")

    return {
        "target_role": target_role,
        "resume_markdown": generated_markdown
    }
