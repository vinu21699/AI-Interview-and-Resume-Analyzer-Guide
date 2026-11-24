import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, ArrowRight,
  ShieldCheck, Check, ChevronDown, ChevronUp,
  RefreshCw, Target, Code2, Sparkles,
  Terminal, Flame, Compass, Layout,
  Lock, Layers, LogIn, UserPlus, LogOut,
  Activity, Cpu, Database, CheckCircle, Clock,
  FileCheck, Shield, HelpCircle, Laptop, Award
} from 'lucide-react';

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('resume');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Strict gating: Unauthenticated visitors cannot access internal modules without logging in
  const handleProtectedNavigation = (path, featureName = 'This feature') => {
    if (!user) {
      addToast(`Please sign in or create an account to access ${featureName}.`, 'warning');
      navigate('/login', { state: { from: { pathname: path } } });
      return;
    }
    navigate(path);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        addToast('Resume file exceeds maximum limit of 10MB.', 'error');
        return;
      }
      setFile(selected);
      addToast(`Attached "${selected.name}" successfully.`, 'success');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!user) {
      addToast('Please sign in before submitting resumes for analysis.', 'warning');
      navigate('/login');
      return;
    }

    if (!file) {
      addToast('Please select a resume file (PDF or DOCX) to analyze.', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Resume analyzed successfully.', 'success');
      navigate(`/dashboard?analysis_id=${res.data.id || ''}`);
    } catch (err) {
      addToast('Failed to analyze resume. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="gloss-ambient-backdrop min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Skip to Content for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      {/* Glossy Floating Navigation Bar */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-4 sm:px-6">
        <nav
          aria-label="Primary"
          className="gloss-panel rounded-2xl px-5 sm:px-7 h-16 flex items-center justify-between shadow-[0_16px_36px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.22)] border border-white/[0.12]"
        >
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_12px_rgba(99,102,241,0.4)] border border-white/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-base tracking-tight text-white group-hover:text-slate-200 transition-colors">NexHire</span>
              <span className="text-[10px] text-indigo-300 font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/25">2.0</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleProtectedNavigation('/resume-analyzer', 'Resume Review')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Resume Review</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/mock-interview', 'Technical Mock Interviews')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Mock Interviews</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/coding-sandbox', 'Coding Sandbox')}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Coding Sandbox</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-white transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="gloss-btn-primary px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="gloss-btn-primary px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content">
        
        {/* HERO SECTION WITH GLOSSY AMBIENT ILLUMINATION */}
        <section className="relative px-6 pt-16 sm:pt-24 pb-20 max-w-6xl mx-auto text-center">
          
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Glossy Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gloss-pill text-xs font-medium text-indigo-200 shadow-[0_4px_16px_rgba(99,102,241,0.2)]">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Software Engineering Technical Preparation Studio</span>
            </div>

            {/* Specular Gradient Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight hero-heading-gradient leading-[1.12]">
              <span>Master technical interviews</span>
              <span className="block gloss-heading-accent mt-1.5">with structured practice.</span>
            </h1>

            {/* Subheadline with High Readability */}
            <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-normal">
              Evaluate your resume against real job descriptions, practice coding challenges in an interactive sandbox, and prepare for architectural questions with immediate, actionable feedback.
            </p>

            {/* Glossy Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="gloss-btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>Go to Candidate Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => scrollToSection('audit')}
                    className="gloss-btn-secondary w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm"
                  >
                    Audit Resume
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="gloss-btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="gloss-btn-secondary w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm"
                  >
                    Sign In to Account
                  </Link>
                </>
              )}
            </div>

            {/* Trust Assurances with Subtle Specular Highlights */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                100% private & encrypted data
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Single-column ATS templates
              </span>
            </div>

          </div>

          {/* HIGH-FIDELITY GLOSSY PRODUCT SHOWCASE CONTAINER */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl gloss-panel p-1.5 shadow-[0_30px_70px_rgba(0,0,0,0.7),0_0_80px_rgba(99,102,241,0.18),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/[0.15] overflow-hidden text-left">
            
            {/* Top Gloss Window Bar */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-[22px]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                </div>
                <span className="text-xs font-mono text-slate-400 ml-3">nexhire.app / candidate-workspace</span>
              </div>

              {/* Showcase Tab Selector */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] text-xs">
                {[
                  { id: 'resume', label: 'Resume & ATS Review', icon: FileCheck },
                  { id: 'interview', label: 'Technical Interview', icon: Terminal },
                  { id: 'coding', label: 'Coding Sandbox', icon: Code2 },
                  { id: 'readiness', label: 'Readiness Report', icon: Activity },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePreviewTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePreviewTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(99,102,241,0.35)] border border-white/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Showcase Content */}
            <div className="p-6 sm:p-8 bg-black/30 backdrop-blur-xl space-y-6">
              
              {/* TAB 1: RESUME & ATS REVIEW */}
              {activePreviewTab === 'resume' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">ATS Parsability</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white">94%</span>
                        <span className="text-xs text-emerald-400 font-medium">Standard format</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Zero unreadable columns or nested tables detected.</p>
                    </div>

                    <div className="p-5 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">Keywords Identified</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white">28 / 32</span>
                        <span className="text-xs text-indigo-300 font-medium">High alignment</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Matches Senior Backend and Full Stack role profiles.</p>
                    </div>

                    <div className="p-5 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">Metric Quantifications</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-white">8 Bullets</span>
                        <span className="text-xs text-amber-300 font-medium">2 Need metrics</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Add business outcomes to cache and pipeline entries.</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-5 rounded-2xl gloss-panel-raised border border-white/[0.12] space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      Automated Feedback Summary
                    </h4>
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Clean single column hierarchy:</strong> Sections and experience dates parse cleanly into standard ATS fields.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>Strong technical keyword coverage:</strong> Python, PostgreSQL, Redis, Docker, and REST APIs are prominently highlighted.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span><strong>Actionable adjustment:</strong> Quantify the latency impact on your Redis caching project bullet point.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL INTERVIEW */}
              {activePreviewTab === 'interview' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.08]">
                    <span>Topic: Distributed Systems & Caching</span>
                    <span className="text-indigo-400 font-medium">Round 3 of 5</span>
                  </div>

                  <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] space-y-1.5">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wide">
                      Interviewer Prompt:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      "In your resume, you note a 40% reduction in query latency by introducing Redis. How did you handle cache invalidation during high-frequency writes, and what strategy prevented cache stampedes?"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Evaluation & Feedback:</span>
                      <span className="text-emerald-400 font-medium">Architectural Depth: 92%</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Candidate correctly explained probabilistic early expiration and distributed mutex locking. Well-grounded explanation of failure modes under peak write traffic.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: CODING SANDBOX */}
              {activePreviewTab === 'coding' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium">Medium</span>
                      <span className="text-white font-medium">Problem: LRU Cache Implementation</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">Language: Python 3.11</span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/60 border border-white/[0.1] font-mono text-xs text-slate-300 space-y-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    <p className="text-slate-500"># Doubly linked list + Hash Map for O(1) operations</p>
                    <p><span className="text-indigo-400">class</span> <span className="text-emerald-400">LRUCache</span>:</p>
                    <p className="pl-4"><span className="text-indigo-400">def</span> <span className="text-blue-400">__init__</span>(self, capacity: int):</p>
                    <p className="pl-8">self.capacity = capacity</p>
                    <p className="pl-8">self.cache = {}</p>
                    <p className="pl-4"><span className="text-indigo-400">def</span> <span className="text-blue-400">get</span>(self, key: int) -&gt; int:</p>
                    <p className="pl-8"><span className="text-indigo-400">return</span> self.cache.get(key, -1)</p>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl gloss-panel-raised border border-white/[0.1] text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">All 18 automated test cases passed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 text-[11px]">38ms latency</span>
                      <button
                        onClick={() => addToast('Executing unit tests... 18/18 passed in 38ms.', 'success')}
                        className="gloss-btn-primary px-3 py-1 rounded-lg text-white font-medium text-[11px]"
                      >
                        Re-run Tests
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: READINESS REPORT */}
              {activePreviewTab === 'readiness' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] text-center gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">Overall Readiness</span>
                      <span className="text-2xl font-bold text-white">88 / 100</span>
                      <span className="text-[11px] text-emerald-400 block mt-1">Interview Ready</span>
                    </div>
                    <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] text-center gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">Algorithms (DSA)</span>
                      <span className="text-2xl font-bold text-white">85%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">16 Problems Solved</span>
                    </div>
                    <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] text-center gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">System Design</span>
                      <span className="text-2xl font-bold text-white">90%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">4 Architecture Vivas</span>
                    </div>
                    <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] text-center gloss-card-hover">
                      <span className="text-xs text-slate-400 block mb-1">Resume Match</span>
                      <span className="text-2xl font-bold text-white">94%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">ATS Calibrated</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl gloss-panel-raised border border-white/[0.1] space-y-2">
                    <span className="text-xs font-semibold text-white block">Recommended Next Focus</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Complete 1 practice session on Graph Traversals (Dijkstra / BFS) and review SQL indexing strategies to boost candidate readiness above 90.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Showcase Footer Bar */}
            <div className="px-6 py-3.5 border-t border-white/[0.08] bg-white/[0.03] backdrop-blur-md flex items-center justify-between text-xs text-slate-400 rounded-b-[22px]">
              <span>Interactive preview of candidate tools</span>
              <button
                onClick={() => handleProtectedNavigation('/dashboard', 'Candidate Dashboard')}
                className="text-white hover:text-indigo-300 transition-colors font-medium flex items-center gap-1.5"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Open full workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </section>

        {/* GLOSSY METRICS & TRACK RECORD */}
        <section className="border-y border-white/[0.08] bg-white/[0.02] backdrop-blur-xl px-6 py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="p-4 rounded-2xl gloss-panel border border-white/[0.08] gloss-card-hover">
              <span className="text-xs font-medium text-slate-400 block mb-1">Practice Scenarios</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">15,000+</span>
              <p className="text-xs text-slate-400 mt-1">Coding & system design questions</p>
            </div>
            <div className="p-4 rounded-2xl gloss-panel border border-white/[0.08] gloss-card-hover">
              <span className="text-xs font-medium text-slate-400 block mb-1">ATS Parsability</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">98.4%</span>
              <p className="text-xs text-slate-400 mt-1">Clean single-column parsing</p>
            </div>
            <div className="p-4 rounded-2xl gloss-panel border border-white/[0.08] gloss-card-hover">
              <span className="text-xs font-medium text-slate-400 block mb-1">Engineered Templates</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">4 Formats</span>
              <p className="text-xs text-slate-400 mt-1">Optimized for tech recruiters</p>
            </div>
            <div className="p-4 rounded-2xl gloss-panel border border-white/[0.08] gloss-card-hover">
              <span className="text-xs font-medium text-slate-400 block mb-1">Data Privacy</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">100% Private</span>
              <p className="text-xs text-slate-400 mt-1">Zero unauthorized data sharing</p>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES (GLOSSY FEATURES BENTO) */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold hero-heading-gradient tracking-tight">
              A comprehensive toolkit for software engineers
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              From first resume screening to final technical rounds, prepare with tools built specifically for software engineering hiring loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">ATS Resume Analysis</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan your resume against technical job descriptions. Detect missing technologies, verify heading structures, and eliminate formatting errors that trip up applicant tracking systems.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/resume-analyzer', 'Resume Review')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Analyze your resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Technical Mock Interviews</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practice realistic interview conversations covering algorithms, database queries, and system architecture. Receive structured feedback on your technical clarity and communication.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/mock-interview', 'Mock Interviews')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Start mock interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">In-Browser Coding Sandbox</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Write and test code directly in your browser. Run solutions against automated unit test suites with immediate feedback on edge cases, runtime latency, and algorithmic complexity.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/coding-sandbox', 'Coding Sandbox')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Open coding sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Project Defense & Viva</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prepare for technical interviewers who dig into your portfolio projects. Practice explaining technology choices, database selections, caching strategies, and scale tradeoffs.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Practice project defense</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Company-Specific Prep</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Align your preparation with the specific hiring bars and interview formats of target organizations, from high-growth startups to enterprise engineering organizations.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/company-prep', 'Company Prep')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Select target company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl gloss-panel border border-white/[0.12] gloss-card-hover space-y-3 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">ATS Resume Studio</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Build clean, single-column resumes with standard typography and structure designed specifically for tech recruiting workflows and automated applicant tracking engines.
              </p>
              <button
                onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Builder')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 pt-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Create resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS (GLOSSY TIMELINE) */}
        <section className="border-y border-white/[0.08] bg-white/[0.02] backdrop-blur-xl px-6 py-20">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
                Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold hero-heading-gradient tracking-tight">
                How NexHire guides your interview preparation
              </h2>
              <p className="text-sm text-slate-300">
                A structured, repeatable approach to prepare for technical interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              
              <div className="p-6 rounded-2xl gloss-panel border border-white/[0.1] gloss-card-hover space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-lg">
                  Step 01
                </span>
                <h3 className="text-base font-semibold text-white pt-1">Import or Build Your Resume</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload your existing PDF/DOCX resume or use our ATS-engineered builder. Our parser audits keyword density, layout readability, and formatting.
                </p>
              </div>

              <div className="p-6 rounded-2xl gloss-panel border border-white/[0.1] gloss-card-hover space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-lg">
                  Step 02
                </span>
                <h3 className="text-base font-semibold text-white pt-1">Practice Core Disciplines</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Solve algorithm problems in the coding sandbox, practice system architecture discussions, and complete simulated viva rounds.
                </p>
              </div>

              <div className="p-6 rounded-2xl gloss-panel border border-white/[0.1] gloss-card-hover space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-lg">
                  Step 03
                </span>
                <h3 className="text-base font-semibold text-white pt-1">Track Progress & Close Gaps</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Monitor your placement readiness score across algorithms, system design, and communication, using personalized drills to strengthen weak areas.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* RESUME AUDIT SECTION (GLOSSY CONTAINER WITH STRICT AUTH GATING) */}
        <section id="audit" className="px-6 py-20 max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl gloss-panel border border-white/[0.16] shadow-[0_24px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] space-y-6">
            
            {user ? (
              /* AUTHENTICATED USER VIEW */
              <div className="space-y-6">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gloss-pill text-xs text-indigo-200 font-medium">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Signed in as {user.name || user.email}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Upload your resume for instant analysis
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Upload your resume in PDF or DOCX format to evaluate ATS readability, technical keyword coverage, and project impact statements.
                  </p>
                </div>

                {/* Glossy Dropzone */}
                <div className="border-2 border-dashed border-white/20 hover:border-indigo-400/50 rounded-2xl p-8 text-center transition-all bg-white/[0.03] backdrop-blur-md relative cursor-pointer group">
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/10 border border-white/20 text-white mx-auto flex items-center justify-center mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                    <Upload className="w-5 h-5 text-indigo-300" />
                  </div>
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • File selected</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-slate-200 font-medium">
                        Drag and drop your resume here, or <span className="text-indigo-400 underline font-semibold">browse files</span>
                      </p>
                      <p className="text-xs text-slate-400">Supports PDF and DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={loading}
                  className="gloss-btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Analyzing resume...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Run ATS & Keyword Analysis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* UNAUTHENTICATED GUEST VIEW */
              <div className="text-center space-y-6 max-w-lg mx-auto py-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/10 border border-indigo-400/30 text-indigo-300 mx-auto flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_rgba(99,102,241,0.2)]">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Sign in to analyze your resume
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    To maintain strict candidate privacy and link evaluation reports to your profile, please sign in or create an account before uploading resumes.
                  </p>
                </div>

                <div
                  onClick={() => {
                    addToast('Please sign in or create an account to upload resumes.', 'warning');
                    navigate('/login');
                  }}
                  className="border-2 border-dashed border-white/20 hover:border-indigo-400/50 rounded-2xl p-8 text-center transition-all bg-white/[0.03] backdrop-blur-md cursor-pointer space-y-1.5"
                >
                  <Lock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-200 font-medium">Resume upload requires candidate authentication</p>
                  <p className="text-xs text-slate-400">Click to sign in or register your account</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/login"
                    className="gloss-btn-primary w-full sm:w-auto px-7 py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="gloss-btn-secondary w-full sm:w-auto px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Private & confidential
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Comprehensive feedback report
              </span>
            </div>

          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="px-6 py-20 max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
              Support & Answers
            </span>
            <h2 className="text-3xl font-extrabold hero-heading-gradient tracking-tight">Frequently asked questions</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Common questions about preparing with NexHire.
            </p>
          </div>

          <div className="space-y-3.5 text-left">
            {[
              {
                q: "Why is authentication required before uploading a resume?",
                a: "To ensure your personal information remains strictly confidential, every resume upload and diagnostic report is tied to your private account. Unauthenticated guests cannot upload documents or view sensitive analysis data."
              },
              {
                q: "How does the ATS compatibility check evaluate my resume?",
                a: "Our parser tests your document against standard applicant tracking heuristics, including single-column structure, standard section headers, font readability, date formatting, and keyword matching against target job profiles."
              },
              {
                q: "What programming languages are supported in the coding sandbox?",
                a: "The coding sandbox supports Python, JavaScript, TypeScript, and Java, complete with automated test runners and execution time benchmarking."
              },
              {
                q: "What is the Project Defense module?",
                a: "Project Defense simulates the technical inquiry senior engineers conduct during portfolio interviews. You will be asked targeted questions regarding database selection, latency tradeoffs, edge case handling, and architectural justifications."
              },
              {
                q: "Can I use NexHire without entering credit card information?",
                a: "Yes. Creating an account and using candidate preparation features does not require entering any credit card or payment details."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-2xl gloss-panel border border-white/[0.1] p-5 space-y-2 hover:border-white/20 transition-colors">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-300 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2.5 border-t border-white/[0.08]">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CONVERSION BANNER */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-14 rounded-3xl gloss-panel border border-white/[0.18] shadow-[0_30px_70px_rgba(0,0,0,0.7),0_0_100px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] space-y-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold hero-heading-gradient tracking-tight">
                Start preparing for your next technical interview
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Refine your resume, practice coding problems, and prepare for system design questions in one unified workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="gloss-btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="gloss-btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="gloss-btn-secondary w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <p className="text-xs text-slate-400 font-mono pt-1">
              No credit card required • Instant setup • Private candidate profile
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-black/40 backdrop-blur-xl py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="font-semibold text-white">NexHire</p>
              <p className="text-[11px] font-mono text-slate-500">Technical Interview & Resume Preparation Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
            <button onClick={() => handleProtectedNavigation('/resume-analyzer', 'Resume Review')} className="hover:text-white transition-colors">Resume Review</button>
            <button onClick={() => handleProtectedNavigation('/mock-interview', 'Mock Interviews')} className="hover:text-white transition-colors">Mock Interviews</button>
            <button onClick={() => handleProtectedNavigation('/coding-sandbox', 'Coding Sandbox')} className="hover:text-white transition-colors">Coding Sandbox</button>
            <button onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Builder')} className="hover:text-white transition-colors">Resume Studio</button>
          </div>

          <p className="text-[11px] font-mono text-slate-500">
            © 2026 NexHire. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
