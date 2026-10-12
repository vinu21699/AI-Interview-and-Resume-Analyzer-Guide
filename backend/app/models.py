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
