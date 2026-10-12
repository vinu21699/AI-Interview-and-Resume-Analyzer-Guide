import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, InterviewSession, InterviewAnswer
from app.schemas import StartInterviewRequest, SubmitAnswerRequest
from app.auth import get_current_user
from app.ai_engine import evaluate_interview_answer_ai

router = APIRouter(prefix="/api/interview", tags=["AI Mock Interview"])

QUESTION_BANK = {
    "Software Engineer": {
        "Technical": [
            "Explain the difference between process and thread, and how concurrency is managed in your preferred language.",
            "How do RESTful APIs handle state, and what strategies do you use for caching?",
            "What is database indexing, and what are the trade-offs of adding indexes to a database table?"
        ],
        "HR": [
            "Tell me about a time when you faced a difficult technical challenge and how you navigated it.",
            "Where do you see your career in 3 years as a Software Engineer?",
            "How do you handle disagreement with a technical decision made by your lead?"
        ],
        "Behavioral": [
            "Describe a situation where you had to meet a tight deadline under pressure.",
            "Can you share an instance where you mentored or assisted a colleague?"
        ]
    },
    "Frontend Developer": {
        "Technical": [
            "Explain the Virtual DOM in React and how the reconciliation process optimizes re-renders.",
            "What is the difference between state and props, and how do you manage global state?",
            "How do you optimize Web Vitals such as Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?"
        ],
        "HR": [
            "Why are you passionate about building modern web user interfaces?",
            "How do you stay updated with rapidly evolving frontend web technologies?"
        ],
        "Behavioral": [
            "Tell me about a project where you collaborated closely with UI/UX designers."
        ]
    },
    "Backend Developer": {
        "Technical": [
            "Compare synchronous vs asynchronous I/O and explain when to use event loops.",
            "How do you design database schemas to support high concurrency and data integrity?",
            "Explain how JWT authentication works and how to handle token revocation safely."
        ],
        "HR": [
            "How do you prioritize non-functional requirements like security and reliability?",
            "Describe your ideal backend team environment."
        ],
        "Behavioral": [
            "Describe a critical outage or bug in production and how you resolved it."
        ]
    }
}

@router.post("/start")
def start_interview(
    req: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = InterviewSession(
        user_id=current_user.id,
        role=req.role,
        mode=req.mode,
        difficulty=req.difficulty,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Pick initial questions based on bank or generate
    role_questions = QUESTION_BANK.get(req.role, QUESTION_BANK["Software Engineer"])
    mode_questions = role_questions.get(req.mode, role_questions.get("Technical", []))

    if not mode_questions:
        mode_questions = [
            f"As a {req.role}, describe your approach to architectural design and system maintainability.",
            f"Explain how you handle edge cases and debugging in high-pressure scenarios as a {req.role}.",
            f"What design patterns or best practices do you rely on most heavily in your daily workflow?"
        ]

    first_question = mode_questions[0]

    return {
        "session_id": session.id,
        "role": session.role,
        "mode": session.mode,
        "difficulty": session.difficulty,
        "current_question": first_question,
        "question_number": 1,
        "total_questions": len(mode_questions)
    }

@router.post("/answer")
def submit_answer(
    req: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    eval_result = evaluate_interview_answer_ai(
        role=session.role,
        mode=session.mode,
        question=req.question_text,
        user_answer=req.user_answer
    )

    ans = InterviewAnswer(
        session_id=session.id,
        question_text=req.question_text,
        user_answer=req.user_answer,
        answer_type=req.answer_type or "text",
        confidence_score=eval_result.get("confidence_score", 80),
        grammar_score=eval_result.get("grammar_score", 85),
        technical_score=eval_result.get("technical_score", 80),
        communication_score=eval_result.get("communication_score", 82),
        problem_solving_score=eval_result.get("problem_solving_score", 78),
        feedback=eval_result.get("feedback", ""),
        sample_best_answer=eval_result.get("sample_best_answer", "")
    )
    db.add(ans)
    db.commit()
    db.refresh(ans)

    role_questions = QUESTION_BANK.get(session.role, QUESTION_BANK["Software Engineer"])
    mode_questions = role_questions.get(session.mode, role_questions.get("Technical", []))
    if not mode_questions:
        mode_questions = [
            f"As a {session.role}, describe your approach to architectural design and system maintainability.",
            f"Explain how you handle edge cases and debugging in high-pressure scenarios as a {session.role}.",
            f"What design patterns or best practices do you rely on most heavily in your daily workflow?"
        ]

    answers_count = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session.id).count()

    next_question = None
    if answers_count < len(mode_questions):
        next_question = mode_questions[answers_count]

    return {
        "evaluation": ans,
        "next_question": next_question,
        "is_finished": next_question is None
    }

@router.post("/finish/{session_id}")
def finish_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    answers = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session_id).all()
    if answers:
        avg_score = int(sum([a.technical_score for a in answers]) / len(answers))
    else:
        avg_score = 75

    session.overall_score = avg_score
    session.status = "completed"
    session.strengths = [
        "Strong structural clarity in technical responses",
        "Effective communication of core concepts",
        "Clear problem decomposition approach"
    ]
    session.weaknesses = [
        "Elaborate more on production scale metrics and edge cases",
        "Incorporate concrete trade-off comparisons in system design answers"
    ]
    session.improvement_plan = [
        "Review system design principles (load balancing, caching)",
        "Practice STAR framework for behavioral scenarios",
        "Re-attempt mock session on Hard difficulty"
    ]

    db.commit()
    db.refresh(session)
    return session

@router.get("/history")
def get_interview_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.id.desc()).all()
    return sessions
