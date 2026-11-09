import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, Award, Check, ChevronDown, ChevronUp,
  RefreshCw, BarChart3, Target, Mic, Code2, Sparkles, Sliders,
  Terminal, Zap, Flame, Compass, Eye
} from 'lucide-react';

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('defense'); // 'defense' | 'claims' | 'pressure' | 'radar' | 'templates'
  const [activeTemplatePreview, setActiveTemplatePreview] = useState('modern');
  const [faqOpen, setFaqOpen] = useState({ 0: true });
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      addToast('Please select a resume file (PDF or DOCX).', 'warning');
      const fileInput = document.getElementById('landing-resume-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('file', file);

      let token = localStorage.getItem('token');
      if (!token) {
        try {
          const authRes = await api.post('/auth/login', {
            email: 'user@nexhire.ai',
            password: 'user123'
          });
          if (authRes.data?.access_token) {
            localStorage.setItem('token', authRes.data.access_token);
            token = authRes.data.access_token;
          }
        } catch {
          // guest fallback
        }
      }

      const res = await api.post('/resume/analyze', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      sessionStorage.setItem('initialAnalysis', JSON.stringify(res.data));
      addToast('Resume audit complete. Redirecting to report...', 'success');
      navigate('/resume-analyzer');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed. Please check the file format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="min-h-screen bg-[#141415] text-[#ededed] font-sans selection:bg-emerald-500 selection:text-[#0f0f10] bg-ambient-top">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#141415]/90 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-12 h-14 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-[#ededed]">NexHire</span>
              <span className="text-xs text-[#85858b] font-mono">2.0</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#a1a1a6]">
            <Link to="/resume-claim-verification" className="hover:text-[#ededed] transition-colors">Claim verification</Link>
            <Link to="/project-defense" className="hover:text-[#ededed] transition-colors">Project defense</Link>
            <Link to="/mock-interview" className="hover:text-[#ededed] transition-colors">Pressure mode</Link>
            <Link to="/resume-builder" className="hover:text-[#ededed] transition-colors">Resume templates</Link>
            <Link to="/company-prep" className="hover:text-[#ededed] transition-colors">Target prep</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#a1a1a6] hover:text-[#ededed] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-1.5"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19191b] border border-white/[0.08] text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Placement Readiness Engine • 7 Evaluative Rounds</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
            From resume claim to <br className="hidden sm:inline" />
            <span className="text-emerald-400">rigorous project defense.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Eliminate candidate doubt. AI cross-questions your actual projects, challenges weak answers in pressure mode, and benchmarks placement readiness out of 100.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Candidate Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/resume-builder"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-slate-200 text-xs font-medium border border-white/[0.08] transition-colors"
            >
              Browse 4 Resume Templates
            </Link>
          </div>
        </div>

        {/* Live Interactive Product Simulator */}
        <div className="mt-12 bg-[#19191b] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2 bg-[#141415] overflow-x-auto gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-mono text-[11px] text-slate-500">nexhire-terminal ~ v2.0</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'defense', label: '1. Project Defense Viva', icon: Terminal },
                { id: 'claims', label: '2. Claim Verification', icon: ShieldCheck },
                { id: 'pressure', label: '3. Pressure Interview', icon: Flame },
                { id: 'radar', label: '4. Weakness Radar', icon: Compass },
                { id: 'templates', label: '5. Resume Templates', icon: Layout },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#232325] text-white border border-white/[0.08]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Screen Container */}
          <div className="p-6 sm:p-8 min-h-[420px] bg-[#0f0f10]">
            
            {/* VIEW 1: PROJECT DEFENSE SIMULATOR */}
            {activeTab === 'defense' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Round 5 of 7 • "Why" Questions</span>
                    <h3 className="text-sm font-semibold text-white">Project: High-Throughput RESTful Microservices</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#232325] text-slate-300 border border-white/[0.08]">
                    Strict Examiner Mode
                  </span>
                </div>

                <div className="bg-[#141415] border border-white/[0.08] rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>AI Examiner Question:</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed">
                    "You claimed you chose FastAPI and PostgreSQL to reduce p99 response latency by 38%. Why did you choose PostgreSQL over a document store like MongoDB given the high request throughput, and how did you prevent database connection pool exhaustion under load?"
                  </p>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-lg p-4 space-y-3">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Live Evaluation Matrix</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-[#141415] border border-white/[0.06]">
                      <span className="text-slate-400 block text-[10px]">Architecture</span>
                      <span className="font-mono text-emerald-400 text-sm font-semibold">82%</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141415] border border-white/[0.06]">
                      <span className="text-slate-400 block text-[10px]">Technical Knowledge</span>
                      <span className="font-mono text-emerald-400 text-sm font-semibold">88%</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141415] border border-white/[0.06]">
                      <span className="text-slate-400 block text-[10px]">Justification</span>
                      <span className="font-mono text-white text-sm font-semibold">76%</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141415] border border-white/[0.06]">
                      <span className="text-slate-400 block text-[10px]">Overall Defense</span>
                      <span className="font-mono text-emerald-400 text-sm font-semibold">82/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/project-defense" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span>Launch full 7-round Project Defense</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 2: CLAIM VERIFICATION SIMULATOR */}
            {activeTab === 'claims' && (
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Detected Resume Claim</span>
                    <h3 className="text-sm font-semibold text-white">"Engineered distributed caching layer in Redis reducing DB load by 45%"</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Confidence: 84%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#141415] border border-white/[0.08] rounded-lg p-4 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 block uppercase">1. Technical Question</span>
                    <p className="text-slate-300">How did you handle cache invalidation and prevent stale data reads when writing updates?</p>
                  </div>
                  <div className="bg-[#141415] border border-white/[0.08] rounded-lg p-4 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 block uppercase">2. Architectural Tradeoff</span>
                    <p className="text-slate-300">What eviction policy (LRU, LFU, TTL) did you configure and what was the memory footprint?</p>
                  </div>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-lg p-3.5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Diagnosis: Strong technical evidence. Candidate demonstrated clear cache stampede mitigation.</span>
                  <Link to="/resume-claim-verification" className="text-emerald-400 hover:underline shrink-0 ml-4 font-mono text-[11px]">
                    Verify all claims →
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 3: PRESSURE INTERVIEW SIMULATOR */}
            {activeTab === 'pressure' && (
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Pressure Mode Interview Simulation</h3>
                  </div>
                  <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    Timer: 00:42
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-[#141415] border border-white/[0.08] p-3 rounded-lg text-slate-300">
                    <strong className="text-slate-500 font-mono block text-[10px] mb-0.5">AI Interviewer:</strong>
                    "You said you understand database indexing. What is the fundamental difference between a clustered and non-clustered index in PostgreSQL?"
                  </div>
                  <div className="bg-[#232325] border border-white/[0.08] p-3 rounded-lg text-white ml-6">
                    <strong className="text-emerald-400 font-mono block text-[10px] mb-0.5">Candidate:</strong>
                    "A clustered index determines the physical order of data on disk, while a non-clustered index stores a separate pointer to the data rows."
                  </div>
                  <div className="bg-[#141415] border border-amber-500/20 p-3 rounded-lg text-amber-300">
                    <strong className="text-amber-400 font-mono block text-[10px] mb-0.5">Pressure Follow-up:</strong>
                    "That's standard textbook theory. Now explain what happens to write throughput when you add 5 non-clustered indexes to a high-write table. Give me the I/O cost."
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/mock-interview" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span>Try Pressure Interview Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 4: WEAKNESS RADAR & PRACTICE */}
            {activeTab === 'radar' && (
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-sm font-semibold text-white">Placement Readiness: 76 / 100</h3>
                  <span className="font-mono text-[11px] text-slate-400">7 Core Competencies Analyzed</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-500 block text-[10px]">DSA Arrays/Trees</span>
                    <span className="text-rose-400 text-sm font-semibold">42%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-500 block text-[10px]">SQL Queries</span>
                    <span className="text-amber-400 text-sm font-semibold">61%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-500 block text-[10px]">Technical Interview</span>
                    <span className="text-rose-400 text-sm font-semibold">48%</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-500 block text-[10px]">Python / Backend</span>
                    <span className="text-emerald-400 text-sm font-semibold">84%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#141415] border border-white/[0.08] space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">AI Diagnostic Next Step</span>
                  <p className="text-slate-300">
                    Weakness detected in <strong className="text-white">HashMaps & Graphs</strong> (42%). 7-day personalized curriculum generated: Day 1 HashMap fundamentals $\rightarrow$ Day 3 Two Sum $\rightarrow$ Day 6 Timed assessment.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Link to="/dashboard" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span>View full Weakness Radar on Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 5: RESUME TEMPLATES SHOWCASE */}
            {activeTab === 'templates' && (
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-white">4 ATS-Optimized Resume Formats</h3>
                  <div className="flex items-center gap-1">
                    {['modern', 'executive', 'split', 'minimalist'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTemplatePreview(t)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-colors ${
                          activeTemplatePreview === t ? 'bg-[#232325] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white text-slate-900 p-6 rounded-lg text-xs space-y-2.5 max-h-64 overflow-hidden shadow-inner border border-slate-200">
                  <div className="border-b pb-2 flex justify-between items-baseline">
                    <span className="font-bold text-base text-slate-950">ALEX JOHNSON</span>
                    <span className="text-[10px] font-mono text-slate-600">SENIOR SOFTWARE ENGINEER</span>
                  </div>
                  <p className="text-[10.5px] text-slate-700 italic">
                    Format: {activeTemplatePreview.toUpperCase()} • Clean vector text rendering • 100% Workday / Greenhouse ATS parse compatibility.
                  </p>
                  <div className="text-[10.5px] text-slate-800">
                    <strong>Technical Skills:</strong> Python, React, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, Go
                  </div>
                  <div className="text-[10.5px] text-slate-800">
                    <strong>Experience:</strong> Senior Engineer at TechCorp Solutions (2023 - Present) — Architected microservices with 99.99% uptime.
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/resume-builder" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span>Customize and Export in Resume Builder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Dropzone Upload Section */}
        <div className="mt-16 bg-[#19191b] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-4 max-w-2xl mx-auto">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold text-white">Audit your existing resume</h2>
            <p className="text-xs text-slate-400">Upload your PDF or DOCX to detect claim risks, ATS compatibility, and keyword gaps.</p>
          </div>

          <div className="border border-dashed border-white/[0.12] hover:border-emerald-500/40 rounded-lg p-6 text-center transition-colors bg-[#141415] relative group cursor-pointer">
            <input
              id="landing-resume-file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-9 h-9 rounded-lg bg-[#232325] border border-white/[0.08] text-slate-300 mx-auto flex items-center justify-center mb-2">
              <Upload className="w-4 h-4" />
            </div>
            {file ? (
              <p className="text-xs font-mono text-emerald-400">{file.name}</p>
            ) : (
              <p className="text-xs text-slate-300">
                Drop resume file here, or <span className="text-emerald-400 hover:underline">browse</span>
              </p>
            )}
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">PDF or DOCX up to 10MB</p>
          </div>

          <button
            onClick={handleUploadAndAnalyze}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{loading ? 'Evaluating resume...' : 'Run instant placement audit'}</span>
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto space-y-3">
          <h3 className="text-base font-semibold text-white text-center pb-2">Frequently asked questions</h3>
          {[
            {
              q: "How does Project Defense (Viva Mode) differ from generic AI mock interviews?",
              a: "Unlike generic mock interviewers that ask superficial questions, Project Defense acts as a strict technical examiner across 7 progressive rounds, asking deep 'Why?' questions and adaptive follow-ups based specifically on your previous answer."
            },
            {
              q: "How does the Placement Readiness Score calculate my readiness?",
              a: "Your score is a calibrated multi-factor index combining Resume ATS Parsability (15%), Algorithmic DSA (20%), SQL Proficiency (15%), Technical Viva (20%), Project Execution (15%), and Engineering Communication (15%)."
            },
            {
              q: "Are the resume templates compatible with enterprise ATS systems like Workday and Greenhouse?",
              a: "Yes. All 4 templates are engineered with standard linear headings, vector-glyph typography, and zero table-nested columns that break parsing engines."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#19191b] border border-white/[0.08] rounded-lg p-4 space-y-2">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left text-xs font-medium text-white"
              >
                <span>{item.q}</span>
                {faqOpen[idx] ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />}
              </button>
              {faqOpen[idx] && (
                <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-white/[0.04]">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#0f0f10] py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <p>NexHire 2.0 • AI Technical Placement & Claim Verification Engine</p>
      </footer>
    </div>
  );
}
