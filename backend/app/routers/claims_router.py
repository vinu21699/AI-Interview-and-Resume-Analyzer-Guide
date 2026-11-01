from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Resume, ResumeClaim
from app.schemas import ExtractClaimsRequest, VerifyClaimRequest
from app.auth import get_current_user_or_guest
from app.ai_engine import extract_resume_claims_ai, evaluate_resume_claim_ai

router = APIRouter(prefix="/api/claims", tags=["Resume Claim Verification"])

@router.post("/extract")
def extract_claims(
    payload: ExtractClaimsRequest = None,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    resume_text = ""
    resume_id = None
    if payload and payload.resume_text:
        resume_text = payload.resume_text
    else:
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
        if latest_resume:
            resume_text = latest_resume.raw_text or ""
            resume_id = latest_resume.id

    if not resume_text:
        # Fallback sample resume text to ensure user can try claim verification even before manual upload
        resume_text = """
        John Doe | Software Engineer
        Experience:
        - Developed and deployed high-throughput RESTful microservice APIs in FastAPI and PostgreSQL.
        - Optimized database indexing, query execution plans, and connection pooling.
        - Built responsive web interfaces in React and Tailwind CSS with complex state management.
        - Implemented secure JWT token authentication with role-based access control.
        - Containerized microservices using Docker and orchestrated automated CI/CD deployment pipelines.
        """

    extracted = extract_resume_claims_ai(resume_text)

    # Save to database
    saved_claims = []
    for item in extracted:
        # Check if already exists for this user/resume
        existing = db.query(ResumeClaim).filter(
            ResumeClaim.user_id == current_user.id,
            ResumeClaim.claim_text == item.get("claim_text")
        ).first()

        if existing:
            saved_claims.append(existing)
        else:
            claim_obj = ResumeClaim(
                user_id=current_user.id,
                resume_id=resume_id,
                claim_text=item.get("claim_text"),
                related_skill=item.get("related_skill"),
                importance=item.get("importance", "High"),
                difficulty=item.get("difficulty", "Medium"),
                questions=item.get("questions", []),
                status="pending"
            )
            db.add(claim_obj)
            db.commit()
            db.refresh(claim_obj)
            saved_claims.append(claim_obj)

    return {
        "total_claims": len(saved_claims),
        "claims": saved_claims
    }

@router.post("/verify")
def verify_claim(
    payload: VerifyClaimRequest,
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    claim = db.query(ResumeClaim).filter(
        ResumeClaim.id == payload.claim_id,
        ResumeClaim.user_id == current_user.id
    ).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Resume claim not found")

    questions = claim.questions or []
    answers = payload.answers or []

    # Run AI Claim Evaluation
    eval_res = evaluate_resume_claim_ai(
        claim_text=claim.claim_text,
        related_skill=claim.related_skill or "Technical Skill",
        questions=questions,
        answers=answers
    )

    claim.answers = answers
    claim.technical_accuracy = eval_res.get("technical_accuracy", 75)
    claim.understanding_score = eval_res.get("understanding_score", 70)
    claim.confidence_score = eval_res.get("confidence_score", 70)
    claim.communication_score = eval_res.get("communication_score", 75)
    claim.claim_confidence = eval_res.get("claim_confidence", 72)
    claim.feedback = eval_res.get("feedback", "")
    claim.risk_analysis = eval_res.get("risk_analysis", "")
    claim.status = "verified"

    db.commit()
    db.refresh(claim)

    return {
        "claim": claim,
        "evaluation": eval_res
    }

@router.get("/my-claims")
def get_my_claims(
    current_user: User = Depends(get_current_user_or_guest),
    db: Session = Depends(get_db)
):
    claims = db.query(ResumeClaim).filter(ResumeClaim.user_id == current_user.id).order_by(ResumeClaim.id.desc()).all()
    if not claims:
        # Auto-extract for seamless onboarding
        return extract_claims(None, current_user, db)
    return {
        "total_claims": len(claims),
        "claims": claims
    }
