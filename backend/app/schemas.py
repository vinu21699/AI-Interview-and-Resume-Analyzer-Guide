from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    preferred_job_role: Optional[str] = "Software Engineer"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    preferred_job_role: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    education: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    preferred_job_role: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Resume Schemas
class ResumeAnalysisRequest(BaseModel):
    raw_text: Optional[str] = None

class JobMatchRequest(BaseModel):
    job_title: str
    job_description: str
    resume_text: Optional[str] = None

# Interview Schemas
class StartInterviewRequest(BaseModel):
    role: str
    mode: str  # Technical, HR, Behavioral, Mixed
    difficulty: str  # Easy, Medium, Hard

class SubmitAnswerRequest(BaseModel):
    session_id: int
    question_text: str
    user_answer: str
    answer_type: Optional[str] = "text"

# Coding Schemas
class CodeExecutionRequest(BaseModel):
    language: str
    code: str
    challenge_id: Optional[str] = None

# Chatbot Schemas
class ChatRequest(BaseModel):
    message: str

# Resume Builder Schema
class ResumeBuildRequest(BaseModel):
    name: str
    email: str
    phone: str
    summary: str
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    skills: List[str]
    projects: List[Dict[str, Any]]
    certifications: List[str]
    template: Optional[str] = "Modern"
