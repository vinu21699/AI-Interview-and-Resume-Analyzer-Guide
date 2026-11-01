import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Download,
  Layers, Check, ArrowRight, RefreshCw, Copy, FileEdit, Wand2,
  XCircle, ChevronDown, ChevronUp, ShieldCheck, Award, Zap, Sliders,
  Eye, FileCheck, ArrowUpRight, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadAtsPdfFromMarkdown } from '../utils/atsPdfGenerator';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'passed'
  const [expandedCheckId, setExpandedCheckId] = useState(null);
  const [atsResume, setAtsResume] = useState('');
  const [generatingResume, setGeneratingResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Load initial analysis if passed from landing page
  useEffect(() => {
    const cached = sessionStorage.getItem('initialAnalysis');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.analysis) {
          setResult(parsed.analysis);
          if (parsed.raw_text) setRawText(parsed.raw_text);
        }
        sessionStorage.removeItem('initialAnalysis');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!file && !rawText.trim()) {
      addToast('Please upload your resume file (PDF or DOCX) first.', 'warning');
      const fileInput = document.getElementById('analyzer-resume-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    setLoading(true);
    setAtsResume('');
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('raw_text', rawText);
      }

      const res = await api.post('/resume/analyze', formData);
      setResult(res.data.analysis);
      if (res.data.raw_text) setRawText(res.data.raw_text);

      addToast('Resume analysis complete!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed. Please check file format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleAnalyze = async () => {
    const sample = `John Doe
Senior Software Engineer
Email: john.doe@antigravity.ai | Phone: (555) 234-5678 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Results-oriented Senior Software Engineer with 6+ years of experience architecting distributed cloud systems, high-throughput microservices, and modern frontend applications using Python, React, FastAPI, and PostgreSQL.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Inc. | 2022 - Present
- Architected high-throughput RESTful microservices in FastAPI and PostgreSQL, reducing p99 response latency by 38% across 1.4M daily active requests.
- Spearheaded migration of monolithic services to Kubernetes and Docker on AWS, cutting infrastructure cloud spend by $120,000 annually.
- Mentored 5 junior and mid-level engineers, leading weekly sprint architecture reviews and standardizing CI/CD deployment pipelines.

Software Developer | FinTech Nexus | 2019 - 2022
- Developed core payment transaction engine processing $15M+ in monthly transaction volume with 99.99% system uptime.
- Optimized PostgreSQL database queries and connection pooling, boosting query throughput by 42%.
- Implemented real-time dashboard analytics using React, TypeScript, and Tailwind CSS.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2019

TECHNICAL SKILLS
Languages: Python, TypeScript, JavaScript, SQL, Go
Frameworks: React, FastAPI, Node.js, Next.js, Django
Cloud & DevOps: Docker, Kubernetes, AWS, CI/CD, Git, Linux
Databases: PostgreSQL, Redis, MongoDB, SQLite`;

    setRawText(sample);
    setFile(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('raw_text', sample);
      const res = await api.post('/resume/analyze', formData);
      setResult(res.data.analysis);
      setRawText(res.data.raw_text || sample);
      addToast('Sample resume audit loaded successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Sample load failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id) => {
    setExpandedCheckId(prev => (prev === id ? null : id));
  };

  const handleGenerateFullATSResume = async () => {
    if (!result) return;
    setGeneratingResume(true);
    try {
      const res = await api.post('/resume/generate-ats-resume', {
        missing_skills: result.missing_skills || [],
        missing_keywords: result.missing_keywords || [],
        improved_summary: result.improved_summary || '',
        resume_text: rawText || ''
      });

      setAtsResume(res.data.resume_markdown);
      addToast('Generated 100% ATS-Optimized Resume!', 'success');
    } catch (err) {
      addToast('Failed to generate ATS resume', 'error');
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleCopyResume = () => {
    if (!atsResume) return;
    navigator.clipboard.writeText(atsResume);
    setCopied(true);
    addToast('100% ATS Resume content copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    addToast('Improved CAR bullet copied to clipboard!', 'success');
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleDownloadPDF = () => {
    const resumeTextToExport = atsResume || rawText;
    if (!resumeTextToExport || !resumeTextToExport.trim()) {
      addToast('No resume content available to download. Please generate or analyze a resume first.', 'warning');
      return;
    }

    try {
      addToast('Downloading 100% ATS Vector-Text PDF directly to your device...', 'info');
      downloadAtsPdfFromMarkdown(resumeTextToExport, '100%_ATS_Optimized_Resume.pdf');
      addToast('100% ATS-Compliant PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export PDF: ' + err.message, 'error');
    }
  };

  const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/^# (.*$)/gim, '<h1 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase; text-align: center; margin-bottom: 4px;">$1</h1>')
      .replace(/^\*\*(.*?)\*\*/gim, '<div style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 12px; font-weight: 700; color: #475569; text-align: center; margin-bottom: 6px;">$1</div>')
      .replace(/^## (.*$)/gim, '<h2 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-top: 14px; margin-bottom: 6px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 11.5px; font-weight: 700; color: #1e293b; margin-top: 8px; margin-bottom: 3px;">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li style="font-family: Arial, Calibri, Helvetica, sans-serif; margin-bottom: 3px; font-size: 11px; color: #334155; line-height: 1.5;">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-family: Arial, Calibri, Helvetica, sans-serif; color: #0f172a; font-weight: 700;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-family: Arial, Calibri, Helvetica, sans-serif; color: #475569;">$1</em>');
  };

  const reportData = result?.report_data || {};
  const bulletTransformations = reportData?.bullet_transformations || [];

  const overallScore = reportData?.overall_score ?? result?.ats_score ?? 0;
  const atsParseRate = reportData?.ats_parse_rate ?? result?.formatting_score ?? 0;
  const recruiterReview = reportData?.recruiter_review ?? result?.experience_score ?? 0;
  const grade = reportData?.grade || (overallScore >= 92 ? "Outstanding" : overallScore >= 85 ? "Excellent" : overallScore >= 75 ? "Good" : overallScore >= 60 ? "Needs Polish" : "Needs Urgent Attention");
  const percentileText = reportData?.percentile_text || `Better than ${Math.min(95, Math.max(35, overallScore - 4))}% of candidate resumes`;

  const strengths = result?.strengths || [];
  const weaknesses = result?.weaknesses || [];
  const missingKeywords = result?.missing_keywords || [];
  const missingSkills = result?.missing_skills || [];
  const improvedSummary = result?.improved_summary || '';
  const actionVerbs = result?.action_verb_suggestions || ['Engineered', 'Spearheaded', 'Architected', 'Optimized', 'Automated'];
  const formattingScore = result?.formatting_score ?? reportData?.formatting_score ?? atsParseRate ?? 0;
  const keywordsScore = result?.keywords_score ?? reportData?.keywords_score ?? 0;
  const experienceScore = result?.experience_score ?? reportData?.experience_score ?? recruiterReview ?? 0;
  const skillsScore = result?.skills_score ?? reportData?.skills_score ?? 0;
  const educationScore = result?.education_score ?? reportData?.education_score ?? 0;
  const projectsScore = result?.projects_score ?? reportData?.projects_score ?? 0;

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* ========================================================
          INITIAL UPLOAD STATE (Clean, Breathable, Enhancv Style)
         ======================================================== */}
      {!result ? (
        <div className="max-w-3xl mx-auto space-y-8 py-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> AI ATS & Recruiter Analysis
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Is your resume <span className="text-emerald-400">ready to apply?</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Upload your resume for an instant two-tier evaluation of your ATS machine read rate and recruiter content quality.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative space-y-6">
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 sm:p-12 text-center transition-all bg-slate-950/40 relative group cursor-pointer">
              <input
                id="analyzer-resume-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-base font-bold text-emerald-400">{file.name}</p>
                  <p className="text-xs text-slate-400">Click below to start your audit</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-white">
                    Drop your resume here, or <span className="text-emerald-400 underline underline-offset-4">browse file</span>
                  </p>
                  <p className="text-xs text-slate-400">Supports PDF & DOCX up to 10MB</p>
                </div>
              )}
            </div>

            {showTextInput && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase">Or Paste Plain Resume Text</label>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your professional summary, experience bullets, and skills..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowTextInput(!showTextInput)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {showTextInput ? 'Hide text paste' : 'Paste resume text instead'}
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Resume Audit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* ========================================================
            REPORT VIEW (Spacious Enhancv Split-Screen Layout)
           ======================================================== */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Top Score Summary Banner */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            
            {/* Banner Top Row: Percentile Badge & Action */}
            <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Award className="w-3.5 h-3.5" /> {percentileText}
              </div>

              <button
                onClick={() => { setResult(null); setAtsResume(''); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700/60 hover:border-slate-600 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Upload Another
              </button>
            </div>

            {/* Score Ring & Gauges Content */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
              {/* Score Ring */}
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950 border-4 border-emerald-500 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/10 shrink-0">
                  <span className="text-3xl font-black text-white">{overallScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OUT OF 100</span>
                  <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                    {grade}
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">Resume Audit Scorecard</h2>
                  <p className="text-xs text-slate-400 max-w-md">
                    Evaluated across key ATS parsing algorithms, keyword density, and recruiter impact.
                  </p>
                </div>
              </div>

              {/* Two-Tier Summary Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full xl:w-auto shrink-0">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl w-full sm:w-48 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ATS Parse Rate</span>
                    <span className="font-extrabold text-blue-400">{atsParseRate}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${atsParseRate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">Machine readability</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl w-full sm:w-48 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Recruiter Review</span>
                    <span className="font-extrabold text-emerald-400">{recruiterReview}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${recruiterReview}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">Content & metrics impact</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================
              SPLIT SCREEN: 60% ATS REPORT / 40% LIVE RESUME PREVIEW
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Clean ATS Intelligence Report (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Core ATS Pillars Breakdown */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">ATS Scoring Pillars</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Industry-Standard Multi-Factor Model</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Formatting & Layout", score: formattingScore, desc: "Headers & parsability" },
                    { label: "Keywords & Terms", score: keywordsScore, desc: "Tech domain matches" },
                    { label: "Experience Impact", score: experienceScore, desc: "Metrics & action verbs" },
                    { label: "Skills Alignment", score: skillsScore, desc: "Hard & soft competencies" },
                    { label: "Education & Academics", score: educationScore, desc: "Degrees & institutions" },
                    { label: "Projects & Portfolio", score: projectsScore, desc: "Real-world systems" },
                  ].map((pillar, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold text-xs truncate">{pillar.label}</span>
                        <span className={`font-black text-xs ${pillar.score >= 85 ? 'text-emerald-400' : pillar.score >= 70 ? 'text-blue-400' : 'text-amber-400'}`}>
                          {pillar.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pillar.score >= 85 ? 'bg-emerald-500' : pillar.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${pillar.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Key Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {strengths && strengths.length > 0 ? (
                      strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">Well-structured linear layout and readable typography.</li>
                    )}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Areas for Improvement</h4>
                  </div>
                  <ul className="space-y-2">
                    {weaknesses && weaknesses.length > 0 ? (
                      weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{weak}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">Add more quantifiable metrics (%, $) to your experience bullets.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommended Keywords & Missing Skills */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Recommended Keywords & Skills</h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Integrating these keywords into your skills and work experience will boost your ATS match rate.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[...missingKeywords, ...missingSkills].map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span className="text-blue-400 font-bold">+</span> {kw}
                    </span>
                  ))}
                  {missingKeywords.length === 0 && missingSkills.length === 0 && (
                    <span className="text-xs text-emerald-400 font-medium">All major domain keywords detected!</span>
                  )}
                </div>
              </div>

              {/* AI Improved Summary */}
              {improvedSummary && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> AI-Optimized Professional Summary
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(improvedSummary);
                        addToast('Summary copied to clipboard!', 'success');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    {improvedSummary}
                  </p>
                </div>
              )}

              {/* CAR FORMULA BEFORE & AFTER SECTION */}
              {bulletTransformations.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> CAR Formula Rewrites
                    </span>
                    <h3 className="text-base font-bold text-white">Before vs After Bullet Point Transformation</h3>
                    <p className="text-xs text-slate-400">Convert passive job duties into quantifiable achievement bullets.</p>
                  </div>

                  <div className="space-y-4">
                    {bulletTransformations.map((trans, idx) => (
                      <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Before (Passive)</span>
                          <p className="text-xs text-slate-400 italic">"{trans.original}"</p>
                        </div>

                        <div className="space-y-1 bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">After (CAR Result)</span>
                            <button
                              onClick={() => handleCopyBullet(trans.improved, idx)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            >
                              {copiedBulletIdx === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-xs text-white font-medium">"{trans.improved}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Impact Action Verbs */}
              {actionVerbs && actionVerbs.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    High-Impact Action Verbs To Use
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {actionVerbs.map((verb, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/60 text-slate-200 text-xs font-semibold"
                      >
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Live Resume Preview Sheet & 1-Click Fix (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              
              {/* 1-Click Generator Action Card */}
              <div className="bg-gradient-to-br from-emerald-950/30 via-slate-900 to-teal-950/30 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-xl shadow-emerald-500/5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5" /> 1-Click Optimization
                  </span>
                  <h3 className="text-lg font-black text-white">Optimize Resume Automatically</h3>
                  <p className="text-xs text-slate-300">
                    Generate an ATS-certified version applying all CAR bullet metrics, missing keywords, and clean headings.
                  </p>
                </div>

                <button
                  onClick={handleGenerateFullATSResume}
                  disabled={generatingResume}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingResume ? 'animate-spin' : ''}`} />
                  {generatingResume ? 'Building Optimized Resume...' : 'Generate 100% ATS Resume'}
                </button>
              </div>

              {/* Live Paper Document Viewer Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> {atsResume ? '100% ATS Optimized Resume' : 'Parsed Resume Document'}
                  </span>
                  
                  {atsResume && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyResume}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-[11px] font-bold text-slate-950 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* White Realistic Paper Sheet */}
                <div
                  id="ats-resume-rendered-document"
                  className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 text-left font-sans max-h-[600px] overflow-y-auto leading-relaxed select-text text-xs"
                >
                  {atsResume ? (
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(atsResume) }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                      {rawText || "No raw text available. Please upload a file or paste text to see live preview."}
                    </pre>
                  )}
                </div>

                {atsResume && (
                  <button
                    onClick={() => navigate('/resume-builder')}
                    className="w-full py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-300 hover:bg-blue-600/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" /> Customize in Interactive Resume Builder
                  </button>
                )}
              </div>

            </div>

          </div>

        </motion.div>
      )}

    </div>
  );
}
