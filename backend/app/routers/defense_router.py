import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Resume, ProjectDefenseSession, ProjectDefenseRound
from app.schemas import StartProjectDefenseRequest, SubmitProjectDefenseAnswerRequest
from app.auth import get_current_user_or_guest
from app.ai_engine import (
    VIVA_ROUNDS,
    generate_project_defense_question_ai,
    evaluate_project_defense_ai
)

router = APIRouter(prefix="/api/defense", tags=["AI Project Defense / Viva"])

@router.get("/resume-projects")
def get_resume_projects(
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    """
    Extracts projects from candidate's latest resume to auto-fill the Project Defense selector.
    """
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    raw_text = latest_resume.raw_text if latest_resume else ""

    projects = []
    if raw_text:
        # Match project sections or markdown headers
        proj_blocks = re.findall(r'(?i)(?:###|\*\*|Project:)\s*([^\n\*#]+)(.*?)(?=(?:###|\*\*|Project:|\n## |\Z))', raw_text, re.DOTALL)
        for title, desc in proj_blocks[:4]:
            clean_title = title.strip().replace("*", "")
            if len(clean_title) > 3 and not any(k in clean_title.lower() for k in ["experience", "education", "skills", "summary"]):
                tech_match = re.search(r'(?i)(?:tech stack|technologies|built with):\s*([^\n]+)', desc)
                technologies = tech_match.group(1).strip() if tech_match else "Python, React, PostgreSQL, Docker"
                projects.append({
                    "project_name": clean_title,
                    "description": desc.strip()[:250],
                    "technologies": technologies,
                    "database": "PostgreSQL" if "postgres" in desc.lower() else "MySQL",
                    "role": "Full Stack Developer"
                })

    if not projects:
        # Default high-yield projects if no custom resume is present yet
        projects = [
            {
                "project_name": "AI-Powered Analytics & Workflow Platform",
                "description": "Full-stack SaaS application automating resume parsing, skill matching, and real-time telemetry analytics.",
                "technologies": "Python, FastAPI, React, PostgreSQL, Docker, Redis",
                "database": "PostgreSQL",
                "role": "Lead Software Engineer"
            },
            {
                "project_name": "High-Throughput Microservice E-Commerce Engine",
                "description": "Distributed e-commerce transaction service managing high-concurrency order placement and inventory locks.",
                "technologies": "Node.js, Express, TypeScript, MongoDB, Redis, Docker",
                "database": "MongoDB & Redis",
                "role": "Backend Engineer"
            }
        ]

    return {"projects": projects}


@router.post("/start")
def start_project_defense(
    payload: StartProjectDefenseRequest,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    session = ProjectDefenseSession(
        user_id=current_user.id,
        project_name=payload.project_name,
        project_description=payload.project_description or "Production software application",
        technologies=payload.technologies or "Python, React, SQL",
        role=payload.role or "Software Engineer",
        features=payload.features,
        database=payload.database or "PostgreSQL",
        ai_ml_model=payload.ai_ml_model,
        challenges=payload.challenges,
        results=payload.results,
        current_round=1,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate Round 1 Question
    project_dict = {
        "project_name": session.project_name,
        "technologies": session.technologies,
        "project_description": session.project_description,
        "database": session.database,
        "role": session.role
    }
    q1_text = generate_project_defense_question_ai(project_dict, 1, [])

    round1 = ProjectDefenseRound(
        session_id=session.id,
        round_number=1,
        round_name="Project Overview",
        question_text=q1_text
    )
    db.add(round1)
    db.commit()

    return {
        "session_id": session.id,
        "project_name": session.project_name,
        "current_round": 1,
        "round_name": "Project Overview",
        "total_rounds": 7,
        "question": q1_text
    }


@router.post("/answer")
def submit_defense_answer(
    payload: SubmitProjectDefenseAnswerRequest,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    session = db.query(ProjectDefenseSession).filter(
        ProjectDefenseSession.id == payload.session_id,
        ProjectDefenseSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Project defense session not found")

    current_round_obj = db.query(ProjectDefenseRound).filter(
        ProjectDefenseRound.session_id == session.id,
        ProjectDefenseRound.round_number == payload.round_number
    ).first()

    if not current_round_obj:
        raise HTTPException(status_code=404, detail="Defense round not found")

    current_round_obj.user_answer = payload.answer
    db.commit()

    # Fetch all completed rounds for context
    past_rounds = db.query(ProjectDefenseRound).filter(
        ProjectDefenseRound.session_id == session.id
    ).order_by(ProjectDefenseRound.round_number.asc()).all()

    past_rounds_data = [
        {
            "round_number": r.round_number,
            "round_name": r.round_name,
            "question_text": r.question_text,
            "user_answer": r.user_answer
        }
        for r in past_rounds
    ]

    project_dict = {
        "project_name": session.project_name,
        "technologies": session.technologies,
        "project_description": session.project_description,
        "database": session.database,
        "role": session.role
    }

    next_round_num = payload.round_number + 1

    if next_round_num <= 7:
        session.current_round = next_round_num
        round_meta = VIVA_ROUNDS[next_round_num - 1]
        
        # Adaptive question generation based on previous answer!
        next_q_text = generate_project_defense_question_ai(project_dict, next_round_num, past_rounds_data)

        next_round_obj = ProjectDefenseRound(
            session_id=session.id,
            round_number=next_round_num,
            round_name=round_meta["name"],
            question_text=next_q_text
        )
        db.add(next_round_obj)
        db.commit()

        return {
            "session_id": session.id,
            "current_round": next_round_num,
            "round_name": round_meta["name"],
            "total_rounds": 7,
            "question": next_q_text,
            "is_finished": False
        }
    else:
        # All 7 rounds completed! Evaluate defense session
        return finish_project_defense(session.id, current_user, db)


@router.post("/finish/{session_id}")
def finish_project_defense(
    session_id: int,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    session = db.query(ProjectDefenseSession).filter(
        ProjectDefenseSession.id == session_id,
        ProjectDefenseSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    rounds = db.query(ProjectDefenseRound).filter(
        ProjectDefenseRound.session_id == session.id
    ).order_by(ProjectDefenseRound.round_number.asc()).all()

    rounds_data = [
        {
            "round_number": r.round_number,
            "round_name": r.round_name,
            "question_text": r.question_text,
            "user_answer": r.user_answer or ""
        }
        for r in rounds
    ]

    project_dict = {
        "project_name": session.project_name,
        "technologies": session.technologies,
        "project_description": session.project_description,
        "database": session.database,
        "role": session.role
    }

    eval_result = evaluate_project_defense_ai(project_dict, rounds_data)

    session.technical_knowledge = eval_result.get("technical_knowledge", 80)
    session.project_understanding = eval_result.get("project_understanding", 76)
    session.architecture_score = eval_result.get("architecture_score", 72)
    session.implementation_score = eval_result.get("implementation_score", 80)
    session.problem_solving_score = eval_result.get("problem_solving_score", 75)
    session.communication_score = eval_result.get("communication_score", 82)
    session.overall_score = eval_result.get("overall_score", 78)
    session.strengths = eval_result.get("strengths", [])
    session.weaknesses = eval_result.get("weaknesses", [])
    session.recommended_practice = eval_result.get("recommended_practice", [])
    session.status = "completed"

    db.commit()
    db.refresh(session)

    return {
        "session": session,
        "evaluation": eval_result,
        "is_finished": True
    }


@router.get("/history")
def get_defense_history(
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    sessions = db.query(ProjectDefenseSession).filter(
        ProjectDefenseSession.user_id == current_user.id
    ).order_by(ProjectDefenseSession.id.desc()).all()
    return sessions
