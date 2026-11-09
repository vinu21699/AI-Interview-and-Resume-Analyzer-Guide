import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, ShieldAlert, Award, Check, ChevronDown, ChevronUp,
  Lock, RefreshCw, BarChart3, Target, Mic, Code2
} from 'lucide-react';

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
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
            email: 'user@antigravity.ai',
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
    <div className="min-h-screen bg-[#141415] text-[#ededed] font-sans selection:bg-emerald-500 selection:text-[#0f0f10]">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#141415]/90 backdrop-blur-md border-b border-white/[0.08] px-6 lg:px-12 h-14 flex items-center">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-[#ededed]">NexHire</span>
              <span className="text-xs text-[#85858b] font-mono">readiness</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#a1a1a6]">
            <Link to="/resume-analyzer" className="hover:text-[#ededed] transition-colors">Resume checker</Link>
            <Link to="/resume-claim-verification" className="hover:text-[#ededed] transition-colors">Claim verification</Link>
            <Link to="/project-defense" className="hover:text-[#ededed] transition-colors">Project defense</Link>
            <Link to="/mock-interview" className="hover:text-[#ededed] transition-colors">Mock interview</Link>
            <Link to="/company-prep" className="hover:text-[#ededed] transition-colors">Company prep</Link>
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
      <section className="py-20 px-6 lg:px-12 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#232325] border border-white/[0.08] text-xs font-mono text-[#a1a1a6]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Placement readiness platform
            </div>

            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#ededed] leading-[1.15]">
              Technical placement readiness, verified by AI
            </h1>

            <p className="text-sm sm:text-base text-[#a1a1a6] max-w-xl leading-relaxed">
              Audit your resume for ATS compliance, cross-examine project claims in multi-round technical vivas, and diagnose topic-level weaknesses before high-stakes engineering interviews.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-[#85858b]">
              <div>Multi-factor scoring (/100)</div>
              <div>•</div>
              <div>7-round project viva</div>
              <div>•</div>
              <div>Weakness radar diagnostics</div>
            </div>
          </div>

          {/* Dropzone Hero Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-5">
              <div className="border border-dashed border-white/[0.12] hover:border-emerald-500/50 transition-colors rounded-lg p-6 text-center relative group">
                <input
                  id="landing-resume-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="w-10 h-10 rounded-lg bg-[#232325] border border-white/[0.08] text-[#a1a1a6] mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-emerald-400" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#ededed] truncate">{file.name}</p>
                    <p className="text-xs text-[#85858b] font-mono">File selected • Ready to analyze</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#ededed]">
                      Drop your resume here, or <span className="text-emerald-400 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-[#85858b] font-mono">
                      PDF, DOCX up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleUploadAndAnalyze}
                  className="w-full btn-accent flex items-center justify-center gap-2 py-2.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating resume...
                    </>
                  ) : (
                    <>
                      Analyze resume
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#85858b] font-mono px-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" /> Privacy preserved
                  </span>
                  <span>Instant ATS report</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="py-20 px-6 lg:px-12 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono text-[#85858b] uppercase tracking-wider">Evaluation model</span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#ededed]">
              Three layers of candidate readiness verification
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed">
              Standard tools count repeated keywords. NexHire combines technical parsing, adversarial cross-examination, and diagnostic skill testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="w-9 h-9 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#85858b]">Layer 01</span>
                <h3 className="text-base font-medium text-[#ededed]">Resume claim verification</h3>
              </div>
              <p className="text-xs text-[#a1a1a6] leading-relaxed">
                Extracts prominent technical claims from experience and project bullets. Generates a 4-question technical stepper evaluating accuracy, architecture, trade-offs, and error mitigation.
              </p>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="w-9 h-9 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#85858b]">Layer 02</span>
                <h3 className="text-base font-medium text-[#ededed]">Project defense viva</h3>
              </div>
              <p className="text-xs text-[#a1a1a6] leading-relaxed">
                Acts as a strict technical examiner across 7 rounds: overview, stack, architecture, implementation, why trade-offs, failure scenarios, and deep dynamic cross-questioning.
              </p>
            </div>

            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-4">
              <div className="w-9 h-9 rounded-lg bg-[#232325] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#85858b]">Layer 03</span>
                <h3 className="text-base font-medium text-[#ededed]">Weakness radar & practice</h3>
              </div>
              <p className="text-xs text-[#a1a1a6] leading-relaxed">
                Synthesizes assessment data across DSA, SQL, Technical Interview, and Projects into an interactive radar with 7-day personalized recovery curricula and before-vs-after tracking.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Bullet Transformation CAR Example */}
      <section className="py-20 px-6 lg:px-12 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono text-[#85858b] uppercase tracking-wider">Bullet engineering</span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#ededed]">
              Context-Action-Result (CAR) rewriting
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1a6]">
              Replace passive duties with measurable technical achievements that demonstrate operational scale.
            </p>
          </div>

          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-[#232325] border border-white/[0.08] rounded-lg p-4 space-y-2">
                <span className="text-xs font-mono text-[#85858b] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Passive bullet
                </span>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  "Responsible for building backend APIs and working with the database to fix bugs and improve performance."
                </p>
                <div className="pt-2 text-[11px] text-[#85858b] border-t border-white/[0.04]">
                  Passive phrasing • Missing throughput metrics • No architecture specified
                </div>
              </div>

              <div className="bg-[#232325] border border-white/[0.08] rounded-lg p-4 space-y-2">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  CAR formula rewrite
                </span>
                <p className="text-xs text-[#ededed] leading-relaxed">
                  "Architected 14+ RESTful microservices in FastAPI and PostgreSQL, slashing p99 latency by 38% across 1.4M daily requests."
                </p>
                <div className="pt-2 text-[11px] text-emerald-400/80 border-t border-white/[0.04]">
                  Active technical verb • 38% latency reduction • 1.4M requests scale
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 lg:px-12 border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">Frequently asked questions</h2>
            <p className="text-xs text-[#85858b]">Common technical questions about the placement readiness system.</p>
          </div>

          <div className="space-y-2">
            {[
              {
                q: "What is an ATS (Applicant Tracking System)?",
                a: "An ATS is automated software used by enterprise hiring pipelines to parse, extract, and index applicant resumes. Standard parsers filter out documents with non-standard section headers, multi-column layout corruption, or unindexed keyword gaps."
              },
              {
                q: "How does Resume Claim Verification work?",
                a: "The engine scans your resume experience and project bullets to identify verifiable claims (e.g. 'Optimized SQL indexing'). It generates a 4-question technical examination testing core concepts, architecture, choice trade-offs, and error mitigation."
              },
              {
                q: "What happens in Project Defense viva mode?",
                a: "The AI conducts a strict 7-round technical examination on your projects. Questions adapt dynamically based on your previous answers to evaluate architectural ownership and design justifications."
              },
              {
                q: "How is the Placement Readiness Score calculated?",
                a: "The score is a transparent weighted index: Resume (15%), DSA & Coding (20%), SQL & Database (15%), Technical Interview (20%), Project Defense (15%), and Communication (15%)."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#19191b] border border-white/[0.08] rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-medium text-[#ededed] hover:bg-[#232325] transition-colors"
                >
                  <span>{faq.q}</span>
                  {faqOpen[idx] ? <ChevronUp className="w-3.5 h-3.5 text-[#85858b]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#85858b]" />}
                </button>
                {faqOpen[idx] && (
                  <div className="px-5 pb-4 text-xs text-[#a1a1a6] leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-white/[0.08] bg-[#0f0f10] text-center text-xs text-[#85858b]">
        <p className="font-mono text-[11px]">NexHire AI • Technical placement readiness and verification</p>
      </footer>

    </div>
  );
}
