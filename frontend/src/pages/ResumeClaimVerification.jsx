import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  ShieldCheck, AlertTriangle, HelpCircle,
  RefreshCw, Mic, Volume2, ArrowRight, ArrowLeft,
  ChevronRight, AlertCircle, FileText, Check
} from 'lucide-react';

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
      addToast(`Extracted ${res.data.claims?.length || 0} technical resume claims.`, 'success');
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
        addToast('Voice transcribed.', 'success');
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
      addToast('Speech recognition is not supported in this browser.', 'error');
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
      addToast('Claim verification evaluated.', 'success');
      setClaims(prev => prev.map(c => c.id === selectedClaim.id ? res.data.claim : c));
    } catch (err) {
      addToast('Claim verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const getConfidenceBadge = (score) => {
    if (score >= 80) return { label: 'Strong', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Needs verification', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Integrity auditing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">
            Resume claim verification
          </h1>
          <p className="text-xs text-[#a1a1a6] max-w-xl leading-relaxed">
            Technical interviewers cross-examine specific claims made in your resume. Answer targeted 4-question checks to test your real-world depth.
          </p>
        </div>

        <button
          onClick={handleExtractNew}
          disabled={extracting}
          className="btn-secondary text-xs py-1.5 flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${extracting ? 'animate-spin' : ''}`} />
          {extracting ? 'Extracting...' : 'Re-extract claims'}
        </button>
      </div>

      {/* Claims List Grid */}
      {loading ? (
        <div className="p-16 text-center text-[#85858b] text-xs font-mono flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          Extracting claims from resume...
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 bg-[#19191b] text-center space-y-3 rounded-xl border border-white/[0.08]">
          <FileText className="w-8 h-8 text-[#85858b] mx-auto" />
          <h3 className="text-sm font-medium text-[#ededed]">No resume claims identified yet</h3>
          <p className="text-xs text-[#85858b] max-w-sm mx-auto">Upload a resume in the analyzer or click below to extract standard claims.</p>
          <button onClick={handleExtractNew} className="btn-primary text-xs">
            Extract claims now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#85858b] font-mono">
            <span>Identified claims ({claims.length})</span>
            <span>Select a claim to verify</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {claims.map((claim) => {
              const verified = claim.status === 'verified';
              const badge = verified ? getConfidenceBadge(claim.claim_confidence) : null;
              return (
                <div
                  key={claim.id}
                  onClick={() => openClaimModal(claim)}
                  className="bg-[#19191b] hover:bg-[#1e1e21] border border-white/[0.08] hover:border-white/[0.16] rounded-xl p-4 space-y-3 cursor-pointer transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#232325] text-[#a1a1a6]">
                        {claim.related_skill || 'Core skill'}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        claim.importance === 'Critical' ? 'bg-rose-500/10 text-rose-400' :
                        claim.importance === 'High' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {claim.importance}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-[#ededed] leading-snug">
                      "{claim.claim_text}"
                    </h3>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                    {verified ? (
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${badge.color}`}>
                        {badge.label} • {claim.claim_confidence}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#85858b] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> 4 questions ready
                      </span>
                    )}

                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      {verified ? 'Review' : 'Verify'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Dialog */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-[#0f0f10]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
                  <span className="text-emerald-400">Claim test</span>
                  <span>•</span>
                  <span>{selectedClaim.related_skill}</span>
                </div>
                <h3 className="text-sm font-medium text-[#ededed] leading-snug">
                  "{selectedClaim.claim_text}"
                </h3>
              </div>

              <button
                onClick={() => setSelectedClaim(null)}
                className="w-7 h-7 rounded bg-[#232325] hover:bg-[#2c2c30] text-[#85858b] hover:text-[#ededed] flex items-center justify-center text-xs shrink-0"
              >
                ✕
              </button>
            </div>

            {verificationResult ? (
              <div className="space-y-5">
                <div className="bg-[#232325] border border-white/[0.08] rounded-lg p-5 text-center space-y-2">
                  <span className="text-xs font-mono text-[#85858b] uppercase">Claim confidence</span>
                  <div className="text-3xl font-mono text-[#ededed] font-medium">
                    {verificationResult.claim_confidence}%
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    {verificationResult.claim_confidence >= 80 ? 'Strong evidence' : verificationResult.claim_confidence >= 60 ? 'Moderate evidence' : 'Needs verification'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Technical accuracy", score: verificationResult.technical_accuracy },
                    { label: "Understanding", score: verificationResult.understanding_score },
                    { label: "Confidence", score: verificationResult.confidence_score },
                    { label: "Communication", score: verificationResult.communication_score }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-[#232325] border border-white/[0.08] p-2.5 rounded-lg text-center space-y-0.5">
                      <span className="text-[10px] text-[#85858b] block font-mono">{p.label}</span>
                      <div className="text-sm font-mono text-[#ededed] font-medium">
                        {p.score}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
                  <h4 className="text-xs font-medium text-[#ededed] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400" /> Evidence assessment
                  </h4>
                  <p className="text-xs text-[#a1a1a6] leading-relaxed">
                    {verificationResult.risk_analysis}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
                  <h4 className="text-xs font-medium text-emerald-400">
                    Examiner feedback
                  </h4>
                  <p className="text-xs text-[#a1a1a6] leading-relaxed">
                    {verificationResult.feedback}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="btn-secondary text-xs"
                  >
                    Re-answer
                  </button>
                  <button
                    onClick={() => setSelectedClaim(null)}
                    className="btn-primary text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#85858b]">
                  <span>Question {activeQuestionIdx + 1} of 4</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-5 h-1 rounded transition-colors ${
                          idx === activeQuestionIdx ? 'bg-emerald-400' :
                          answers[idx]?.trim() ? 'bg-emerald-500/40' : 'bg-[#232325]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#232325] border border-white/[0.08] p-4 rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium text-[#ededed] leading-relaxed">
                      {selectedClaim?.questions?.[activeQuestionIdx] || 'Explain your technical implementation in detail.'}
                    </p>
                    <button
                      onClick={() => speakText(selectedClaim?.questions?.[activeQuestionIdx])}
                      className="p-1 rounded bg-[#19191b] hover:bg-[#2b2b2f] text-[#85858b] hover:text-[#ededed] shrink-0"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#85858b]">
                    <span>Your technical answer</span>
                    <button
                      type="button"
                      onClick={handleSpeechInput}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                        isRecording ? 'bg-rose-500 text-[#0f0f10]' : 'bg-[#232325] text-[#a1a1a6] hover:text-[#ededed]'
                      }`}
                    >
                      <Mic className="w-3 h-3 text-emerald-400" />
                      {isRecording ? 'Listening...' : 'Voice input'}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={answers[activeQuestionIdx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswers(prev => {
                        const updated = [...prev];
                        updated[activeQuestionIdx] = val;
                        return updated;
                      });
                    }}
                    placeholder="Explain your architectural design, implementation specifics, and error handling..."
                    className="w-full bg-[#232325] border border-white/[0.08] focus:border-emerald-500/50 rounded-lg p-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="btn-secondary text-xs disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  {activeQuestionIdx < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="btn-secondary text-xs flex items-center gap-1"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitVerification}
                      disabled={verifying}
                      className="btn-accent text-xs flex items-center gap-1.5"
                    >
                      {verifying ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-[#06281e] border-t-transparent animate-spin"></span>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Complete verification
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
