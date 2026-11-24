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
  BookOpen, Lock, Cpu, Layers, HelpCircle, LogIn, UserPlus, LogOut
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
    <div ref={containerRef} className="py-20 sm:py-28 max-w-4xl mx-auto px-6 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-white/[0.08] text-xs font-mono text-emerald-400 mb-6">
        <span>The core premise</span>
      </div>
      <p className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight text-balance tracking-tight">
        {words.map((word, index) => {
          const wordProgress = (index + 1) / words.length;
          const isLit = prefersReducedMotion || progress >= wordProgress * 0.85;
          return (
            <span
              key={index}
              className={`inline-block mr-[0.28em] transition-colors duration-500 ease-snappy ${
                isLit ? 'text-white' : 'text-white/25'
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
    <div className="min-h-screen bg-[#141415] text-[#ededed] font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg text-xs"
      >
        Skip to main content
      </a>

      {/* B7 Floating Navigation Bar */}
      <header className="sticky top-3 z-50 px-4 sm:px-6 max-w-6xl mx-auto">
        <nav
          aria-label="Primary"
          className="bg-[#181818]/90 backdrop-blur-md border border-white/[0.08] rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-lg"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">NexHire</span>
              <span className="text-[11px] text-slate-400 font-mono">2.0</span>
            </div>
          </Link>

          {/* Feature Navigation - Strictly Protected on Click */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')}
              className="hover:text-white transition-colors duration-300 ease-snappy flex items-center gap-1"
            >
              <span>Project defense</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
              className="hover:text-white transition-colors duration-300 ease-snappy flex items-center gap-1"
            >
              <span>Claim verification</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
              className="hover:text-white transition-colors duration-300 ease-snappy flex items-center gap-1"
            >
              <span>Pressure mode</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')}
              className="hover:text-white transition-colors duration-300 ease-snappy flex items-center gap-1"
            >
              <span>Resume studio</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
            <button
              onClick={() => handleProtectedNavigation('/company-prep', 'Target Company Prep')}
              className="hover:text-white transition-colors duration-300 ease-snappy flex items-center gap-1"
            >
              <span>Target prep</span>
              {!user && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-lg bg-[#272727] hover:bg-[#313131] text-xs font-semibold text-white border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center gap-1.5 active:scale-[0.98]"
                >
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#272727] border border-transparent hover:border-white/[0.08] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-white hover:text-emerald-400 transition-colors duration-300 ease-snappy flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors duration-300 ease-snappy active:scale-[0.98] shadow-sm flex items-center gap-1.5"
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
      <main id="main-content">
        
        {/* Section 1: Hero Section */}
        <section className="relative px-6 pt-16 sm:pt-24 pb-16 max-w-6xl mx-auto text-center">
          
          {/* Proof Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-white/[0.08] text-xs font-mono text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Calibrated against 1,200 engineering interview rubrics</span>
          </div>

          {/* Heading 1: Capped at 680px, Sentence Case, Gradient Text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight max-w-[680px] mx-auto text-balance leading-[1.08] hero-heading-gradient">
            Turn resume claims into bulletproof engineering proof
          </h1>

          {/* Subheading: Capped at 680px, Specificity */}
          <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-[680px] mx-auto text-pretty leading-relaxed">
            Superficial AI interviewers only ask textbook trivia. NexHire cross examines your actual project architecture, simulates strict viva pressure rounds, and calculates your true placement readiness score.
          </p>

          {/* Single Primary Action Above the Fold - Strictly Gated */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <>
                <button
                  onClick={scrollToAudit}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <span>Audit your resume</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#272727] hover:bg-[#313131] text-white text-sm font-semibold border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Candidate dashboard</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Log in to start audit</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#272727] hover:bg-[#313131] text-white text-sm font-semibold border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Create free account</span>
                </Link>
              </>
            )}
          </div>

          {/* Proof Strip */}
          <div className="mt-10 pt-6 border-t border-white/[0.08] max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-[#181818] border border-white/[0.08] rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">ATS parse accuracy</span>
              <span className="text-lg font-semibold text-white font-mono">94.2%</span>
            </div>
            <div className="p-3 bg-[#181818] border border-white/[0.08] rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Viva question bank</span>
              <span className="text-lg font-semibold text-emerald-400 font-mono">7 rounds</span>
            </div>
            <div className="p-3 bg-[#181818] border border-white/[0.08] rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Evaluated rubrics</span>
              <span className="text-lg font-semibold text-white font-mono">1,200+</span>
            </div>
            <div className="p-3 bg-[#181818] border border-white/[0.08] rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Average score lift</span>
              <span className="text-lg font-semibold text-emerald-400 font-mono">+28 pts</span>
            </div>
          </div>

          {/* Hero Visual: Interactive Product Simulator */}
          <div className="mt-14 bg-[#181818] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl text-left">
            
            {/* Simulator Window Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5 bg-[#1F1F1F] overflow-x-auto gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-400">nexhire terminal v2.0</span>
              </div>

              {/* Simulator Tabs */}
              <div className="flex items-center gap-1 shrink-0">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors duration-200 ease-snappy ${
                        isActive
                          ? 'bg-[#272727] text-white border border-white/[0.08]'
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

            {/* Simulator Content Body */}
            <div className="p-6 sm:p-8 bg-[#141415] min-h-[380px]">
              
              {/* TAB 1: PROJECT DEFENSE SIMULATOR */}
              {activeTab === 'defense' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Round 5 of 7 • Architectural Tradeoff Inquiries</span>
                      <h3 className="text-sm font-semibold text-white">Project: High throughput microservice data pipeline</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-[#272727] text-slate-300 border border-white/[0.08]">
                      Strict examiner mode
                    </span>
                  </div>

                  <div className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>AI Examiner Question:</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">
                      "You claimed you chose FastAPI and PostgreSQL to reduce 99th percentile response latency by 38 percent. Why did you select PostgreSQL over a document store given the write volume, and how did you prevent database connection pool exhaustion under sudden traffic spikes?"
                    </p>
                  </div>

                  <div className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Live evaluation rubrics</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#272727] border border-white/[0.08]">
                        <span className="text-slate-400 block text-[10px]">Architecture</span>
                        <span className="font-mono text-emerald-400 text-sm font-semibold">84%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#272727] border border-white/[0.08]">
                        <span className="text-slate-400 block text-[10px]">Technical depth</span>
                        <span className="font-mono text-emerald-400 text-sm font-semibold">89%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#272727] border border-white/[0.08]">
                        <span className="text-slate-400 block text-[10px]">Justification</span>
                        <span className="font-mono text-white text-sm font-semibold">78%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#272727] border border-white/[0.08]">
                        <span className="text-slate-400 block text-[10px]">Overall viva rating</span>
                        <span className="font-mono text-emerald-400 text-sm font-semibold">84 of 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense Viva')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Launch full seven round project defense</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CLAIM VERIFICATION SIMULATOR */}
              {activeTab === 'claims' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Detected resume claim</span>
                      <h3 className="text-sm font-semibold text-white">"Engineered distributed caching layer in Redis reducing DB load by 45 percent"</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Confidence score: 86%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">1. Technical probe</span>
                      <p className="text-slate-200">How did you handle cache invalidation and prevent stale data reads when writing updates?</p>
                    </div>
                    <div className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">2. Architectural tradeoff</span>
                      <p className="text-slate-200">What eviction policy (LRU, LFU, TTL) did you configure and what was the memory footprint?</p>
                    </div>
                  </div>

                  <div className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="text-slate-300">Diagnosis: High technical validity. Candidate demonstrated clear cache stampede prevention.</span>
                    <button
                      onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center gap-1"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Verify all claims</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PRESSURE INTERVIEW SIMULATOR */}
              {activeTab === 'pressure' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Pressure mode interview simulation</h3>
                    </div>
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                      Timer: 00:45
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-[#181818] border border-white/[0.08] p-3.5 rounded-xl text-slate-300">
                      <strong className="text-slate-400 font-mono block text-[10px] mb-1">AI Interviewer:</strong>
                      "You mentioned you understand database indexing. What is the fundamental difference between a clustered and non clustered index in PostgreSQL?"
                    </div>
                    <div className="bg-[#272727] border border-white/[0.08] p-3.5 rounded-xl text-white ml-4">
                      <strong className="text-emerald-400 font-mono block text-[10px] mb-1">Candidate Answer:</strong>
                      "A clustered index dictates physical row ordering on disk, while a non clustered index stores a separate pointer structure pointing to the heap."
                    </div>
                    <div className="bg-[#181818] border border-amber-500/20 p-3.5 rounded-xl text-amber-300">
                      <strong className="text-amber-400 font-mono block text-[10px] mb-1">Strict Pressure Follow up:</strong>
                      "That is standard textbook definition. Now explain what happens to write throughput when you attach five non clustered indexes to a high write table. Quantify the disk input output cost."
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Launch pressure interview session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: WEAKNESS RADAR SIMULATOR */}
              {activeTab === 'radar' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Candidate evaluation</span>
                      <h3 className="text-sm font-semibold text-white">Placement readiness index: 78 of 100</h3>
                    </div>
                    <span className="font-mono text-xs text-slate-300 bg-[#272727] border border-white/[0.08] px-2.5 py-1 rounded-md">
                      Seven core competencies
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#181818] border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">Data structures</span>
                      <span className="text-rose-400 text-sm font-semibold">44%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#181818] border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">SQL querying</span>
                      <span className="text-amber-400 text-sm font-semibold">63%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#181818] border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">Technical viva</span>
                      <span className="text-emerald-400 text-sm font-semibold">82%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#181818] border border-white/[0.08]">
                      <span className="text-slate-400 block text-[10px]">Backend architecture</span>
                      <span className="text-emerald-400 text-sm font-semibold">86%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#181818] border border-white/[0.08] space-y-2 text-xs">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">AI diagnostic remediation plan</span>
                    <p className="text-slate-300">
                      Weakness identified in <strong className="text-white">HashMaps and Graph Traversals</strong> (44 percent). Seven day targeted drill generated: Day 1 HashMap internal mechanics, Day 3 Two Sum variants, Day 6 Timed assessment.
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleProtectedNavigation('/dashboard', 'Weakness Radar')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Open full weakness radar on dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: RESUME STUDIO PREVIEW */}
              {activeTab === 'templates' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-white">Four enterprise ATS optimized resume templates</h3>
                    <div className="flex items-center gap-1">
                      {['modern', 'executive', 'split', 'minimalist'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveTemplatePreview(t)}
                          className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition-colors duration-200 ease-snappy ${
                            activeTemplatePreview === t
                              ? 'bg-[#272727] text-white border border-white/[0.08]'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white text-slate-900 p-6 rounded-xl text-xs space-y-2.5 max-h-60 overflow-hidden border border-slate-200">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-baseline">
                      <span className="font-bold text-base text-slate-950">ALEX JOHNSON</span>
                      <span className="text-[11px] font-mono text-slate-600">SENIOR SOFTWARE ENGINEER</span>
                    </div>
                    <p className="text-[11px] text-slate-700">
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
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5"
                    >
                      {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
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

        {/* Section 3: Problem to Solution Contrast */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">The engineering difference</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
              Why generic AI mock interviewers fail serious candidates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Generic AI tools and basic prompt wrappers</h3>
                  <span className="text-xs text-slate-400">Surface level interview prep</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5">✕</span>
                  <span>Superficial textbook trivia questions that any candidate can recite from memory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5">✕</span>
                  <span>Zero verification of metrics or architecture claims written on your resume.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5">✕</span>
                  <span>Generic score percentages that give false confidence without actionable remediation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 mt-0.5">✕</span>
                  <span>Leaves you completely vulnerable when real interviewers ask deep "Why" questions.</span>
                </li>
              </ul>
            </div>

            {/* The NexHire Placement Engine Way */}
            <div className="bg-[#181818] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">NexHire Placement Readiness Engine</h3>
                  <span className="text-xs text-emerald-400">Calibrated architectural defense</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Seven round project viva</strong> that interrogates database choice, cache invalidation, and failure modes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Automated claim verification</strong> that inspects every bullet point for defensible technical evidence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Strict pressure interview mode</strong> challenging theoretical responses with real disk input output costs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Calibrated placement readiness index</strong> giving an honest 0 to 100 rating with a personalized drill plan.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* Section 4: Benefits Grid (Four Outcome-Driven Bullets) */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">Core outcomes</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
              Engineered to eliminate candidate vulnerability
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Bulletproof claim verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Cross examines every metric, library, and throughput claim before hiring managers question you.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Seven round viva defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Tests the architectural reasons behind your tech stack choices under strict examiner scrutiny.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Targeted seven day remediation</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Automatically isolates your exact algorithmic and system design weak spots with daily drills.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Enterprise ATS fidelity</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Guarantees 100 percent parse accuracy on Workday and Greenhouse with linear vector structures.
              </p>
            </div>

          </div>
        </section>

        {/* Section 5: How It Works (Three Steps) */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">Process</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
              How the placement readiness engine works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-xs font-mono font-semibold text-emerald-400">
                  01
                </span>
                <span className="text-[11px] font-mono text-slate-400">Intake</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Upload your resume or paste projects</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                NexHire parses your technical experience, detects bold performance assertions, and flags claims that lack architectural justification.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-xs font-mono font-semibold text-emerald-400">
                  02
                </span>
                <span className="text-[11px] font-mono text-slate-400">Simulation</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Face adaptive viva and pressure rounds</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                AI examiners probe your project design decisions, verify claim authenticity, and test your poise when answers are challenged.
              </p>
            </div>

            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-xs font-mono font-semibold text-emerald-400">
                  03
                </span>
                <span className="text-[11px] font-mono text-slate-400">Readiness</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Receive calibrated index and drill plan</h3>
              <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                Get an objective 0 to 100 score across seven competencies with an automated daily curriculum to close identified weaknesses.
              </p>
            </div>

          </div>
        </section>

        {/* Section 6: Deep Feature Bento Grid */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-2">Technical depth</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
              Eight comprehensive placement readiness modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Bento Card 1: Project Defense Viva */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Project Defense Viva</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Seven round technical inquiry scrutinizing database selection, latency tradeoffs, edge cases, and architectural justifications.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/project-defense', 'Project Defense')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Start defense session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 2: Resume Claim Verification */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Resume Claim Verification</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Scans bullet points for metric inflation and generates targeted cross examination questions to verify actual ownership.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/resume-claim-verification', 'Claim Verification')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Scan resume claims</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 3: Pressure Interview Mode */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Pressure Interview Mode</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Simulates intense interviewer pushback, questioning standard answers and measuring composure under timed constraints.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/mock-interview', 'Pressure Mode')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Enter pressure mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 4: Weakness Radar */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Weakness Radar and Retesting</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Tracks competency across algorithms, system design, and communication, displaying quantifiable score improvements over time.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/dashboard', 'Weakness Radar')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>View readiness radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 5: Target Company Prep */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Target Company Alignment</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Aligns your technical prep against specific interview formats used by Google, Amazon, Microsoft, and high scale startups.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/company-prep', 'Target Company Prep')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Select target company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Card 6: Resume Studio Formats */}
            <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-[#272727] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Layout className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">ATS Resume Studio</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed text-pretty">
                  Four engineered templates built with linear headings and vector glyph typography for perfect ATS parsing.
                </p>
              </div>
              <button
                onClick={() => handleProtectedNavigation('/resume-builder', 'Resume Studio')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
              >
                {!user && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>Open resume studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* Section 7: Dropzone Upload Section (STRICTLY AUTHENTICATED) */}
        <section id="audit-section" className="px-6 py-16 max-w-4xl mx-auto">
          <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-6 sm:p-10 space-y-6">
            
            {user ? (
              /* AUTHENTICATED STATE: USER IS SIGNED IN */
              <>
                <div className="text-center space-y-1.5 max-w-lg mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Signed in as {user.name || user.email}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Audit your resume for interview vulnerabilities</h2>
                  <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                    Upload your resume in PDF or DOCX format to receive an instant analysis of claim risks, keyword coverage, and ATS parsing readiness.
                  </p>
                </div>

                {/* Drag and Drop Zone for Authenticated Users */}
                <div className="border border-dashed border-white/[0.12] hover:border-emerald-500/50 rounded-xl p-8 text-center transition-colors duration-300 ease-snappy bg-[#141415] relative group cursor-pointer">
                  <input
                    id="landing-resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-10 h-10 rounded-lg bg-[#272727] border border-white/[0.08] text-slate-300 mx-auto flex items-center justify-center mb-3">
                    <Upload className="w-4 h-4 text-emerald-400" />
                  </div>
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-emerald-400 font-semibold">{file.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to audit</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-200 font-medium">
                        Drop your resume here, or <span className="text-emerald-400 underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">PDF or DOCX up to 10MB</p>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleUploadAndAnalyze}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors duration-300 ease-snappy shadow-sm active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating resume claims...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Run instant placement audit</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* UNAUTHENTICATED STATE: LOGIN STRICTLY REQUIRED */
              <div className="text-center space-y-5 max-w-lg mx-auto py-4">
                <div className="w-12 h-12 rounded-xl bg-[#272727] border border-white/[0.08] text-amber-400 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
                    Authentication required
                  </span>
                  <h2 className="text-2xl font-semibold text-white tracking-tight">
                    Sign in to audit your resume
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed text-pretty">
                    To protect candidate privacy and preserve your placement audit history, you must be logged in before uploading resumes or accessing technical modules.
                  </p>
                </div>

                {/* Locked Dropzone Placeholder */}
                <div
                  onClick={() => {
                    addToast('Please sign in or create an account to upload resumes.', 'warning');
                    navigate('/login');
                  }}
                  className="border border-dashed border-white/[0.12] hover:border-amber-400/50 rounded-xl p-8 text-center transition-colors duration-300 ease-snappy bg-[#141415] cursor-pointer space-y-2 group"
                >
                  <Lock className="w-5 h-5 text-slate-500 group-hover:text-amber-400 mx-auto transition-colors" />
                  <p className="text-xs text-slate-300 font-medium">
                    Upload locked for guest visitors
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Click here to log in or register your candidate profile
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors duration-300 ease-snappy shadow-sm active:scale-[0.98]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log in to upload resume</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#272727] hover:bg-[#313131] text-white font-semibold text-xs border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create free account</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Security Points */}
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
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <div className="text-center space-y-1.5 mb-10">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">Common inquiries</span>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Frequently asked questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about the placement readiness engine.</p>
          </div>

          <div className="space-y-3">
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
                <div key={idx} className="bg-[#181818] border border-white/[0.08] rounded-xl p-4 space-y-2">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/[0.04] text-pretty">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 9: Final High-Converting CTA - Strictly Gated */}
        <section className="px-6 py-20 max-w-4xl mx-auto text-center">
          <div className="bg-[#181818] border border-white/[0.08] rounded-2xl p-8 sm:p-12 space-y-6">
            
            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">Get placement ready</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight hero-heading-gradient">
                Ready to turn resume claims into placement offers?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed text-pretty">
                Create your account or log in to discover vulnerable resume claims, test yourself against strict viva examiners, and benchmark your engineering readiness.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <>
                  <button
                    onClick={scrollToAudit}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <span>Audit your resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#272727] hover:bg-[#313131] text-white text-xs font-semibold border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Candidate dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log in to start audit</span>
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#272727] hover:bg-[#313131] text-white text-xs font-semibold border border-white/[0.08] transition-colors duration-300 ease-snappy flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Create free account</span>
                  </Link>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-mono pt-2">
              No credit card required • Instant analysis • Zero friction setup
            </p>

          </div>
        </section>

      </main>

      {/* Semantic Footer */}
      <footer className="border-t border-white/[0.08] bg-[#141415] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
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
