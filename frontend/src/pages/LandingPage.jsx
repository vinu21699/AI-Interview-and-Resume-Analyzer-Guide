import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, Award, Check, ChevronDown, ChevronUp,
  RefreshCw, BarChart3, Target, Mic, Code2, Sparkles, Sliders,
  Terminal, Zap, Flame, Compass, Eye, Layout, ExternalLink,
  BookOpen, Lock, Cpu, Layers, HelpCircle, LogIn, UserPlus, LogOut,
  ChevronRight, Activity
} from 'lucide-react';

// B11 Mandatory Tagline Reveal Component
function TaglineReveal({ text }) {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.25;
      const current = rect.top;
      
      if (current >= start) {
        setProgress(0);
      } else if (current <= end) {
        setProgress(1);
      } else {
        const val = (start - current) / (start - end);
        setProgress(Math.max(0, Math.min(1, val)));
      }
    };

    let animationFrameId;
    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const words = text.split(' ');

  return (
    <div ref={containerRef} className="py-16 sm:py-20 max-w-3xl mx-auto px-6 text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gloss-pill text-xs font-mono text-indigo-300 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>The core premise</span>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl font-normal sm:font-medium leading-relaxed text-balance tracking-normal text-slate-200">
        {words.map((word, index) => {
          const wordProgress = (index + 1) / words.length;
          const isLit = prefersReducedMotion || progress >= wordProgress * 0.85;
          return (
            <span
              key={index}
              className={`inline-block mr-[0.25em] transition-colors duration-500 ease-snappy ${
                isLit ? 'text-white font-medium' : 'text-slate-600'
              }`}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('defense'); // 'defense' | 'claims' | 'pressure' | 'radar' | 'templates'
  const [activeTemplatePreview, setActiveTemplatePreview] = useState('modern');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  // Helper for strictly gated feature actions
  const handleProtectedNavigation = (targetPath, featureName) => {
    if (!user) {
      addToast(`Please sign in first to access ${featureName}.`, 'warning');
      navigate('/login', { state: { from: { pathname: targetPath } } });
    } else {
      navigate(targetPath);
    }
  };

  const handleFileChange = (e) => {
    if (!user) {
      addToast('Please sign in or create an account to upload resumes.', 'warning');
      navigate('/login');
      return;
    }
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!user) {
      addToast('Authentication required. Please sign in before auditing resumes.', 'warning');
      navigate('/login');
      return;
    }

    if (!file) {
      addToast('Please select a resume file in PDF or DOCX format.', 'warning');
      const fileInput = document.getElementById('landing-resume-file-input');
      if (fileInput) fileInput.click();
      return;
    }

    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      if (!token) {
        addToast('Your session has expired. Please sign in again.', 'error');
        navigate('/login');
        return;
      }

      const res = await api.post('/resume/analyze', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      sessionStorage.setItem('initialAnalysis', JSON.stringify(res.data));
      addToast('Resume audit complete. Redirecting to report.', 'success');
      navigate('/resume-analyzer');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed. Please check the file format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrollToAudit = () => {
    const el = document.getElementById('audit-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen text-[#ededed] font-sans selection:bg-emerald-500 selection:text-black gloss-ambient-backdrop bg-dot-grid relative overflow-x-hidden">
      
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg text-xs shadow-lg"
      >
        Skip to main content
      </a>

      {/* Floating Apple-Style Glossy Dock Navigation */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-5xl mx-auto">
        <nav
          aria-label="Primary"
          className="gloss-panel rounded-full px-5 sm:px-7 h-16 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/[0.14]"
        >
          {/* Brand Logo with Glossy Emblem */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 via-sky-400 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.35)]">
              <div className="w-full h-full bg-[#090A0F] rounded-[11px] flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-indigo-400 transition-colors">NexHire</span>
              <span className="text-[10px] text-indigo-300 font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25">2.0</span>
            </div>
          </Link>

          {/* Feature Navigation - Strictly Protected on Click */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')}
              className="hover:text-white transition-colors duration-200 ease-snappy flex items-center gap-1.5 py-1"
            >
              <span>Project defense</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
              className="hover:text-white transition-colors duration-200 ease-snappy flex items-center gap-1.5 py-1"
            >
              <span>Claim verification</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
              className="hover:text-white transition-colors duration-200 ease-snappy flex items-center gap-1.5 py-1"
            >
              <span>Pressure mode</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')}
              className="hover:text-white transition-colors duration-200 ease-snappy flex items-center gap-1.5 py-1"
            >
              <span>Resume studio</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/company-prep', 'Target Company Prep')}
              className="hover:text-white transition-colors duration-200 ease-snappy flex items-center gap-1.5 py-1"
            >
              <span>Target prep</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
          </div>

          {/* User Auth State Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="gloss-btn-secondary px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="gloss-btn-secondary px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log in</span>
                </Link>
                <Link
                  to="/register"
                  className="gloss-btn-primary px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create account</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10">
        
        {/* Section 1: Hero Section */}
        <section className="relative px-6 pt-16 sm:pt-28 pb-16 max-w-6xl mx-auto text-center">
          
          {/* Glossy Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gloss-pill text-xs font-mono text-indigo-200 mb-8 shadow-inner border-indigo-500/25">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-indigo-400 -ml-4"></span>
            <span className="text-slate-200 font-medium">Calibrated against 1,200 engineering interview rubrics</span>
          </div>

          {/* Heading 1: Metallic Silver + Celestial Indigo Glossy Gradient */}
          <h1 className="text-3xl sm:text-4xl md:text-[46px] lg:text-[54px] font-bold tracking-tight max-w-4xl mx-auto leading-[1.28] md:leading-[1.3] drop-shadow-xl">
            <span className="gloss-heading-silver block pb-1">Turn resume claims into</span>
            <span className="gloss-heading-accent block mt-1.5 sm:mt-2.5">bulletproof engineering proof</span>
          </h1>

          {/* Subheading: Frosted Crisp Typography */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-[660px] mx-auto text-pretty leading-relaxed">
            Superficial AI interviewers only ask textbook trivia. NexHire cross examines your actual project architecture, simulates strict viva pressure rounds, and calculates your true placement readiness score.
          </p>

          {/* Primary Action Buttons - Strictly Gated */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {user ? (
              <>
                <button
                  onClick={scrollToAudit}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full gloss-btn-primary text-sm font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                >
                  <span>Audit your resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full gloss-btn-secondary text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Candidate dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full gloss-btn-primary text-sm font-semibold flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(99,102,241,0.45)]"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Log in to start audit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full gloss-btn-secondary text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Create free account</span>
                </Link>
              </>
            )}
          </div>

          {/* Proof Strip with Frosted Glass Panels */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mt-14 mb-8 max-w-4xl mx-auto"></div>
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 gloss-panel-raised rounded-2xl border border-white/[0.12] gloss-card-hover">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">ATS parse accuracy</span>
              <span className="text-2xl font-bold text-white font-mono tracking-tight">94.2%</span>
            </div>
            <div className="p-4 gloss-panel-raised rounded-2xl border border-white/[0.12] gloss-card-hover">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Viva question bank</span>
              <span className="text-2xl font-bold text-indigo-400 font-mono tracking-tight">7 rounds</span>
            </div>
            <div className="p-4 gloss-panel-raised rounded-2xl border border-white/[0.12] gloss-card-hover">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Evaluated rubrics</span>
              <span className="text-2xl font-bold text-sky-400 font-mono tracking-tight">1,200+</span>
            </div>
            <div className="p-4 gloss-panel-raised rounded-2xl border border-white/[0.12] gloss-card-hover">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Average score lift</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">+28 pts</span>
            </div>
          </div>

          {/* Hero Visual: Professional Glossy Product Simulator */}
          <div className="mt-16 gloss-panel rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.7)] border border-white/[0.16] text-left">
            
            {/* macOS Style Frosted Chrome Header */}
            <div className="flex items-center justify-between border-b border-white/[0.1] px-5 py-3.5 bg-white/[0.03] backdrop-blur-md overflow-x-auto gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"></span>
                <span className="ml-3 font-mono text-[11px] text-slate-400 font-medium">nexhire terminal v2.0 • placement ready</span>
              </div>

              {/* Glossy Tab Switcher */}
              <div className="flex items-center gap-1.5 shrink-0 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
                {[
                  { id: 'defense', label: '1. Project defense viva', icon: Terminal },
                  { id: 'claims', label: '2. Claim verification', icon: ShieldCheck },
                  { id: 'pressure', label: '3. Pressure interview', icon: Flame },
                  { id: 'radar', label: '4. Weakness radar', icon: Compass },
                  { id: 'templates', label: '5. Resume studio', icon: Layout },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ease-snappy ${
                        isActive
                          ? 'bg-gradient-to-b from-white/15 to-white/5 text-white border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulator Interactive Body with Glass Cards */}
            <div className="p-6 sm:p-9 bg-black/30 backdrop-blur-xl min-h-[400px]">
              
              {/* TAB 1: PROJECT DEFENSE SIMULATOR */}
              {activeTab === 'defense' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Round 5 of 7 • Architectural Tradeoff Inquiries</span>
                      <h3 className="text-base font-semibold text-white mt-0.5">Project: High throughput microservice data pipeline</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono gloss-pill text-emerald-300 font-medium">
                      Strict examiner mode active
                    </span>
                  </div>

                  <div className="gloss-panel-raised rounded-2xl p-5 space-y-2.5 border border-white/[0.14]">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <span className="font-semibold">AI Technical Examiner Question:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
                      "You claimed you chose FastAPI and PostgreSQL to reduce 99th percentile response latency by 38 percent. Why did you select PostgreSQL over a document store given the write volume, and how did you prevent database connection pool exhaustion under sudden traffic spikes?"
                    </p>
                  </div>

                  <div className="gloss-panel-raised rounded-2xl p-5 space-y-3.5 border border-white/[0.14]">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-medium">Live architectural rubrics</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] gloss-card-hover">
                        <span className="text-slate-400 block text-[10px]">Architecture</span>
                        <span className="font-mono text-emerald-400 text-base font-bold">84%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] gloss-card-hover">
                        <span className="text-slate-400 block text-[10px]">Technical depth</span>
                        <span className="font-mono text-emerald-400 text-base font-bold">89%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] gloss-card-hover">
                        <span className="text-slate-400 block text-[10px]">Justification</span>
                        <span className="font-mono text-white text-base font-bold">78%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08] gloss-card-hover">
                        <span className="text-slate-400 block text-[10px]">Overall viva score</span>
                        <span className="font-mono text-emerald-400 text-base font-bold">84 / 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense Viva')}
                      className="gloss-btn-primary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-emerald-950" />}
                      <span>Launch full seven round project defense</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CLAIM VERIFICATION SIMULATOR */}
              {activeTab === 'claims' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Detected resume claim</span>
                      <h3 className="text-base font-semibold text-white mt-0.5">"Engineered distributed caching layer in Redis reducing DB load by 45 percent"</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      Confidence score: 86%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="gloss-panel-raised rounded-2xl p-5 space-y-2 border border-white/[0.14]">
                      <span className="text-[11px] font-mono text-emerald-400 block uppercase font-semibold">1. Technical probe</span>
                      <p className="text-slate-200 leading-relaxed">How did you handle cache invalidation and prevent stale data reads when writing updates?</p>
                    </div>
                    <div className="gloss-panel-raised rounded-2xl p-5 space-y-2 border border-white/[0.14]">
                      <span className="text-[11px] font-mono text-emerald-400 block uppercase font-semibold">2. Architectural tradeoff</span>
                      <p className="text-slate-200 leading-relaxed">What eviction policy (LRU, LFU, TTL) did you configure and what was the memory footprint?</p>
                    </div>
                  </div>

                  <div className="gloss-panel-raised rounded-2xl p-4 flex items-center justify-between text-xs flex-wrap gap-3 border border-white/[0.14]">
                    <span className="text-slate-300">Diagnosis: High technical validity. Candidate demonstrated clear cache stampede prevention.</span>
                    <button
                      onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
                      className="gloss-btn-primary px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-emerald-950" />}
                      <span>Verify all claims</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PRESSURE INTERVIEW SIMULATOR */}
              {activeTab === 'pressure' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Flame className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-semibold text-white">Pressure mode interview simulation</h3>
                    </div>
                    <span className="font-mono text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                      Timer: 00:45
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="gloss-panel-raised p-4 rounded-2xl text-slate-200 border border-white/[0.12]">
                      <strong className="text-slate-400 font-mono block text-[10px] mb-1">AI Interviewer:</strong>
                      "You mentioned you understand database indexing. What is the fundamental difference between a clustered and non clustered index in PostgreSQL?"
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl text-white ml-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <strong className="text-emerald-400 font-mono block text-[10px] mb-1 font-semibold">Candidate Answer:</strong>
                      "A clustered index dictates physical row ordering on disk, while a non clustered index stores a separate pointer structure pointing to the heap."
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl text-amber-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <strong className="text-amber-400 font-mono block text-[10px] mb-1 font-semibold">Strict Pressure Follow up:</strong>
                      "That is standard textbook definition. Now explain what happens to write throughput when you attach five non clustered indexes to a high write table. Quantify the disk input output cost."
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
                      className="gloss-btn-primary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-emerald-950" />}
                      <span>Launch pressure interview session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: WEAKNESS RADAR SIMULATOR */}
              {activeTab === 'radar' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Candidate evaluation</span>
                      <h3 className="text-base font-semibold text-white mt-0.5">Placement readiness index: 78 of 100</h3>
                    </div>
                    <span className="font-mono text-xs text-slate-300 gloss-pill px-3 py-1 rounded-full font-medium">
                      Seven core competencies
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-mono">
                    <div className="p-4 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-slate-400 block text-[10px]">Data structures</span>
                      <span className="text-rose-400 text-lg font-bold">44%</span>
                    </div>
                    <div className="p-4 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-slate-400 block text-[10px]">SQL querying</span>
                      <span className="text-amber-400 text-lg font-bold">63%</span>
                    </div>
                    <div className="p-4 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-slate-400 block text-[10px]">Technical viva</span>
                      <span className="text-emerald-400 text-lg font-bold">82%</span>
                    </div>
                    <div className="p-4 rounded-2xl gloss-panel-raised border border-white/[0.12] gloss-card-hover">
                      <span className="text-slate-400 block text-[10px]">Backend architecture</span>
                      <span className="text-emerald-400 text-lg font-bold">86%</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl gloss-panel-raised border border-white/[0.12] space-y-2 text-xs">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">AI diagnostic remediation plan</span>
                    <p className="text-slate-200 leading-relaxed">
                      Weakness identified in <strong className="text-white">HashMaps and Graph Traversals</strong> (44 percent). Seven day targeted drill generated: Day 1 HashMap internal mechanics, Day 3 Two Sum variants, Day 6 Timed assessment.
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleProtectedNavigation('/dashboard', 'Weakness Radar')}
                      className="gloss-btn-primary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-emerald-950" />}
                      <span>Open full weakness radar on dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: RESUME STUDIO PREVIEW */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 flex-wrap gap-2">
                    <h3 className="text-base font-semibold text-white">Four enterprise ATS optimized resume templates</h3>
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
                      {['modern', 'executive', 'split', 'minimalist'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveTemplatePreview(t)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all duration-200 ease-snappy ${
                            activeTemplatePreview === t
                              ? 'bg-gradient-to-b from-white/20 to-white/5 text-white border border-white/20 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white text-slate-900 p-7 rounded-2xl text-xs space-y-3 max-h-64 overflow-hidden border border-slate-200 shadow-2xl">
                    <div className="border-b border-slate-200 pb-2.5 flex justify-between items-baseline">
                      <span className="font-bold text-base text-slate-950 tracking-tight">ALEX JOHNSON</span>
                      <span className="text-[11px] font-mono text-slate-600 font-semibold">SENIOR SOFTWARE ENGINEER</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium">
                      Format: {activeTemplatePreview.toUpperCase()} • Clean linear vector typography • 100 percent Workday and Greenhouse parse compatibility.
                    </p>
                    <div className="text-[11px] text-slate-800">
                      <strong>Technical competencies:</strong> Python, React, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, Go
                    </div>
                    <div className="text-[11px] text-slate-800">
                      <strong>Experience:</strong> Senior Engineer at TechCorp Solutions (2023 to Present) — Architected distributed services with 99.99 percent uptime.
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')}
                      className="gloss-btn-primary px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-emerald-950" />}
                      <span>Customize and export in resume studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Section 2: B11 Mandatory Tagline Reveal Section */}
        <TaglineReveal text="Most software engineers do not fail technical interviews because of basic syntax. They fail when an interviewer drills into an undefended project claim. NexHire tests your actual architectural depth before you sit in front of the hiring committee." />

        {/* Section 3: Problem to Solution Contrast (Glossy Split) */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-2 font-semibold">The engineering difference</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white gloss-heading-silver text-balance">
              Why generic AI mock interviewers fail serious candidates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            
            {/* The Old Way: Smoky Glass Card */}
            <div className="gloss-panel rounded-3xl p-7 sm:p-9 space-y-6 border border-rose-500/20 gloss-card-hover">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Generic AI tools and basic prompt wrappers</h3>
                  <span className="text-xs text-slate-400">Surface level interview prep</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                  <span>Superficial textbook trivia questions that any candidate can recite from memory.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                  <span>Zero verification of metrics or architecture claims written on your resume.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                  <span>Generic score percentages that give false confidence without actionable remediation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                  <span>Leaves you completely vulnerable when real interviewers ask deep "Why" questions.</span>
                </li>
              </ul>
            </div>

            {/* The NexHire Placement Engine Way: Royal Indigo & Celestial Azure Glossy Card */}
            <div className="gloss-panel rounded-3xl p-7 sm:p-9 space-y-6 border border-indigo-500/35 gloss-card-hover shadow-[0_0_35px_rgba(99,102,241,0.18)] bg-gradient-to-b from-indigo-500/[0.08] via-transparent to-transparent">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">NexHire Placement Readiness Engine</h3>
                  <span className="text-xs text-indigo-300 font-medium">Calibrated architectural defense</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Seven round project viva</strong> that interrogates database choice, cache invalidation, and failure modes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Automated claim verification</strong> that inspects every bullet point for defensible technical evidence.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Strict pressure interview mode</strong> challenging theoretical responses with real disk input output costs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span><strong>Calibrated placement readiness index</strong> giving an honest 0 to 100 rating with a personalized drill plan.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* Section 4: Benefits Grid (Four Outcome-Driven Bullets) */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-2 font-semibold">Core outcomes</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white gloss-heading-silver text-balance">
              Engineered to eliminate candidate vulnerability
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="gloss-panel rounded-3xl p-6 space-y-3.5 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Bulletproof claim verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Cross examines every metric, library, and throughput claim before hiring managers question you.
              </p>
            </div>

            <div className="gloss-panel rounded-3xl p-6 space-y-3.5 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Seven round viva defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Tests the architectural reasons behind your tech stack choices under strict examiner scrutiny.
              </p>
            </div>

            <div className="gloss-panel rounded-3xl p-6 space-y-3.5 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Targeted seven day remediation</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Automatically isolates your exact algorithmic and system design weak spots with daily drills.
              </p>
            </div>

            <div className="gloss-panel rounded-3xl p-6 space-y-3.5 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Enterprise ATS fidelity</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Guarantees 100 percent parse accuracy on Workday and Greenhouse with linear vector structures.
              </p>
            </div>

          </div>
        </section>

        {/* Section 5: How It Works (Three Distinct Steps) */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-2 font-semibold">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white gloss-heading-silver text-balance">
              How the placement readiness engine works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold text-indigo-400 shadow-inner">
                  01
                </span>
                <span className="text-[11px] font-mono text-slate-400">Intake</span>
              </div>
              <h3 className="text-base font-semibold text-white">Upload your resume or paste projects</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-pretty">
                NexHire parses your technical experience, detects bold performance assertions, and flags claims that lack architectural justification.
              </p>
            </div>

            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-xs font-mono font-bold text-sky-400 shadow-inner">
                  02
                </span>
                <span className="text-[11px] font-mono text-slate-400">Simulation</span>
              </div>
              <h3 className="text-base font-semibold text-white">Face adaptive viva and pressure rounds</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-pretty">
                AI examiners probe your project design decisions, verify claim authenticity, and test your poise when answers are challenged.
              </p>
            </div>

            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shadow-inner">
                  03
                </span>
                <span className="text-[11px] font-mono text-slate-400">Readiness</span>
              </div>
              <h3 className="text-base font-semibold text-white">Receive calibrated index and drill plan</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-pretty">
                Get an objective 0 to 100 score across seven competencies with an automated daily curriculum to close identified weaknesses.
              </p>
            </div>

          </div>
        </section>

        {/* Section 6: Deep Feature Bento Grid */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-2 font-semibold">Technical depth</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white gloss-heading-silver text-balance">
              Eight comprehensive placement readiness modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1: Project Defense Viva */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Project Defense Viva</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Seven round technical inquiry scrutinizing database selection, latency tradeoffs, edge cases, and architectural justifications.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Start defense session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 2: Resume Claim Verification */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Resume Claim Verification</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Scans bullet points for metric inflation and generates targeted cross examination questions to verify actual ownership.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
                className="text-xs text-sky-400 hover:text-sky-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Scan resume claims</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 3: Pressure Interview Mode */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Pressure Interview Mode</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Simulates intense interviewer pushback, questioning standard answers and measuring composure under timed constraints.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Enter pressure mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 4: Weakness Radar */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Weakness Radar and Retesting</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Tracks competency across algorithms, system design, and communication, displaying quantifiable score improvements over time.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/dashboard', 'Weakness Radar')}
                className="text-xs text-violet-400 hover:text-violet-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>View readiness radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 5: Target Company Prep */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Target Company Alignment</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Aligns your technical prep against specific interview formats used by Google, Amazon, Microsoft, and high scale startups.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/company-prep', 'Target Company Prep')}
                className="text-xs text-amber-400 hover:text-amber-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Select target company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 6: Resume Studio Formats */}
            <div className="gloss-panel rounded-3xl p-7 space-y-4 border border-white/[0.12] gloss-card-hover">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">ATS Resume Studio</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed text-pretty">
                  Four engineered templates built with linear headings and vector glyph typography for perfect ATS parsing.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1.5 pt-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Open resume studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* Section 7: Dropzone Upload Section (STRICTLY AUTHENTICATED & GLOSSY) */}
        <section id="audit-section" className="px-6 py-20 max-w-4xl mx-auto">
          <div className="gloss-panel rounded-3xl p-8 sm:p-12 space-y-7 border border-white/[0.16] shadow-[0_24px_50px_rgba(0,0,0,0.6)]">
            
            {user ? (
              /* AUTHENTICATED STATE: USER IS SIGNED IN */
              <>
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono text-indigo-300 mb-1 font-medium shadow-sm">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Signed in as {user.name || user.email}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight gloss-heading-silver">
                    Audit your resume for interview vulnerabilities
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-pretty">
                    Upload your resume in PDF or DOCX format to receive an instant analysis of claim risks, keyword coverage, and ATS parsing readiness.
                  </p>
                </div>

                {/* Drag and Drop Zone for Authenticated Users */}
                <div className="border border-dashed border-white/[0.2] hover:border-indigo-400/60 rounded-2xl p-9 text-center transition-all duration-300 ease-snappy bg-black/40 backdrop-blur-md relative group cursor-pointer shadow-inner">
                  <input
                    id="landing-resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.15] text-slate-300 mx-auto flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-indigo-400" />
                  </div>
                  {file ? (
                    <div className="space-y-1.5">
                      <p className="text-sm font-mono text-indigo-400 font-bold">{file.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to audit</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-sm text-slate-200 font-medium">
                        Drop your resume here, or <span className="text-indigo-400 underline font-semibold">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">PDF or DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full gloss-btn-primary font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Evaluating resume claims...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Run instant placement audit</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* UNAUTHENTICATED STATE: LOGIN STRICTLY REQUIRED (GLOSSY LOCKED CARD) */
              <div className="text-center space-y-6 max-w-lg mx-auto py-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  <Lock className="w-7 h-7 drop-shadow-sm" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block font-semibold">
                    Authentication required
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight gloss-heading-silver">
                    Sign in to audit your resume
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-pretty">
                    To protect candidate privacy and preserve your placement audit history, you must be logged in before uploading resumes or accessing technical modules.
                  </p>
                </div>

                {/* Locked Dropzone Card */}
                <div
                  onClick={() => {
                    addToast('Please sign in or create an account to upload resumes.', 'warning');
                    navigate('/login');
                  }}
                  className="border border-dashed border-white/[0.18] hover:border-amber-400/60 rounded-2xl p-9 text-center transition-all duration-300 ease-snappy bg-black/40 backdrop-blur-md cursor-pointer space-y-2 group shadow-inner"
                >
                  <Lock className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mx-auto transition-colors group-hover:scale-110 duration-200" />
                  <p className="text-sm text-slate-200 font-semibold">
                    Upload locked for guest visitors
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Click here to log in or register your candidate profile
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3 rounded-full gloss-btn-primary font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Log in to upload resume</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3 rounded-full gloss-btn-secondary font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create free account</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Security Guarantee Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero credit card required</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict candidate data privacy</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full placement readiness report</span>
              </span>
            </div>

          </div>
        </section>

        {/* Section 8: FAQ Accordion (Seven Comprehensive Questions) */}
        <section className="px-6 py-20 max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block font-semibold">Common inquiries</span>
            <h2 className="text-3xl font-bold text-white tracking-tight gloss-heading-silver">Frequently asked questions</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about the placement readiness engine.</p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "Why do I need to log in before uploading my resume?",
                a: "NexHire securely parses and stores your project documentation, claim verification history, and viva evaluations under your private candidate account. Requiring authentication ensures complete privacy and protects your personal data."
              },
              {
                q: "How does Project Defense differ from standard ChatGPT prompts?",
                a: "Generic ChatGPT prompts offer conversational praise and shallow textbook questions. NexHire Project Defense acts as a strict technical examiner across seven sequential rounds, asking targeted 'Why' questions that challenge architectural tradeoffs, caching strategies, and data consistency models."
              },
              {
                q: "How is the 0 to 100 Placement Readiness Score calculated?",
                a: "Your score is a calibrated composite index weighted across seven competencies: Resume ATS Parsability (15 percent), Algorithmic DSA (20 percent), SQL Proficiency (15 percent), Technical Viva Depth (20 percent), Project Execution (15 percent), and Engineering Communication (15 percent)."
              },
              {
                q: "Are the resume templates compatible with enterprise ATS systems like Workday and Greenhouse?",
                a: "Yes. All four templates are engineered using single column linear structures, standard heading hierarchies, and pure vector typography. They eliminate table nested containers, floating text boxes, and non standard glyphs that corrupt enterprise parsing engines."
              },
              {
                q: "What happens during a Pressure Interview session?",
                a: "Pressure Mode simulates high stress interview situations. The examiner introduces short response timers, deliberately questions your theoretical statements, and pushes for low level disk input output costs and memory tradeoffs to test how well you maintain composure."
              },
              {
                q: "How does the Weakness Radar generate my personalized practice plan?",
                a: "When you complete an assessment or viva defense, NexHire tracks your specific failure points (such as Graph Traversals or Database Indexing). The engine then generates an automated seven day progressive curriculum with daily targeted exercises to close those gaps."
              },
              {
                q: "Can I prepare for specific target companies like Google, Amazon, or high growth startups?",
                a: "Yes. The Target Company Preparation module adapts interview questioning and evaluation standards to match the specific hiring rubrics of top tech firms, focusing on company specific leadership principles and system design expectations."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="gloss-panel rounded-2xl p-5 space-y-2 border border-white/[0.12] gloss-card-hover">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2.5 border-t border-white/[0.08] text-pretty">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 9: Final High-Converting Glossy CTA */}
        <section className="px-6 py-24 max-w-4xl mx-auto text-center">
          <div className="gloss-panel rounded-3xl p-9 sm:p-14 space-y-7 border border-white/[0.18] shadow-[0_32px_70px_rgba(0,0,0,0.7)] relative overflow-hidden">
            
            {/* Ambient Conical Accent Inside Banner */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-3 max-w-xl mx-auto relative z-10">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block font-semibold">Get placement ready</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight gloss-heading-silver">
                Ready to turn resume claims into placement offers?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-pretty">
                Create your account or log in to discover vulnerable resume claims, test yourself against strict viva examiners, and benchmark your engineering readiness.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 relative z-10">
              {user ? (
                <>
                  <button
                    onClick={scrollToAudit}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full gloss-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                  >
                    <span>Audit your resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full gloss-btn-secondary text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Candidate dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full gloss-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.45)]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-white" />
                    <span>Log in to start audit</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full gloss-btn-secondary text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span>Create free account</span>
                  </Link>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-mono pt-1 relative z-10">
              No credit card required • Instant analysis • Zero friction setup
            </p>

          </div>
        </section>

      </main>

      {/* Semantic Frosted Glossy Footer */}
      <footer className="border-t border-white/[0.08] bg-black/60 backdrop-blur-xl py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/[0.14] flex items-center justify-center text-indigo-400 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-white">NexHire AI</p>
              <p className="text-[11px] font-mono text-slate-400">Technical Interview and Placement Readiness Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <button onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')} className="hover:text-white transition-colors duration-200">Viva defense</button>
            <button onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')} className="hover:text-white transition-colors duration-200">Claim audit</button>
            <button onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')} className="hover:text-white transition-colors duration-200">Pressure mode</button>
            <button onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')} className="hover:text-white transition-colors duration-200">Resume studio</button>
            <a
              href="https://github.com/vinu21699/AI-Interview-and-Resume-Analyzer-Guide"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            <span>© 2026 NexHire AI • All systems operational</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
