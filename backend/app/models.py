from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    preferred_job_role = Column(String(255), default="Software Engineer")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    coding_tests = relationship("CodingTest", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("CareerRoadmap", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ats_score = Column(Integer, default=0)
    formatting_score = Column(Integer, default=0)
    keywords_score = Column(Integer, default=0)
    skills_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    education_score = Column(Integer, default=0)
    projects_score = Column(Integer, default=0)
    certifications_score = Column(Integer, default=0)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    grammar_suggestions = Column(JSON, nullable=True)
    improved_summary = Column(Text, nullable=True)
    action_verb_suggestions = Column(JSON, nullable=True)
    detailed_checks = Column(JSON, nullable=True)
    report_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String(255), nullable=True)
    match_percentage = Column(Integer, default=0)
    missing_skills = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    missing_technologies = Column(JSON, nullable=True)
    experience_gap = Column(Text, nullable=True)
    education_gap = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(255), nullable=False)
    mode = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    overall_score = Column(Integer, default=0)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    improvement_plan = Column(JSON, nullable=True)
    status = Column(String(50), default="in_progress")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")
    answers = relationship("InterviewAnswer", back_populates="session", cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    answer_type = Column(String(50), default="text")
    confidence_score = Column(Integer, default=0)
    grammar_score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    problem_solving_score = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    sample_best_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="answers")

class CodingTest(Base):
    __tablename__ = "coding_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    language = Column(String(50), nullable=False)
    code_submitted = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coding_tests")

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String(255), nullable=False)
    skills_to_learn = Column(JSON, nullable=True)
    recommended_certifications = Column(JSON, nullable=True)
    recommended_projects = Column(JSON, nullable=True)
    timeline = Column(JSON, nullable=True)
    weekly_goals = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")

class MovieRecommendation(Base):
    __tablename__ = "movie_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    imdb_rating = Column(Float, default=8.0)
    genre = Column(String(255), nullable=True)
    runtime = Column(String(50), nullable=True)
    poster_url = Column(Text, nullable=True)
    trailer_url = Column(Text, nullable=True)
    streaming_availability = Column(String(255), nullable=True)
    recommendation_reason = Column(Text, nullable=True)

class ChatMessage(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeClaim(Base):
    __tablename__ = "resume_claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    claim_text = Column(Text, nullable=False)
    related_skill = Column(String(255), nullable=True)
    importance = Column(String(50), default="High")
    difficulty = Column(String(50), default="Medium")
    questions = Column(JSON, nullable=True)
    answers = Column(JSON, nullable=True)
    status = Column(String(50), default="pending")
    technical_accuracy = Column(Integer, default=0)
    understanding_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    claim_confidence = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    risk_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProjectDefenseSession(Base):
    __tablename__ = "project_defense_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_name = Column(String(255), nullable=False)
    project_description = Column(Text, nullable=True)
    technologies = Column(Text, nullable=True)
    role = Column(String(255), nullable=True)
    features = Column(Text, nullable=True)
    database = Column(String(255), nullable=True)
    ai_ml_model = Column(String(255), nullable=True)
    challenges = Column(Text, nullable=True)
    results = Column(Text, nullable=True)
    current_round = Column(Integer, default=1)
    status = Column(String(50), default="in_progress")
    technical_knowledge = Column(Integer, default=0)
    project_understanding = Column(Integer, default=0)
    architecture_score = Column(Integer, default=0)
    implementation_score = Column(Integer, default=0)
    problem_solving_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    recommended_practice = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    rounds = relationship("ProjectDefenseRound", back_populates="session", cascade="all, delete-orphan")

class ProjectDefenseRound(Base):
    __tablename__ = "project_defense_rounds"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("project_defense_sessions.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    round_name = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ProjectDefenseSession", back_populates="rounds")

class ReadinessSnapshot(Base):
    __tablename__ = "readiness_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_readiness = Column(Integer, default=0)
    resume_score = Column(Integer, default=0)
    dsa_score = Column(Integer, default=0)
    sql_score = Column(Integer, default=0)
    interview_score = Column(Integer, default=0)
    projects_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    skills_score = Column(Integer, default=0)
    weakest_areas = Column(JSON, nullable=True)
    strongest_areas = Column(JSON, nullable=True)
    dsa_breakdown = Column(JSON, nullable=True)
    sql_breakdown = Column(JSON, nullable=True)
    category_weights = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class WeaknessPracticePlan(Base):
    __tablename__ = "weakness_practice_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weakness_category = Column(String(100), nullable=False)
    weakness_topic = Column(String(100), nullable=False)
    score = Column(Integer, default=0)
    days_plan = Column(JSON, nullable=False)
    completed_days = Column(JSON, default=list)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class CompanyPrepPlan(Base):
    __tablename__ = "company_prep_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_company = Column(String(100), nullable=False)
    target_role = Column(String(100), nullable=False)
    timeline_days = Column(Integer, default=30)
    interview_questions = Column(JSON, nullable=True)
    dsa_topics = Column(JSON, nullable=True)
    sql_topics = Column(JSON, nullable=True)
    technical_topics = Column(JSON, nullable=True)
    project_questions = Column(JSON, nullable=True)
    resume_checklist = Column(JSON, nullable=True)
    schedule = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
