import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { speakText, createSpeechRecognition } from '../services/speechService';
import {
  ShieldAlert, RefreshCw, Mic, Volume2, ArrowRight,
  Layers, Check
} from 'lucide-react';

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
      addToast('Defense session started. Examiner is ready.', 'info');
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

      setHistoryRounds(prev => [...prev, {
        round_number: currentRound,
        round_name: currentRoundName,
        question: currentQuestion,
        answer: userAnswer
      }]);

      setUserAnswer('');

      if (res.data.is_finished) {
        setFinalScorecard(res.data.evaluation);
        addToast('Project defense completed. Evaluation generated.', 'success');
      } else {
        setCurrentRound(res.data.current_round);
        setCurrentRoundName(res.data.round_name);
        setCurrentQuestion(res.data.question);
        speakText(res.data.question);
        addToast(`Round ${res.data.current_round}: ${res.data.round_name}`, 'info');
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
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#85858b]">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Technical viva examination</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[#ededed]">
            Project defense viva mode
          </h1>
          <p className="text-xs text-[#a1a1a6] max-w-xl leading-relaxed">
            7-round technical viva. The examiner evaluates your system architecture, technology choices, trade-offs, and dynamically cross-examines you based on previous answers.
          </p>
        </div>

        {session && (
          <button
            onClick={resetSession}
            className="btn-secondary text-xs py-1.5 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start another defense
          </button>
        )}
      </div>

      {/* Setup: Project Selection */}
      {!session && !finalScorecard && (
        <div className="max-w-2xl mx-auto bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm font-medium text-[#ededed]">Select project for defense</h2>
              <p className="text-xs text-[#85858b]">Choose from your parsed resume or enter manually</p>
            </div>
            <div className="flex rounded-lg bg-[#232325] p-0.5 border border-white/[0.08] text-xs">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  !isCustom ? 'bg-[#19191b] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Resume projects
              </button>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  isCustom ? 'bg-[#19191b] text-[#ededed]' : 'text-[#85858b] hover:text-[#ededed]'
                }`}
              >
                Manual entry
              </button>
            </div>
          </div>

          {!isCustom ? (
            <div className="space-y-3">
              {loadingProjects ? (
                <div className="p-8 text-center text-xs text-[#85858b] font-mono">Reading projects from resume...</div>
              ) : projects.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-xs text-[#85858b]">No projects found in resume. Switch to manual entry.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {projects.map((proj, idx) => {
                    const isSelected = selectedProject?.project_name === proj.project_name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedProject(proj)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#232325] border-white/[0.2]'
                            : 'bg-[#232325]/50 border-white/[0.08] hover:border-white/[0.16]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-[#ededed] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-purple-400" /> {proj.project_name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#85858b] px-1.5 py-0.5 rounded bg-[#19191b]">
                            {proj.role || 'Full Stack'}
                          </span>
                        </div>
                        <p className="text-xs text-[#a1a1a6] mt-1 line-clamp-2 leading-relaxed">{proj.description}</p>
                        <div className="mt-1.5 text-[11px] font-mono text-[#85858b]">
                          Stack: <span className="text-[#a1a1a6]">{proj.technologies}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#85858b] block font-mono">Project name</label>
                <input
                  type="text"
                  value={customForm.project_name}
                  onChange={e => setCustomForm({ ...customForm, project_name: e.target.value })}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full mt-1 bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#85858b] block font-mono">Technologies</label>
                  <input
                    type="text"
                    value={customForm.technologies}
                    onChange={e => setCustomForm({ ...customForm, technologies: e.target.value })}
                    placeholder="e.g. FastAPI, PostgreSQL, Redis"
                    className="w-full mt-1 bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#85858b] block font-mono">Database</label>
                  <input
                    type="text"
                    value={customForm.database}
                    onChange={e => setCustomForm({ ...customForm, database: e.target.value })}
                    placeholder="e.g. PostgreSQL"
                    className="w-full mt-1 bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#85858b] block font-mono">Description & architecture</label>
                <textarea
                  rows={3}
                  value={customForm.project_description}
                  onChange={e => setCustomForm({ ...customForm, project_description: e.target.value })}
                  placeholder="Describe the system architecture, data flow, and key components..."
                  className="w-full mt-1 bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-2.5 text-xs text-[#ededed] focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
            <span className="text-[10px] font-mono text-[#85858b] uppercase">7-round viva progression</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] font-mono text-[#a1a1a6]">
              <span>1. Overview</span>
              <span>2. Technology</span>
              <span>3. Architecture</span>
              <span>4. Implementation</span>
              <span>5. Trade-off why</span>
              <span>6. Scale challenges</span>
              <span className="col-span-2 text-purple-400">7. Cross-examination</span>
            </div>
          </div>

          <button
            onClick={handleStartDefense}
            disabled={submitting}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
          >
            {submitting ? 'Initializing examiner...' : 'Start 7-round project defense'}
          </button>
        </div>
      )}

      {/* Active Viva Terminal */}
      {session && !finalScorecard && (
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-3.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-[#232325] border border-white/[0.08] flex items-center justify-center text-xs text-[#ededed]">
                {currentRound}
              </span>
              <div>
                <span className="text-[10px] text-[#85858b] uppercase">Round {currentRound} of 7</span>
                <h3 className="text-xs font-medium text-[#ededed]">{currentRoundName}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map(r => (
                <div
                  key={r}
                  className={`h-1.5 rounded transition-colors ${
                    r === currentRound ? 'w-5 bg-purple-400' :
                    r < currentRound ? 'w-3 bg-purple-400/40' : 'w-2 bg-[#232325]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Examiner Question */}
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase">
                  Technical examiner question
                </span>
                <h2 className="text-sm font-medium text-[#ededed] leading-relaxed">
                  "{currentQuestion}"
                </h2>
              </div>
              <button
                onClick={() => speakText(currentQuestion)}
                className="p-1.5 rounded bg-[#232325] hover:bg-[#2b2b2f] text-[#85858b] hover:text-[#ededed] shrink-0"
                title="Listen"
              >
                <Volume2 className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>

          {/* Candidate Defense Box */}
          <form onSubmit={handleSubmitRoundAnswer} className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#85858b]">
              <span>Your technical defense</span>
              <button
                type="button"
                onClick={handleSpeechToggle}
                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                  isRecording ? 'bg-rose-500 text-[#0f0f10]' : 'bg-[#232325] text-[#a1a1a6] hover:text-[#ededed]'
                }`}
              >
                <Mic className="w-3 h-3 text-purple-400" />
                {isRecording ? 'Listening...' : 'Voice input'}
              </button>
            </div>

            <textarea
              rows={5}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Defend your architectural decisions, data flow, and trade-off rationales clearly..."
              className="w-full bg-[#232325] border border-white/[0.08] focus:border-white/[0.2] rounded-lg p-3 text-xs text-[#ededed] placeholder-[#85858b] focus:outline-none leading-relaxed resize-none"
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                {submitting ? 'Analyzing...' : 'Submit response'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* History */}
          {historyRounds.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-[11px] font-mono uppercase text-[#85858b]">Previous rounds ({historyRounds.length})</h4>
              <div className="space-y-2">
                {historyRounds.map((hr, idx) => (
                  <div key={idx} className="bg-[#19191b] border border-white/[0.08] p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
                      <span>Round {hr.round_number}: {hr.round_name}</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-[#ededed] font-medium text-xs">Q: {hr.question}</p>
                    <p className="text-[#85858b] text-[11px] line-clamp-2">A: {hr.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Scorecard */}
      {finalScorecard && (
        <div className="max-w-3xl mx-auto bg-[#19191b] border border-white/[0.08] rounded-xl p-6 space-y-6">
          <div className="bg-[#232325] border border-white/[0.08] rounded-lg p-6 text-center space-y-2">
            <span className="text-xs font-mono text-[#85858b] uppercase">Project defense score</span>
            <div className="text-4xl font-mono text-[#ededed] font-medium tabular-nums">
              {finalScorecard.overall_score} / 100
            </div>
            <p className="text-xs text-[#a1a1a6]">Technical examination completed across all 7 rounds.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Technical knowledge", score: finalScorecard.technical_knowledge },
              { label: "Project understanding", score: finalScorecard.project_understanding },
              { label: "Architecture", score: finalScorecard.architecture },
              { label: "Implementation", score: finalScorecard.implementation },
              { label: "Problem solving", score: finalScorecard.problem_solving },
              { label: "Communication", score: finalScorecard.communication }
            ].map((s, idx) => (
              <div key={idx} className="bg-[#232325] border border-white/[0.08] p-3 rounded-lg text-center space-y-0.5">
                <span className="text-[10px] text-[#85858b] block font-mono">{s.label}</span>
                <div className="text-base font-mono text-[#ededed] font-medium tabular-nums">
                  {s.score}%
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono text-emerald-400">Strengths</span>
              <ul className="space-y-1 text-[#a1a1a6]">
                {finalScorecard.strengths?.map((st, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span> {st}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono text-rose-400">Areas for improvement</span>
              <ul className="space-y-1 text-[#a1a1a6]">
                {finalScorecard.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span> {wk}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#232325] border border-white/[0.08] space-y-1">
            <span className="text-[11px] font-mono text-[#ededed]">Recommended practice</span>
            <ul className="space-y-1 text-xs text-[#a1a1a6]">
              {finalScorecard.recommended_practice?.map((rec, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-emerald-400">→</span> {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={resetSession}
              className="btn-primary text-xs"
            >
              Start new defense
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
