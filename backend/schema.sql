-- Production MySQL Schema for AI Interview Analyzer & Career Assistant
CREATE DATABASE IF NOT EXISTS ai_career_db;
USE ai_career_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    education TEXT,
    experience TEXT,
    skills TEXT,
    preferred_job_role VARCHAR(255) DEFAULT 'Software Engineer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    raw_text LONGTEXT,
    extracted_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resume Analysis Table
CREATE TABLE IF NOT EXISTS resume_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    user_id INT NOT NULL,
    ats_score INT DEFAULT 0,
    formatting_score INT DEFAULT 0,
    keywords_score INT DEFAULT 0,
    skills_score INT DEFAULT 0,
    experience_score INT DEFAULT 0,
    education_score INT DEFAULT 0,
    projects_score INT DEFAULT 0,
    certifications_score INT DEFAULT 0,
    strengths JSON,
    weaknesses JSON,
    missing_skills JSON,
    missing_keywords JSON,
    grammar_suggestions JSON,
    improved_summary TEXT,
    action_verb_suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job Description Matching Table
CREATE TABLE IF NOT EXISTS job_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_title VARCHAR(255),
    match_percentage INT DEFAULT 0,
    missing_skills JSON,
    missing_keywords JSON,
    missing_technologies JSON,
    experience_gap TEXT,
    education_gap TEXT,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(255) NOT NULL,
    mode VARCHAR(100) NOT NULL, -- Technical, HR, Behavioral, Mixed
    difficulty VARCHAR(50) NOT NULL, -- Easy, Medium, Hard
    overall_score INT DEFAULT 0,
    strengths JSON,
    weaknesses JSON,
    improvement_plan JSON,
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Interview Questions & Answers Table
CREATE TABLE IF NOT EXISTS interview_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    answer_type VARCHAR(50) DEFAULT 'text', -- text, voice, video
    confidence_score INT DEFAULT 0,
    grammar_score INT DEFAULT 0,
    technical_score INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    problem_solving_score INT DEFAULT 0,
    feedback TEXT,
    sample_best_answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Coding Tests Table
CREATE TABLE IF NOT EXISTS coding_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    code_submitted TEXT,
    status VARCHAR(50) NOT NULL, -- passed, failed, runtime_error
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Career Roadmaps Table
CREATE TABLE IF NOT EXISTS career_roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_role VARCHAR(255) NOT NULL,
    skills_to_learn JSON,
    recommended_certifications JSON,
    recommended_projects JSON,
    timeline JSON,
    weekly_goals JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Movie Recommendations Table
CREATE TABLE IF NOT EXISTS movie_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    imdb_rating DECIMAL(3,1),
    genre VARCHAR(255),
    runtime VARCHAR(50),
    poster_url TEXT,
    trailer_url TEXT,
    streaming_availability VARCHAR(255),
    recommendation_reason TEXT
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(50) NOT NULL, -- user, model
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
