import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  ShieldAlert, ShieldCheck, Award, Zap, HelpCircle,
  Play, RefreshCw, Mic, Volume2, ArrowRight, CheckCircle2,
  AlertCircle, BookOpen, Layers, Database, Cpu, Check, FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectDefense() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customForm, setCustomForm] = useState({
    project_name: '',
    project_description: '',
    technologies: '',
    role: 'Lead Developer',
    database: 'PostgreSQL',
    challenges: '',
    results: ''
  });

  const [session, setSession] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentRoundName, setCurrentRoundName] = useState('Project Overview');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyRounds, setHistoryRounds] = useState([]);
  const [finalScorecard, setFinalScorecard] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const { addToast } = useNotification();

  useEffect(() => {
    api.get('/defense/resume-projects')
      .then(res => {
        const projs = res.data.projects || [];
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProject(projs[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleStartDefense = async () => {
    const projData = isCustom ? customForm : selectedProject;
    if (!projData?.project_name?.trim()) {
      addToast('Please select or enter a project name.', 'warning');
      return;
    }

    setSubmitting(true);
    setFinalScorecard(null);
    setHistoryRounds([]);
    try {
      const res = await api.post('/defense/start', {
        project_name: projData.project_name,
        project_description: projData.description || projData.project_description || '',
        technologies: projData.technologies || '',
        role: projData.role || 'Software Engineer',
        database: projData.database || 'PostgreSQL'
      });

      setSession(res.data);
      setCurrentRound(res.data.current_round);
      setCurrentRoundName(res.data.round_name);
      setCurrentQuestion(res.data.question);
      setUserAnswer('');
      speakText(res.data.question);
      addToast('Project Defense session started. Examiner is ready!', 'info');
    } catch (err) {
      addToast('Failed to start project defense session.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpeechToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = createSpeechRecognition(
      (transcript) => {
        setUserAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
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
      addToast('Speech recognition not supported in this browser.', 'error');
    }
  };

  const handleSubmitRoundAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      addToast('Please provide an answer to defend your project.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/defense/answer', {
        session_id: session.session_id,
        round_number: currentRound,
        answer: userAnswer
      });

      // Save to local round history
      setHistoryRounds(prev => [...prev, {
        round_number: currentRound,
        round_name: currentRoundName,
        question: currentQuestion,
        answer: userAnswer
      }]);

      setUserAnswer('');

      if (res.data.is_finished) {
        setFinalScorecard(res.data.evaluation);
        addToast('Project Defense completed! Final evaluation generated.', 'success');
      } else {
        setCurrentRound(res.data.current_round);
        setCurrentRoundName(res.data.round_name);
        setCurrentQuestion(res.data.question);
        speakText(res.data.question);
        addToast(`Proceeding to Round ${res.data.current_round}: ${res.data.round_name}`, 'info');
      }
    } catch (err) {
      addToast('Failed to submit answer to defense round.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetSession = () => {
    setSession(null);
    setFinalScorecard(null);
    setHistoryRounds([]);
    setCurrentRound(1);
    setUserAnswer('');
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-400">
            <ShieldAlert className="w-3.5 h-3.5" /> AI Project Defense & Viva Examiner
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Defend Your <span className="text-purple-400">Engineering Projects</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Face an interactive 7-round viva with a rigorous AI technical examiner. The AI evaluates your architecture, implementation choices, trade-offs, and dynamically cross-examines you based on your previous answers.
          </p>
        </div>

        {session && (
          <button
            onClick={resetSession}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all shadow-md shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Start Another Defense
          </button>
        )}
      </div>

      {/* INITIAL SETUP: PROJECT SELECTION */}
      {!session && !finalScorecard && (
        <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Select Project for Defense</h2>
              <p className="text-xs text-slate-400">Choose from your resume or enter a custom portfolio project</p>
            </div>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isCustom ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Resume Projects
              </button>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isCustom ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>

          {!isCustom ? (
            <div className="space-y-4">
              {loadingProjects ? (
                <div className="p-8 text-center text-xs text-slate-400">Reading projects from resume...</div>
              ) : projects.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">No projects found in resume text. Use manual entry.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {projects.map((proj, idx) => {
                    const isSelected = selectedProject?.project_name === proj.project_name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedProject(proj)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-500/80 shadow-lg shadow-purple-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-purple-400" /> {proj.project_name}
                          </h4>
                          <span className="text-[10px] font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                            {proj.role || 'Full Stack'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                        <div className="mt-2 text-[11px] font-mono text-slate-500">
                          Tech: <span className="text-slate-300">{proj.technologies}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300">Project Name *</label>
                <input
                  type="text"
                  value={customForm.project_name}
                  onChange={e => setCustomForm({ ...customForm, project_name: e.target.value })}
                  placeholder="e.g. Distributed Order Matching Engine"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Technologies Used *</label>
                  <input
                    type="text"
                    value={customForm.technologies}
                    onChange={e => setCustomForm({ ...customForm, technologies: e.target.value })}
                    placeholder="e.g. FastAPI, PostgreSQL, Redis, Docker"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Database Engine</label>
                  <input
                    type="text"
                    value={customForm.database}
                    onChange={e => setCustomForm({ ...customForm, database: e.target.value })}
                    placeholder="e.g. PostgreSQL / MongoDB"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Project Description & Architecture</label>
                <textarea
                  rows={3}
                  value={customForm.project_description}
                  onChange={e => setCustomForm({ ...customForm, project_description: e.target.value })}
                  placeholder="Describe the problem solved, architecture, and main modules..."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* 7 Rounds Preview */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">7-Round Viva Structure</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
              <span>1. Overview</span>
              <span>2. Technologies</span>
              <span>3. Architecture</span>
              <span>4. Implementation</span>
              <span>5. Trade-off "Why"</span>
              <span>6. Scale Challenges</span>
              <span className="col-span-2 text-purple-400 font-bold">7. Deep Cross-Questioning</span>
            </div>
          </div>

          <button
            onClick={handleStartDefense}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-extrabold text-sm text-white shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Initializing Defense Examiner...' : 'Start 7-Round Project Defense'}
          </button>
        </div>
      )}

      {/* ACTIVE DEFENSE VIVA INTERFACE */}
      {session && !finalScorecard && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Indicator */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black text-sm flex items-center justify-center">
                {currentRound}
              </span>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Round {currentRound} of 7</span>
                <h3 className="text-sm font-extrabold text-white">{currentRoundName}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map(r => (
                <div
                  key={r}
                  className={`h-2 rounded-full transition-all ${
                    r === currentRound ? 'w-8 bg-purple-500' :
                    r < currentRound ? 'w-4 bg-purple-500/40' : 'w-3 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Examiner Question Card */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Technical Examiner
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  "{currentQuestion}"
                </h2>
              </div>
              <button
                onClick={() => speakText(currentQuestion)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-white shrink-0 transition-colors"
                title="Listen to question"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Candidate Defense Form */}
          <form onSubmit={handleSubmitRoundAnswer} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300">Your Technical Defense / Explanation</label>
              <button
                type="button"
                onClick={handleSpeechToggle}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                {isRecording ? 'Listening...' : 'Voice Input'}
              </button>
            </div>

            <textarea
              rows={6}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Defend your architectural and code decisions clearly. Cite specific frameworks, data structures, and edge-case mitigations..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed resize-none"
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Examiner Analyzing...
                  </>
                ) : (
                  <>
                    Submit Round Response <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Past Rounds Accordion */}
          {historyRounds.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Previous Defense Rounds</h4>
              <div className="space-y-2">
                {historyRounds.map((hr, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-purple-400 font-bold">
                      <span>Round {hr.round_number}: {hr.round_name}</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-slate-300 font-medium">Q: {hr.question}</p>
                    <p className="text-slate-500 italic line-clamp-2">A: {hr.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FINAL SCORECARD & RECOMMENDATIONS */}
      {finalScorecard && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Score Banner */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-400 uppercase tracking-wider">
              Project Defense Scorecard
            </span>
            <div className="text-5xl font-black text-white">
              {finalScorecard.overall_score}<span className="text-2xl text-slate-400 font-bold">/100</span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Evaluation synthesized across 7 rigorous rounds covering architecture, implementation, trade-off defense, and scale bottlenecks.
            </p>
          </div>

          {/* 6 Dimension Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Technical Knowledge", score: finalScorecard.technical_knowledge },
              { label: "Project Understanding", score: finalScorecard.project_understanding },
              { label: "Architecture", score: finalScorecard.architecture_score },
              { label: "Implementation", score: finalScorecard.implementation_score },
              { label: "Problem Solving", score: finalScorecard.problem_solving_score },
              { label: "Communication", score: finalScorecard.communication_score }
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{p.label}</span>
                <div className={`text-xl font-black ${p.score >= 80 ? 'text-emerald-400' : p.score >= 60 ? 'text-purple-400' : 'text-amber-400'}`}>
                  {p.score}%
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Defense Strengths
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {finalScorecard.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Defense Weaknesses
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {finalScorecard.weaknesses?.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Practice */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" /> Recommended Practice
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {finalScorecard.recommended_practice?.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={resetSession}
              className="gradient-btn px-8 py-3 rounded-2xl text-xs font-bold"
            >
              Defend Another Project
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
