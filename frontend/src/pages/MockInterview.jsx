import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  Mic, Volume2, VolumeX, Send, CheckCircle2, Play, RefreshCw,
  Sparkles, Award, BarChart3, RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      addToast('Mock interview initialized. Listen to the AI question!', 'info');
    } catch (err) {
      addToast('Failed to start interview session', 'error');
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
        addToast('Voice transcribed successfully!', 'success');
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
      addToast('Speech Recognition not supported in this browser.', 'error');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      addToast('Please provide an answer first.', 'error');
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
        // Finish interview session
        const reportRes = await api.post(`/interview/finish/${session.session_id}`);
        setFinalReport(reportRes.data);
        addToast('Interview finished! Overall report generated.', 'success');
      } else {
        setCurrentQuestion(res.data.next_question);
        setQuestionNum((prev) => prev + 1);
        speakText(res.data.next_question);
        addToast('Evaluation saved. Proceeding to next question.', 'success');
      }
    } catch (err) {
      addToast('Failed to submit answer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400">
          <Sparkles className="w-3.5 h-3.5" /> AI Audio & Voice Simulator
        </div>
        <h1 className="text-3xl font-extrabold text-white">AI Interactive Mock Interview</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Simulate realistic technical and behavioral interviews with real-time Text-to-Speech audio questions, speech recognition, and instant AI answer evaluation.
        </p>
      </div>

      {!session ? (
        <div className="glass-card p-8 border border-slate-800 max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-white text-center">Configure Mock Session</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
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
                <option value="Cyber Security">Cyber Security</option>
                <option value="UI/UX">UI/UX Designer</option>
                <option value="HR">HR Specialist</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Interview Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Start AI Mock Interview
            </button>
          </div>
        </div>
      ) : !finalReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Q&A Box */}
          <div className="glass-card p-6 border border-slate-800 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Question {questionNum} of 3 • {role} ({mode})
              </span>
              <button
                onClick={() => speakText(currentQuestion)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-purple-400" /> Read Out Loud
              </button>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/20 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">AI INTERVIEWER ASKED:</span>
              <h3 className="text-lg font-bold text-white leading-snug">{currentQuestion}</h3>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase">Your Response</label>
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isRecording
                        ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-slate-900 border-slate-800 text-purple-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isRecording ? 'Listening (Speak Now)...' : 'Voice Input (Mic)'}
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response or use voice input..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Answer & Evaluate
              </button>
            </form>
          </div>

          {/* Evaluations Drawer */}
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" /> Per-Answer Evaluations
            </h3>
            {evaluations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Answers and scores will appear here as you progress.</p>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[450px]">
                {evaluations.map((evalItem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>Q{idx + 1} Score:</span>
                      <span className="text-purple-400">{evalItem.technical_score}%</span>
                    </div>
                    <p className="text-slate-400 italic">"{evalItem.feedback}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final Interview Report */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border border-slate-800 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Mock Interview Complete</h2>
            <p className="text-xs text-slate-400">Target Role: {finalReport.role} | Difficulty: {finalReport.difficulty}</p>
            <div className="text-4xl font-extrabold gradient-text pt-2">{finalReport.overall_score}%</div>
            <span className="text-xs text-slate-400">Overall Performance Index</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-2">
              <h4 className="font-bold text-emerald-400">Key Strengths</h4>
              {finalReport.strengths?.map((s, idx) => (
                <p key={idx} className="text-slate-300">• {s}</p>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs space-y-2">
              <h4 className="font-bold text-amber-400">Improvement Plan</h4>
              {finalReport.improvement_plan?.map((p, idx) => (
                <p key={idx} className="text-slate-300">• {p}</p>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSession(null)}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Start Another Session
          </button>
        </motion.div>
      )}
    </div>
  );
}
