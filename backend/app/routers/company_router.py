from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CompanyPrepPlan
from app.schemas import CompanyPrepRequest
from app.auth import get_current_user_or_guest
from app.ai_engine import generate_company_prep_ai, COMPANY_ARCHETYPES

router = APIRouter(prefix="/api/company", tags=["Target Company Preparation"])

@router.get("/popular")
def get_popular_companies():
    return {
        "popular_companies": [
            {"name": "TCS", "category": "Service-Based Enterprise", "difficulty": "Medium"},
            {"name": "Infosys", "category": "Enterprise Consulting", "difficulty": "Medium"},
            {"name": "Google", "category": "Global Big Tech (MAANG)", "difficulty": "Very Hard"},
            {"name": "Amazon", "category": "E-Commerce & Cloud Scale", "difficulty": "Hard"},
            {"name": "Microsoft", "category": "Enterprise Cloud & Software", "difficulty": "Hard"},
            {"name": "Accenture", "category": "Global Tech Services", "difficulty": "Medium"},
            {"name": "Wipro", "category": "Enterprise IT Solutions", "difficulty": "Medium"},
            {"name": "Fast-Paced Startup", "category": "Full-Stack & Product Speed", "difficulty": "Medium-Hard"}
        ],
        "popular_roles": [
            "Software Developer",
            "Frontend Engineer",
            "Backend Engineer",
            "Full Stack Developer",
            "Data Analyst / Data Engineer",
            "DevOps / Cloud Engineer"
        ]
    }

@router.post("/generate")
def generate_company_prep(
    payload: CompanyPrepRequest,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    plan_data = generate_company_prep_ai(
        company=payload.target_company,
        role=payload.target_role,
        timeline_days=payload.timeline_days or 30
    )

    db_plan = CompanyPrepPlan(
        user_id=current_user.id,
        target_company=payload.target_company,
        target_role=payload.target_role,
        timeline_days=payload.timeline_days or 30,
        interview_questions=plan_data.get("interview_questions", []),
        dsa_topics=plan_data.get("focus_dsa", []),
        sql_topics=plan_data.get("focus_sql", []),
        technical_topics=plan_data.get("technical_topics", []),
        project_questions=plan_data.get("project_viva_prompts", []),
        resume_checklist=plan_data.get("resume_tailoring_tips", []),
        schedule=plan_data.get("weekly_schedule", [])
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    return plan_data

@router.get("/my-plans")
def get_my_company_plans(
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    plans = db.query(CompanyPrepPlan).filter(
        CompanyPrepPlan.user_id == current_user.id
    ).order_by(CompanyPrepPlan.id.desc()).all()
    return plans
