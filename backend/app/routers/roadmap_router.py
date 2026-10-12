from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CareerRoadmap
from app.auth import get_current_user
from app.ai_engine import generate_roadmap_ai

router = APIRouter(prefix="/api/roadmap", tags=["Career Roadmap"])

@router.get("/generate")
def generate_roadmap(
    target_role: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = target_role or current_user.preferred_job_role or "Software Engineer"
    ai_data = generate_roadmap_ai(role)

    roadmap = CareerRoadmap(
        user_id=current_user.id,
        target_role=role,
        skills_to_learn=ai_data.get("skills_to_learn", []),
        recommended_certifications=ai_data.get("recommended_certifications", []),
        recommended_projects=ai_data.get("recommended_projects", []),
        timeline=ai_data.get("timeline", []),
        weekly_goals=ai_data.get("weekly_goals", [])
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return roadmap

@router.get("/latest")
def get_latest_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).order_by(CareerRoadmap.id.desc()).first()
    if not roadmap:
        return generate_roadmap(current_user.preferred_job_role or "Software Engineer", current_user, db)
    return roadmap

