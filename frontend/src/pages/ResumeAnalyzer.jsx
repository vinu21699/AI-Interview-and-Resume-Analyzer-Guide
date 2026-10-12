import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, Download,
  Layers, Check, ArrowRight, RefreshCw, BarChart2, Copy, FileEdit, Wand2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [atsResume, setAtsResume] = useState('');
  const [generatingResume, setGeneratingResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file && !rawText.trim()) {
      addToast('Please upload a PDF/DOCX file or paste resume text.', 'error');
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
      addToast('Resume analysis & ATS calculation complete!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed. Please check file format.', 'error');
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
      addToast('Generated 100% ATS-Optimized Resume incorporating all missing areas!', 'success');
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

  const handleDownloadTxt = () => {
    if (!atsResume) return;
    const element = document.createElement('a');
    const blob = new Blob([atsResume], { type: 'text/markdown' });
    element.href = URL.createObjectURL(blob);
    element.download = 'ATS_Optimized_Resume.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Downloaded ATS_Optimized_Resume.md', 'success');
  };

  const handleDownloadPDF = () => {
    const el = document.getElementById('ats-resume-rendered-document');
    if (!el) {
      addToast('Resume document not found', 'error');
      return;
    }

    if (window.html2pdf) {
      addToast('Downloading 100% ATS Resume PDF to your system...', 'info');
      const opt = {
        margin:       [10, 15, 10, 15],
        filename:     '100%_ATS_Optimized_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(el).save();
    } else {
      window.print();
    }
  };

  const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/^# (.*$)/gim, '<h1 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 22px; font-weight: 800; color: #000000; text-transform: uppercase; text-align: center; margin-bottom: 4px;">$1</h1>')
      .replace(/^\*\*(.*?)\*\*/gim, '<div style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 13px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 6px;">$1</div>')
      .replace(/^## (.*$)/gim, '<h2 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 13px; font-weight: 800; color: #000000; text-transform: uppercase; border-bottom: 1.5px solid #000000; padding-bottom: 3px; margin-top: 18px; margin-bottom: 8px;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 style="font-family: Arial, Calibri, Helvetica, sans-serif; font-size: 12px; font-weight: 700; color: #000000; margin-top: 10px; margin-bottom: 4px;">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li style="font-family: Arial, Calibri, Helvetica, sans-serif; margin-bottom: 4px; font-size: 11.5px; color: #000000; line-height: 1.5;">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-family: Arial, Calibri, Helvetica, sans-serif; color: #000000; font-weight: 700;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-family: Arial, Calibri, Helvetica, sans-serif; color: #334155;">$1</em>');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" /> AI Resume Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white">ATS Resume Analyzer & 100% ATS Generator</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Upload your resume to receive an immediate ATS score breakdown (0-100), missing keyword analysis, and instantly generate a fully developed 100% ATS-friendly resume!
        </p>
      </div>

      {!result ? (
        <div className="glass-card p-8 border border-slate-800 max-w-3xl mx-auto">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Upload Resume (PDF, DOCX, TXT)</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors bg-slate-950/50 cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <p className="text-sm font-semibold text-emerald-400">{file.name} ready for parsing</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-200">Drag & drop your resume file here or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span>OR PASTE RESUME TEXT</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            {/* Raw Text Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Paste Resume Text</label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your professional summary, experience bullet points, education, and technical skills..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Analyze Resume & Generate ATS Report
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Main Score Banner */}
          <div className="glass-card p-8 border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-blue-500 flex flex-col items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                <span className="text-3xl font-extrabold text-white">{result.ats_score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ATS SCORE</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Resume Performance Analysis</h2>
                <p className="text-xs text-slate-400">
                  Calculated against modern Applicant Tracking System standards (Workday, Greenhouse, Lever).
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
                    Formatting: {result.formatting_score}%
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400">
                    Keywords: {result.keywords_score}%
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                    Skills: {result.skills_score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => { setResult(null); setAtsResume(''); }} className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white">
                Re-analyze
              </button>
            </div>
          </div>

          {/* 🌟 100% ATS-OPTIMIZED RESUME GENERATOR SECTION */}
          <div className="glass-card p-8 border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-blue-950/30 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                  <Wand2 className="w-3.5 h-3.5" /> 100% ATS-Optimized Generator
                </div>
                <h3 className="text-xl font-extrabold text-white">Generate 100% ATS-Friendly Fully Developed Resume</h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Automatically incorporates all missing technical skills ({result.missing_skills?.length || 0}), missing industry keywords ({result.missing_keywords?.length || 0}), action verb rewrites, and STAR impact metrics into a complete resume!
                </p>
              </div>

              <button
                onClick={handleGenerateFullATSResume}
                disabled={generatingResume}
                className="gradient-btn px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${generatingResume ? 'animate-spin' : ''}`} />
                {generatingResume ? 'Building 100% ATS Resume...' : 'Build 100% ATS Optimized Resume'}
              </button>
            </div>

            {/* Rendered Full ATS Document View & Actions */}
            {atsResume && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-emerald-500/30">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fully Generated 100% ATS Resume Document
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResume}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" /> {copied ? 'Copied!' : 'Copy Text'}
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>

                    <button
                      onClick={() => navigate('/resume-builder')}
                      className="px-3.5 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-blue-400" /> Edit in Resume Builder
                    </button>
                  </div>
                </div>

                {/* Rendered Full A4 Resume Document Card (NOT raw code snippet!) */}
                <div
                  id="ats-resume-rendered-document"
                  className="bg-white text-slate-950 p-10 rounded-2xl shadow-2xl border border-slate-300 font-sans max-w-4xl mx-auto text-left leading-relaxed my-2"
                >
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(atsResume) }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Detailed Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Resume Strengths
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {result.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses & Fixes */}
            <div className="glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Key Improvement Areas
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {result.weaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords & Action Verbs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Missing Industry Keywords & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map((sk, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-300 font-medium">
                    + {sk}
                  </span>
                ))}
                {result.missing_keywords?.map((kw, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Recommended Action Verbs
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.action_verb_suggestions?.map((verb, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-300 font-medium">
                    ⚡ {verb}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Improved Professional Summary Rewrite */}
          <div className="glass-card p-6 border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" /> AI-Generated Professional Summary Rewrite
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              "{result.improved_summary}"
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

