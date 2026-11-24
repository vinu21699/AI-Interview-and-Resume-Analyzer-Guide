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
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500/20 selection:text-white">
      
      {/* Skip to Content for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-white text-slate-950 text-xs font-semibold rounded-md"
      >
        Skip to main content
      </a>

      {/* Modern, Clean Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-base tracking-tight text-white">NexHire</span>
              <span className="text-[11px] text-slate-400 font-medium">Workspace</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
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
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-2 py-1"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        
        {/* HERO SECTION */}
        <section className="relative px-6 pt-16 sm:pt-24 pb-20 max-w-6xl mx-auto text-center overflow-hidden">
          
          {/* Subtle Ambient Illumination */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-indigo-500/15 via-blue-500/5 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Software Engineering Interview & Career Preparation</span>
            </div>

            {/* Clear, Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.14]">
              <span>Master technical interviews</span>
              <span className="block text-slate-400 font-medium mt-1">with structured practice.</span>
            </h1>

            {/* Honest, Clear Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Evaluate your resume against real job descriptions, practice coding challenges in an interactive sandbox, and prepare for architectural questions with immediate, actionable feedback.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-950 text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Go to Candidate Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => scrollToSection('audit')}
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] transition-colors"
                  >
                    Audit Resume
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-950 text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-sm font-medium hover:bg-white/[0.1] transition-colors"
                  >
                    Sign In to Account
                  </Link>
                </>
              )}
            </div>

            {/* Trust and Privacy Assurance */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Private & encrypted data
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Single-column ATS templates
              </span>
            </div>

          </div>

          {/* HIGH-FIDELITY PRODUCT SHOWCASE (Authentic SaaS UI Mockup) */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-white/[0.1] bg-[#0e1424] shadow-2xl overflow-hidden text-left">
            
            {/* Window Top Bar */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0c111e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                </div>
                <span className="text-xs font-mono text-slate-400 ml-3">nexhire.app / candidate-workspace</span>
              </div>

              {/* Showcase Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#141b2d] p-1 rounded-lg border border-white/[0.06] text-xs">
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
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
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

            {/* Interactive Showcase Content */}
            <div className="p-6 sm:p-8 bg-[#0e1424]">
              
              {/* TAB 1: RESUME & ATS REVIEW */}
              {activePreviewTab === 'resume' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#141b2d] border border-white/[0.06]">
                      <span className="text-xs text-slate-400 block mb-1">ATS Parsability</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">94%</span>
                        <span className="text-xs text-emerald-400 font-medium">Standard format</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Zero unreadable columns or nested tables detected.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141b2d] border border-white/[0.06]">
                      <span className="text-xs text-slate-400 block mb-1">Keywords Identified</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">28 / 32</span>
                        <span className="text-xs text-indigo-400 font-medium">High alignment</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Matches Senior Backend and Full Stack role profiles.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#141b2d] border border-white/[0.06]">
                      <span className="text-xs text-slate-400 block mb-1">Metric Quantifications</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">8 Bullets</span>
                        <span className="text-xs text-amber-400 font-medium">2 Need metrics</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Add business outcomes to cache and pipeline entries.</p>
                    </div>
                  </div>

                  {/* Sample Recommendations List */}
                  <div className="p-5 rounded-xl bg-[#141b2d] border border-white/[0.06] space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Automated Feedback Summary
                    </h4>
                    <div className="space-y-2 text-xs text-slate-300">
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
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
                    <span>Topic: Distributed Systems & Caching</span>
                    <span className="text-indigo-400 font-medium">Round 3 of 5</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141b2d] border border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wide">
                      Interviewer Prompt:
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      "In your resume, you note a 40% reduction in query latency by introducing Redis. How did you handle cache invalidation during high-frequency writes, and what strategy prevented cache stampedes?"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#182136] border border-white/[0.08] space-y-2">
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
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-medium">Medium</span>
                      <span className="text-white font-medium">Problem: LRU Cache Implementation</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">Language: Python 3.11</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] font-mono text-xs text-slate-300 space-y-1">
                    <p className="text-slate-500"># Doubly linked list + Hash Map for O(1) operations</p>
                    <p><span className="text-indigo-400">class</span> <span className="text-emerald-400">LRUCache</span>:</p>
                    <p className="pl-4"><span className="text-indigo-400">def</span> <span className="text-blue-400">__init__</span>(self, capacity: int):</p>
                    <p className="pl-8">self.capacity = capacity</p>
                    <p className="pl-8">self.cache = {}</p>
                    <p className="pl-4"><span className="text-indigo-400">def</span> <span className="text-blue-400">get</span>(self, key: int) -&gt; int:</p>
                    <p className="pl-8"><span className="text-indigo-400">return</span> self.cache.get(key, -1)</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#141b2d] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">All 18 automated test cases passed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 text-[11px]">38ms latency</span>
                      <button
                        onClick={() => addToast('Executing unit tests... 18/18 passed in 38ms.', 'success')}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-colors"
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
                    <div className="p-3.5 rounded-xl bg-[#141b2d] border border-white/[0.06] text-center">
                      <span className="text-xs text-slate-400 block mb-1">Overall Readiness</span>
                      <span className="text-2xl font-bold text-white">88 / 100</span>
                      <span className="text-[11px] text-emerald-400 block mt-1">Interview Ready</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#141b2d] border border-white/[0.06] text-center">
                      <span className="text-xs text-slate-400 block mb-1">Algorithms (DSA)</span>
                      <span className="text-2xl font-bold text-white">85%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">16 Problems Solved</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#141b2d] border border-white/[0.06] text-center">
                      <span className="text-xs text-slate-400 block mb-1">System Design</span>
                      <span className="text-2xl font-bold text-white">90%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">4 Architecture Vivas</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#141b2d] border border-white/[0.06] text-center">
                      <span className="text-xs text-slate-400 block mb-1">Resume Match</span>
                      <span className="text-2xl font-bold text-white">94%</span>
                      <span className="text-[11px] text-slate-400 block mt-1">ATS Calibrated</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141b2d] border border-white/[0.06] space-y-2">
                    <span className="text-xs font-semibold text-white block">Recommended Next Focus</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Complete 1 practice session on Graph Traversals (Dijkstra / BFS) and review SQL indexing strategies to boost candidate readiness above 90.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Showcase Footer Bar */}
            <div className="px-6 py-3 border-t border-white/[0.08] bg-[#0c111e] flex items-center justify-between text-xs text-slate-400">
              <span>Interactive preview of candidate tools</span>
              <button
                onClick={() => handleProtectedNavigation('/dashboard', 'Candidate Dashboard')}
                className="text-white hover:text-indigo-300 transition-colors font-medium flex items-center gap-1"
              >
                {!user && <Lock className="w-3 h-3 text-slate-500" />}
                <span>Open full workspace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

        </section>

        {/* METRICS & TRACK RECORD */}
        <section className="border-y border-white/[0.08] bg-[#0c111e] px-6 py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Practice Scenarios</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">15,000+</span>
              <p className="text-xs text-slate-500 mt-1">Coding & system design questions</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">ATS Parsability</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">98.4%</span>
              <p className="text-xs text-slate-500 mt-1">Clean single-column parsing</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Engineered Templates</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">4 Formats</span>
              <p className="text-xs text-slate-500 mt-1">Optimized for tech recruiters</p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Data Privacy</span>
              <span className="text-2xl sm:text-3xl font-bold text-indigo-400">100% Private</span>
              <p className="text-xs text-slate-500 mt-1">Zero unauthorized data sharing</p>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES (FEATURES) */}
        <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              A comprehensive toolkit for software engineers
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              From first resume screening to final technical rounds, prepare with tools built specifically for software engineering hiring loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.08] hover:border-white/[0.18] transition-colors space-y-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS (3-STEP WORKFLOW) */}
        <section className="border-y border-white/[0.08] bg-[#0c111e] px-6 py-20">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
                Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                How NexHire guides your interview preparation
              </h2>
              <p className="text-sm text-slate-300">
                A structured, repeatable approach to prepare for technical interviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              
              <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.06] space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  Step 01
                </span>
                <h3 className="text-base font-semibold text-white pt-1">Import or Build Your Resume</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload your existing PDF/DOCX resume or use our ATS-engineered builder. Our parser audits keyword density, layout readability, and formatting.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.06] space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  Step 02
                </span>
                <h3 className="text-base font-semibold text-white pt-1">Practice Core Disciplines</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Solve algorithm problems in the coding sandbox, practice system architecture discussions, and complete simulated viva rounds.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#0e1424] border border-white/[0.06] space-y-3 relative">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
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

        {/* RESUME AUDIT SECTION (STRICTLY GATED AUTHENTICATION) */}
        <section id="audit" className="px-6 py-20 max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0e1424] border border-white/[0.1] shadow-2xl space-y-6">
            
            {user ? (
              /* AUTHENTICATED USER VIEW */
              <div className="space-y-6">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
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

                {/* Dropzone */}
                <div className="border border-dashed border-white/[0.16] hover:border-white/30 rounded-xl p-8 text-center transition-colors bg-[#090d16] relative cursor-pointer">
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] text-slate-300 mx-auto flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-white" />
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
                      <p className="text-xs text-slate-500">Supports PDF and DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg bg-white text-slate-950 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Analyzing resume...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Run ATS & Keyword Analysis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* UNAUTHENTICATED GUEST VIEW */
              <div className="text-center space-y-6 max-w-lg mx-auto py-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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
                  className="border border-dashed border-white/[0.14] hover:border-white/30 rounded-xl p-8 text-center transition-colors bg-[#090d16] cursor-pointer space-y-1.5"
                >
                  <Lock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-200 font-medium">Resume upload requires candidate authentication</p>
                  <p className="text-xs text-slate-500">Click to sign in or register your account</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white font-medium text-xs hover:bg-white/[0.1] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Create Free Account</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                Private & confidential
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
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
            <h2 className="text-3xl font-bold text-white tracking-tight">Frequently asked questions</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Common questions about preparing with NexHire.
            </p>
          </div>

          <div className="space-y-3 text-left">
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
                <div key={idx} className="rounded-xl bg-[#0e1424] border border-white/[0.08] p-5 space-y-2">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2.5 border-t border-white/[0.06]">
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
          <div className="p-8 sm:p-14 rounded-2xl bg-[#0e1424] border border-white/[0.1] shadow-2xl space-y-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
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
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white text-xs font-medium hover:bg-white/[0.1] transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 pt-1">
              No credit card required • Instant setup • Private candidate profile
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#0c111e] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="font-semibold text-white">NexHire</p>
              <p className="text-[11px] text-slate-500">Technical Interview & Resume Preparation Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => handleProtectedNavigation('/resume-analyzer', 'Resume Review')} className="hover:text-white transition-colors">Resume Review</button>
            <button onClick={() => handleProtectedNavigation('/mock-interview', 'Mock Interviews')} className="hover:text-white transition-colors">Mock Interviews</button>
            <button onClick={() => handleProtectedNavigation('/coding-sandbox', 'Coding Sandbox')} className="hover:text-white transition-colors">Coding Sandbox</button>
            <button onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Builder')} className="hover:text-white transition-colors">Resume Studio</button>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026 NexHire. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
