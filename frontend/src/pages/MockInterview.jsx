import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  Mic, Volume2, Send, Play, RefreshCw,
  Award, BarChart3, RotateCcw
} from 'lucide-react';

export default function MockInterview() {
  const [role, setRole] = useState('Software Engineer');
  const [mode, setMode] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  const { addToast } = useNotification();

  const handleStartInterview = async () => {
    setLoading(true);
    setEvaluations([]);
    setFinalReport(null);
    try {
      const res = await api.post('/interview/start', { role, mode, difficulty });
      setSession(res.data);
      setCurrentQuestion(res.data.current_question);
      setQuestionNum(1);
      speakText(res.data.current_question);
      addToast('Interview session initialized.', 'info');
    } catch (err) {
      addToast('Failed to start interview session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = createSpeechRecognition(
      (transcript) => {
        setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
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

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      addToast('Please enter or record an answer.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/interview/answer', {
        session_id: session.session_id,
        question_text: currentQuestion,
        user_answer: userAnswer,
        answer_type: isRecording ? 'voice' : 'text'
      });

      setEvaluations((prev) => [...prev, res.data.evaluation]);
      setUserAnswer('');

      if (res.data.is_finished) {
        const reportRes = await api.post(`/interview/finish/${session.session_id}`);
        setFinalReport(reportRes.data);
        addToast('Interview completed. Overall evaluation generated.', 'success');
      } else {
        setCurrentQuestion(res.data.next_question);
        setQuestionNum((prev) => prev + 1);
        speakText(res.data.next_question);
        addToast('Evaluation saved. Next question loaded.', 'info');
      }
    } catch (err) {
      addToast('Failed to submit answer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header Context Bar */}
      <div className="border-b border-white/[0.08] pb-5 space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <span>Interview simulation</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">
          Technical mock interview
        </h1>
        <p className="text-xs text-[#a1a1a6] max-w-xl leading-relaxed">
          Simulate engineering interviews with Text-to-Speech audio questions, speech transcription, and real-time per-answer evaluations.
        </p>
      </div>

      {!session ? (
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 max-w-2xl mx-auto space-y-5">
          <div className="border-b border-white/[0.08] pb-3">
            <h2 className="text-sm font-medium text-[#ededed]">Session parameters</h2>
            <p className="text-xs text-[#85858b]">Configure your interview target and evaluation strictness</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#85858b] font-mono block">Target role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#85858b] font-mono block">Evaluation mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div
                  onClick={() => setMode('Normal')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    mode === 'Normal'
                      ? 'bg-[#232325] border-white/[0.2]'
                      : 'bg-[#232325]/50 border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#ededed]">Normal</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  </div>
                  <p className="text-[11px] text-[#85858b] leading-relaxed">Supportive technical interviewer.</p>
                </div>

                <div
                  onClick={() => setMode('Technical')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    mode === 'Technical'
                      ? 'bg-[#232325] border-white/[0.2]'
                      : 'bg-[#232325]/50 border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#ededed]">Technical</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  </div>
                  <p className="text-[11px] text-[#85858b] leading-relaxed">Deep architecture and domain focus.</p>
                </div>

                <div
                  onClick={() => setMode('Pressure')}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    mode === 'Pressure'
                      ? 'bg-[#232325] border-rose-500/40'
                      : 'bg-[#232325]/50 border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-rose-300">Pressure</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  </div>
                  <p className="text-[11px] text-[#85858b] leading-relaxed">Strict bar-raiser challenging weak answers.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[#85858b] font-mono block">Seniority</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
                >
                  <option value="Junior">Junior engineer</option>
                  <option value="Medium">Mid-level (Standard)</option>
                  <option value="Senior">Senior / Tech lead</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#85858b] font-mono block">Format</label>
                <div className="w-full bg-[#232325] border border-white/[0.08] rounded-lg p-2.5 text-xs text-[#a1a1a6] flex items-center justify-between">
                  <span>{mode === 'Pressure' ? '5 questions' : '3 questions'}</span>
                  <span className="font-mono text-[#85858b]">{mode}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              Begin mock interview
            </button>
          </div>
        </div>
      ) : !finalReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
              <span className={mode === 'Pressure' ? 'text-rose-400' : 'text-[#85858b]'}>
                Question {questionNum} of {mode === 'Pressure' ? 5 : 3} • {role} ({mode})
              </span>
              <button
                onClick={() => speakText(currentQuestion)}
                className="btn-secondary text-[11px] py-1 flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" /> Read aloud
              </button>
            </div>

            {mode === 'Pressure' && (
              <div className="p-2.5 rounded-lg bg-[#232325] border border-rose-500/30 text-xs text-rose-300 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Bar-raiser mode: Justify architectural decisions with concrete code examples.</span>
              </div>
            )}

            <div className="p-4 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
              <span className="text-[10px] font-mono text-[#85858b] uppercase">Interviewer question</span>
              <h3 className="text-sm font-medium text-[#ededed] leading-relaxed">{currentQuestion}</h3>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#85858b]">
                  <span>Your response</span>
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                      isRecording ? 'bg-rose-500 text-[#0f0f10]' : 'bg-[#232325] text-[#a1a1a6] hover:text-[#ededed]'
                    }`}
                  >
                    <Mic className="w-3 h-3 text-rose-400" />
                    {isRecording ? 'Listening...' : 'Voice input'}
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response or use voice input..."
                  className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none leading-relaxed resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit response
              </button>
            </form>
          </div>

          {/* Evaluations Drawer */}
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#85858b] flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Evaluations ({evaluations.length})
            </h3>
            {evaluations.length === 0 ? (
              <p className="text-xs text-[#85858b] font-mono">Answers and scores will appear here as you submit.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[420px]">
                {evaluations.map((evalItem, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#232325] border border-white/[0.08] text-xs space-y-1">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[#85858b]">Q{idx + 1} score:</span>
                      <span className="text-emerald-400 font-medium">{evalItem.technical_score}%</span>
                    </div>
                    <p className="text-[#a1a1a6] text-[11px] leading-relaxed">"{evalItem.feedback}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final Interview Report */
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-6 max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-mono text-[#85858b] uppercase">Interview assessment</span>
            <div className="text-4xl font-mono text-[#ededed] font-medium tabular-nums">
              {finalReport.overall_score}%
            </div>
            <p className="text-xs text-[#85858b]">Target: {finalReport.role} • Difficulty: {finalReport.difficulty}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
              <h4 className="font-mono text-emerald-400 text-[11px]">Key strengths</h4>
              <ul className="space-y-1 text-[#a1a1a6]">
                {finalReport.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
              <h4 className="font-mono text-amber-400 text-[11px]">Recommended focus</h4>
              <ul className="space-y-1 text-[#a1a1a6]">
                {finalReport.improvement_plan?.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setSession(null)}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Start another session
          </button>
        </div>
      )}
    </div>
  );
}
