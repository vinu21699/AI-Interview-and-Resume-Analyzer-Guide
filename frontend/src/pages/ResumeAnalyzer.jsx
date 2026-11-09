import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Download,
  RefreshCw, Copy, FileEdit, Sliders, Award, Zap, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadAtsPdfFromMarkdown } from '../utils/atsPdfGenerator';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsResume, setAtsResume] = useState('');
  const [generatingResume, setGeneratingResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();

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
      addToast('Please upload a PDF or DOCX file first.', 'warning');
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

      addToast('Resume analysis complete.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed. Check your file format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleAnalyze = async () => {
    const sample = `John Doe
Senior Software Engineer
Email: john.doe@example.com | Phone: (555) 234-5678 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience architecting distributed backend services, high-throughput microservices, and modern web applications using Python, React, FastAPI, and PostgreSQL.

PROFESSIONAL EXPERIENCE
Senior Software Engineer | CloudScale Inc. | 2022 - Present
- Architected high-throughput RESTful microservices in FastAPI and PostgreSQL, reducing p99 response latency by 38% across 1.4M daily requests.
- Spearheaded migration of monolithic services to Kubernetes and Docker on AWS, cutting infrastructure spend by $120,000 annually.
- Mentored 5 junior engineers and standardized CI/CD deployment pipelines.

Software Developer | FinTech Nexus | 2019 - 2022
- Developed core payment transaction engine processing $15M+ in monthly transaction volume with 99.99% system uptime.
- Optimized PostgreSQL database queries and connection pooling, boosting query throughput by 42%.
- Built real-time dashboard analytics using React, TypeScript, and Tailwind CSS.

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
      addToast('Sample resume audit loaded.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Sample load failed.', 'error');
    } finally {
      setLoading(false);
    }
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
      addToast('Generated ATS-optimized resume.', 'success');
    } catch (err) {
      addToast('Failed to generate ATS resume.', 'error');
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleCopyResume = () => {
    if (!atsResume) return;
    navigator.clipboard.writeText(atsResume);
    setCopied(true);
    addToast('Resume content copied.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    addToast('Bullet copied.', 'success');
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleDownloadPDF = () => {
    const resumeTextToExport = atsResume || rawText;
    if (!resumeTextToExport || !resumeTextToExport.trim()) {
      addToast('No resume content available to download.', 'warning');
      return;
    }

    try {
      downloadAtsPdfFromMarkdown(resumeTextToExport, 'ats_optimized_resume.pdf');
      addToast('PDF downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export PDF: ' + err.message, 'error');
    }
  };

  const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/^# (.*$)/gim, '<h1 style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; color: #111827; text-transform: uppercase; text-align: center; margin-bottom: 4px;">$1</h1>')
      .replace(/^\*\*(.*?)\*\*/gim, '<div style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 600; color: #4b5563; text-align: center; margin-bottom: 6px;">$1</div>')
      .replace(/^## (.*$)/gim, '<h2 style="font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; color: #111827; text-transform: uppercase; border-bottom: 1px solid #d1d5db; padding-bottom: 2px; margin-top: 12px; margin-bottom: 4px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-family: Arial, sans-serif; font-size: 10.5px; font-weight: 600; color: #1f2937; margin-top: 6px; margin-bottom: 2px;">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li style="font-family: Arial, sans-serif; margin-bottom: 2px; font-size: 10.5px; color: #374151; line-height: 1.45;">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-family: Arial, sans-serif; color: #111827; font-weight: 600;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-family: Arial, sans-serif; color: #4b5563;">$1</em>');
  };

  const reportData = result?.report_data || {};
  const bulletTransformations = reportData?.bullet_transformations || [];

  const overallScore = reportData?.overall_score ?? result?.ats_score ?? 0;
  const atsParseRate = reportData?.ats_parse_rate ?? result?.formatting_score ?? 0;
  const recruiterReview = reportData?.recruiter_review ?? result?.experience_score ?? 0;
  const grade = reportData?.grade || (overallScore >= 90 ? "Strong" : overallScore >= 75 ? "Competitive" : overallScore >= 60 ? "Moderate" : "Needs revision");
  const percentileText = reportData?.percentile_text || `Ranked top ${Math.max(5, 100 - overallScore)}% of analyzed engineering resumes`;

  const strengths = result?.strengths || [];
  const weaknesses = result?.weaknesses || [];
  const missingKeywords = result?.missing_keywords || [];
  const missingSkills = result?.missing_skills || [];
  const improvedSummary = result?.improved_summary || '';
  const actionVerbs = result?.action_verb_suggestions || ['Engineered', 'Architected', 'Spearheaded', 'Optimized', 'Automated'];
  const formattingScore = result?.formatting_score ?? reportData?.formatting_score ?? atsParseRate ?? 0;
  const keywordsScore = result?.keywords_score ?? reportData?.keywords_score ?? 0;
  const experienceScore = result?.experience_score ?? reportData?.experience_score ?? recruiterReview ?? 0;
  const skillsScore = result?.skills_score ?? reportData?.skills_score ?? 0;
  const educationScore = result?.education_score ?? reportData?.education_score ?? 0;
  const projectsScore = result?.projects_score ?? reportData?.projects_score ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Upload State */}
      {!result ? (
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ATS & Recruiter Engine</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Resume evaluation
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your resume for a structural audit covering ATS parsing, keyword coverage, and bullet impact.
            </p>
          </div>

          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-5">
            <div className="border border-dashed border-white/[0.12] hover:border-emerald-500/40 rounded-lg p-8 text-center transition-colors bg-[#141415] relative group cursor-pointer">
              <input
                id="analyzer-resume-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <div className="w-10 h-10 rounded-lg bg-[#232325] border border-white/[0.08] text-slate-300 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-4 h-4" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-emerald-400 font-mono">{file.name}</p>
                  <p className="text-[11px] text-slate-500">Ready to audit</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-200">
                    Drop resume file here, or <span className="text-emerald-400 hover:underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">PDF, DOCX up to 10MB</p>
                </div>
              )}
            </div>

            {showTextInput && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">Plain text resume</label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste experience, skills, and projects..."
                  className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-3 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-white/20"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTextInput(!showTextInput)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showTextInput ? 'Hide text input' : 'Paste text instead'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSampleAnalyze}
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-xs font-medium text-slate-300 border border-white/[0.08] transition-colors"
                >
                  Load sample
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Analyze resume</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* Report View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Top Score Summary Banner */}
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-white/[0.06]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#232325] border border-white/[0.08] text-xs text-slate-300 font-mono">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{percentileText}</span>
              </div>

              <button
                onClick={() => { setResult(null); setAtsResume(''); }}
                className="px-3 py-1.5 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-xs font-medium text-slate-300 border border-white/[0.08] transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload another</span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-[#141415] border border-white/[0.08] flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl font-semibold text-white font-mono tabular-nums">{overallScore}</span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium text-white">Resume score</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    Evaluated across parsing compatibility, keyword density, and recruiter scan rate.
                  </p>
                </div>
              </div>

              {/* Two-Tier Summary Gauges */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
                <div className="bg-[#141415] border border-white/[0.08] p-3 rounded-lg w-full sm:w-40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">ATS parsing</span>
                    <span className="font-mono text-emerald-400 tabular-nums">{atsParseRate}%</span>
                  </div>
                  <div className="w-full bg-[#232325] h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${atsParseRate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Machine read rate</p>
                </div>

                <div className="bg-[#141415] border border-white/[0.08] p-3 rounded-lg w-full sm:w-40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Recruiter review</span>
                    <span className="font-mono text-white tabular-nums">{recruiterReview}%</span>
                  </div>
                  <div className="w-full bg-[#232325] h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full rounded-full" style={{ width: `${recruiterReview}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Content and metrics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Report Details */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* ATS Pillars Breakdown */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-medium text-white uppercase tracking-wider">Evaluation pillars</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">6 categories</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: "Formatting & Layout", score: formattingScore, desc: "Headers & parsability" },
                    { label: "Keywords & Terms", score: keywordsScore, desc: "Tech domain matches" },
                    { label: "Experience Impact", score: experienceScore, desc: "Action verbs & metrics" },
                    { label: "Skills Alignment", score: skillsScore, desc: "Hard & soft competencies" },
                    { label: "Academics", score: educationScore, desc: "Degrees & institutions" },
                    { label: "Projects", score: projectsScore, desc: "Real-world systems" },
                  ].map((pillar, idx) => (
                    <div key={idx} className="bg-[#141415] border border-white/[0.08] p-3 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate">{pillar.label}</span>
                        <span className="font-mono text-xs tabular-nums text-white">
                          {pillar.score}%
                        </span>
                      </div>
                      <div className="w-full bg-[#232325] h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${pillar.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Key strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {strengths && strengths.length > 0 ? (
                      strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-400">·</span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">Clear structure and readable hierarchy.</li>
                    )}
                  </ul>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Areas to improve</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {weaknesses && weaknesses.length > 0 ? (
                      weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-400">·</span>
                          <span>{weak}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic">Add quantifiable metrics to experience bullets.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Skills & Keywords */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-medium text-white uppercase tracking-wider">Recommended keywords</h4>
                  <p className="text-xs text-slate-400">
                    Integrating these terms into your skills and experience will improve match confidence.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...missingKeywords, ...missingSkills].map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#232325] border border-white/[0.08] text-slate-300 text-xs font-mono"
                    >
                      +{kw}
                    </span>
                  ))}
                  {missingKeywords.length === 0 && missingSkills.length === 0 && (
                    <span className="text-xs text-emerald-400 font-mono">All core domain keywords detected.</span>
                  )}
                </div>
              </div>

              {/* AI Improved Summary */}
              {improvedSummary && (
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Optimized summary suggestion</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(improvedSummary);
                        addToast('Summary copied.', 'success');
                      }}
                      className="px-2 py-1 rounded bg-[#232325] hover:bg-[#2c2c30] text-[11px] font-mono text-slate-300 flex items-center gap-1 transition-colors border border-white/[0.08]"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#141415] p-3.5 rounded-lg border border-white/[0.08]">
                    {improvedSummary}
                  </p>
                </div>
              )}

              {/* CAR Formula Rewrites */}
              {bulletTransformations.length > 0 && (
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-medium text-white uppercase tracking-wider">Before & after bullet rewrites</h3>
                    <p className="text-xs text-slate-400">Context-Action-Result format with quantifiable outputs.</p>
                  </div>

                  <div className="space-y-3">
                    {bulletTransformations.map((trans, idx) => (
                      <div key={idx} className="bg-[#141415] border border-white/[0.08] rounded-lg p-3.5 space-y-2.5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Original</span>
                          <p className="text-xs text-slate-400">"{trans.original}"</p>
                        </div>

                        <div className="space-y-1 bg-[#19191b] border border-white/[0.08] p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase">Quantified</span>
                            <button
                              onClick={() => handleCopyBullet(trans.improved, idx)}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#232325] text-slate-300 hover:text-white border border-white/[0.08]"
                            >
                              {copiedBulletIdx === idx ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-200">"{trans.improved}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Verbs */}
              {actionVerbs && actionVerbs.length > 0 && (
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Recommended action verbs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {actionVerbs.map((verb, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#232325] border border-white/[0.08] text-slate-300 text-xs font-mono"
                      >
                        {verb}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Live Document Preview */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
              
              {/* Generate Optimized Card */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white">Generate optimized version</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Builds an ATS-compliant resume applying all CAR metrics, missing keywords, and standard headings.
                  </p>
                </div>

                <button
                  onClick={handleGenerateFullATSResume}
                  disabled={generatingResume}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingResume ? 'animate-spin' : ''}`} />
                  <span>{generatingResume ? 'Generating...' : 'Generate ATS version'}</span>
                </button>
              </div>

              {/* Document Sheet */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{atsResume ? 'Optimized output' : 'Parsed text'}</span>
                  </span>
                  
                  {atsResume && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyResume}
                        className="px-2 py-1 rounded-md bg-[#232325] text-[11px] font-mono text-slate-300 hover:text-white border border-white/[0.08]"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="px-2.5 py-1 rounded-md bg-emerald-500 text-[11px] font-medium text-graphite-950 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                <div
                  id="ats-resume-rendered-document"
                  className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 text-left font-sans max-h-[550px] overflow-y-auto leading-relaxed select-text text-xs"
                >
                  {atsResume ? (
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(atsResume) }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                      {rawText || "No text available. Upload a file or paste text to preview."}
                    </pre>
                  )}
                </div>

                {atsResume && (
                  <button
                    onClick={() => navigate('/resume-builder')}
                    className="w-full py-2 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-slate-300 text-xs font-medium border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit in builder</span>
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
