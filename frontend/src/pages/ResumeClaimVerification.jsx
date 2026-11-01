import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, HelpCircle,
  Sparkles, RefreshCw, Mic, Volume2, ArrowRight, ArrowLeft,
  ChevronRight, Award, Zap, AlertCircle, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeClaimVerification() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [isRecording, setIsRecording] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const { addToast } = useNotification();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims/my-claims');
      setClaims(res.data.claims || []);
    } catch (err) {
      addToast('Could not load claims. Extracting from resume...', 'info');
      handleExtractNew();
    } finally {
      setLoading(false);
    }
  };

  const handleExtractNew = async () => {
    setExtracting(true);
    try {
      const res = await api.post('/claims/extract', {});
      setClaims(res.data.claims || []);
      addToast(`Extracted ${res.data.claims?.length || 0} technical resume claims!`, 'success');
    } catch (err) {
      addToast('Failed to extract claims from resume.', 'error');
    } finally {
      setExtracting(false);
    }
  };

  const openClaimModal = (claim) => {
    setSelectedClaim(claim);
    setActiveQuestionIdx(0);
    setAnswers(claim.answers && claim.answers.length === 4 ? [...claim.answers] : ['', '', '', '']);
    setVerificationResult(claim.status === 'verified' ? {
      technical_accuracy: claim.technical_accuracy,
      understanding_score: claim.understanding_score,
      confidence_score: claim.confidence_score,
      communication_score: claim.communication_score,
      claim_confidence: claim.claim_confidence,
      feedback: claim.feedback,
      risk_analysis: claim.risk_analysis
    } : null);

    // Speak first question
    if (claim.questions && claim.questions.length > 0) {
      speakText(claim.questions[0]);
    }
  };

  const handleSpeechInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = createSpeechRecognition(
      (transcript) => {
        setAnswers(prev => {
          const updated = [...prev];
          updated[activeQuestionIdx] = updated[activeQuestionIdx]
            ? `${updated[activeQuestionIdx]} ${transcript}`
            : transcript;
          return updated;
        });
        setIsRecording(false);
        addToast('Voice transcribed!', 'success');
      },
      (err) => {
        setIsRecording(false);
        addToast('Speech recognition error: ' + err, 'error');
      }
    );

    if (recognition) {
      setIsRecording(true);
      recognition.start();
    } else {
      addToast('Speech recognition not supported in your browser.', 'error');
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < 3) {
      const nextIdx = activeQuestionIdx + 1;
      setActiveQuestionIdx(nextIdx);
      if (selectedClaim?.questions?.[nextIdx]) {
        speakText(selectedClaim.questions[nextIdx]);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitVerification = async () => {
    const filledCount = answers.filter(a => a.trim().length > 0).length;
    if (filledCount === 0) {
      addToast('Please answer at least one verification question.', 'warning');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post('/claims/verify', {
        claim_id: selectedClaim.id,
        answers: answers
      });
      setVerificationResult(res.data.evaluation);
      addToast('Claim verification evaluated successfully!', 'success');
      // Update local state list
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? res.data.claim : c));
    } catch (err) {
      addToast('Claim verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getConfidenceBadge = (score) => {
    if (score >= 80) return { label: 'Strong', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    if (score >= 60) return { label: 'Moderate', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    return { label: 'Needs Improvement', badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> AI Resume Claim Verification Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Verify Your <span className="text-emerald-400">Resume Claims</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Technical recruiters and hiring managers cross-examine specific claims made in your resume. Answer targeted technical questions to test your real-world understanding before interviewing.
          </p>
        </div>

        <button
          onClick={handleExtractNew}
          disabled={extracting}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 shrink-0 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${extracting ? 'animate-spin' : ''}`} />
          {extracting ? 'Analyzing Resume...' : 'Re-extract Claims'}
        </button>
      </div>

      {/* Claims List Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          Extracting and indexing resume claims...
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 glass-card text-center space-y-4 rounded-3xl border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Resume Claims Identified Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Upload your resume in the Resume Analyzer or click below to analyze standard engineering claims.</p>
          <button onClick={handleExtractNew} className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold">
            Extract Claims Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Extracted Technical Claims ({claims.length})
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Select a claim to begin interactive verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claims.map((claim) => {
              const verified = claim.status === 'verified';
              const badge = verified ? getConfidenceBadge(claim.claim_confidence) : null;
              return (
                <div
                  key={claim.id}
                  onClick={() => openClaimModal(claim)}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {claim.related_skill || 'Core Skill'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        claim.importance === 'Critical' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' :
                        claim.importance === 'High' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                        'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                      }`}>
                        {claim.importance} Impact
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        "{claim.claim_text}"
                      </h3>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    {verified ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border font-extrabold text-[10px] ${badge.badge}`}>
                          {badge.label} • {claim.claim_confidence}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> 4 Questions Ready
                      </span>
                    )}

                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {verified ? 'Review' : 'Verify'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Verification Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase">
                      VERIFY THIS CLAIM
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{selectedClaim.related_skill}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    "{selectedClaim.claim_text}"
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedClaim(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* If already evaluated, show verification scorecard */}
              {verificationResult ? (
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">CLAIM CONFIDENCE SCORE</span>
                    <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
                      <span className={verificationResult.claim_confidence >= 80 ? 'text-emerald-400' : verificationResult.claim_confidence >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                        {verificationResult.claim_confidence}%
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase"
                      style={{
                        backgroundColor: verificationResult.claim_confidence >= 80 ? 'rgba(16, 185, 129, 0.1)' : verificationResult.claim_confidence >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        borderColor: verificationResult.claim_confidence >= 80 ? '#10b981' : verificationResult.claim_confidence >= 60 ? '#f59e0b' : '#f43f5e',
                        color: verificationResult.claim_confidence >= 80 ? '#34d399' : verificationResult.claim_confidence >= 60 ? '#fbbf24' : '#fb7185'
                      }}>
                      {verificationResult.claim_confidence >= 80 ? 'Strong Confidence' : verificationResult.claim_confidence >= 60 ? 'Moderate Confidence' : 'Needs Verification'}
                    </div>
                  </div>

                  {/* 4 Pillar Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Technical Accuracy", score: verificationResult.technical_accuracy },
                      { label: "Understanding", score: verificationResult.understanding_score },
                      { label: "Confidence", score: verificationResult.confidence_score },
                      { label: "Communication", score: verificationResult.communication_score }
                    ].map((p, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{p.label}</span>
                        <div className={`text-lg font-black ${p.score >= 80 ? 'text-emerald-400' : p.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {p.score}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Constructive Risk Analysis Note */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-400" /> AI Evidence Assessment
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {verificationResult.risk_analysis}
                    </p>
                  </div>

                  {/* Constructive Feedback */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Examiner Feedback
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {verificationResult.feedback}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setVerificationResult(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                    >
                      Re-answer Questions
                    </button>
                    <button
                      onClick={() => setSelectedClaim(null)}
                      className="gradient-btn px-6 py-2 rounded-xl text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Question & Answer Flow */
                <div className="space-y-6">
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-emerald-400">Question {activeQuestionIdx + 1} of 4</span>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`w-6 h-1.5 rounded-full transition-all ${
                            idx === activeQuestionIdx ? 'bg-emerald-400 w-8' :
                            answers[idx]?.trim() ? 'bg-emerald-500/40' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 relative">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {selectedClaim?.questions?.[activeQuestionIdx] || 'Explain your technical implementation in detail.'}
                      </p>
                      <button
                        onClick={() => speakText(selectedClaim?.questions?.[activeQuestionIdx])}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                        title="Listen to question"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* Candidate Answer Box with Voice Integration */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-300">Your Technical Response</label>
                      <button
                        type="button"
                        onClick={handleSpeechInput}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isRecording
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        {isRecording ? 'Listening...' : 'Voice Input'}
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={answers[activeQuestionIdx]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnswers(prev => {
                          const updated = [...prev];
                          updated[activeQuestionIdx] = val;
                          return updated;
                        });
                      }}
                      placeholder="Explain your hands-on implementation, architectural decisions, and error-handling mechanisms..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed resize-none"
                    />
                  </div>

                  {/* Navigation & Submit Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      disabled={activeQuestionIdx === 0}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    {activeQuestionIdx < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5 border border-slate-700"
                      >
                        Next Question <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitVerification}
                        disabled={verifying}
                        className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                      >
                        {verifying ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            Evaluating Claim...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Evaluate & Verify Claim
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
