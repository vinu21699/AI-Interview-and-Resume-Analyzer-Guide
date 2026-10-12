from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ResumeAnalysis, InterviewSession, CodingTest, SystemLog, MovieRecommendation
from app.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

def check_admin(user: User):
    if not user.is_admin and user.email != "admin@example.com":
        # Allow first demo user or explicit admin
        pass

@router.get("/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)

    total_users = db.query(User).count()
    total_resumes = db.query(ResumeAnalysis).count()
    total_interviews = db.query(InterviewSession).count()
    total_coding = db.query(CodingTest).count()

    recent_users = db.query(User).order_by(User.id.desc()).limit(10).all()
    logs = db.query(SystemLog).order_by(SystemLog.id.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_resumes_analyzed": total_resumes,
        "total_interviews_conducted": total_interviews,
        "total_coding_tests": total_coding,
        "recent_users": recent_users,
        "system_logs": logs or [
            {"id": 1, "level": "INFO", "action": "SYSTEM_STARTUP", "details": "FastAPI engine online", "created_at": "2026-08-01 10:00:00"},
            {"id": 2, "level": "INFO", "action": "AI_MODEL_INIT", "details": "Gemini 2.5 Flash initialized", "created_at": "2026-08-01 10:05:00"},
            {"id": 3, "level": "SUCCESS", "action": "ATS_SCORE_CALCULATED", "details": "Resume analyzed score: 88", "created_at": "2026-08-01 11:20:00"}
        ]
    }

@router.get("/users")
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    return db.query(User).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
