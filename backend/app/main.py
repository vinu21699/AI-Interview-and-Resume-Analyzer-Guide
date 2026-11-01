import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import hash_password
from app.routers import (
    auth_router,
    resume_router,
    interview_router,
    coding_router,
    roadmap_router,
    chatbot_router,
    admin_router,
    movies_router,
    claims_router,
    defense_router,
    readiness_router,
    company_router
)

from sqlalchemy import text

# Initialize Database tables
Base.metadata.create_all(bind=engine)

def migrate_db():
    with engine.connect() as conn:
        for col in ["detailed_checks", "report_data"]:
            try:
                conn.execute(text(f"ALTER TABLE resume_analysis ADD COLUMN {col} JSON;"))
                conn.commit()
            except Exception:
                pass

migrate_db()

def seed_default_users():
    db = SessionLocal()
    try:
        for admin_email in ["admin@nexhire.ai", "admin@antigravity.ai"]:
            admin = db.query(User).filter(User.email == admin_email).first()
            if not admin:
                admin_user = User(
                    name="System Administrator",
                    email=admin_email,
                    password_hash=hash_password("admin123"),
                    is_admin=True,
                    preferred_job_role="Platform Administrator"
                )
                db.add(admin_user)

        for user_email in ["user@nexhire.ai", "user@antigravity.ai"]:
            candidate = db.query(User).filter(User.email == user_email).first()
            if not candidate:
                candidate_user = User(
                    name="Alex Johnson",
                    email=user_email,
                    password_hash=hash_password("user123"),
                    is_admin=False,
                    preferred_job_role="Software Engineer"
                )
                db.add(candidate_user)

        db.commit()
    except Exception as e:
        print(f"[Database Seeding Warning]: {e}")
    finally:
        db.close()

seed_default_users()

app = FastAPI(
    title="AI Interview Analyzer & Career Assistant API",
    description="Production-grade AI REST APIs for Resume ATS Scoring, Mock Interviews, Coding Tests, Roadmaps, and Career Mentorship.",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Modules
app.include_router(auth_router.router)
app.include_router(resume_router.router)
app.include_router(interview_router.router)
app.include_router(coding_router.router)
app.include_router(roadmap_router.router)
app.include_router(chatbot_router.router)
app.include_router(admin_router.router)
app.include_router(movies_router.router)
app.include_router(claims_router.router)
app.include_router(defense_router.router)
app.include_router(readiness_router.router)
app.include_router(company_router.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app_name": "AI Interview Analyzer & Career Assistant",
        "version": "1.0.0",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
