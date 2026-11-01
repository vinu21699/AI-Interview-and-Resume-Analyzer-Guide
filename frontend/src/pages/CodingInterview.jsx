import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Code2, Play, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CodingInterview() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const { addToast } = useNotification();

  useEffect(() => {
    api.get('/coding/challenges')
      .then((res) => {
        setChallenges(res.data);
        if (res.data.length > 0) {
          setSelectedChallenge(res.data[0]);
          setCode(res.data[0].starter_code[language] || '');
        }
      })
      .catch(() => {
        addToast('Failed to fetch coding challenges', 'error');
      });
  }, []);

  const handleSelectChallenge = (ch) => {
    setSelectedChallenge(ch);
    setCode(ch.starter_code[language] || '');
    setExecutionResult(null);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (selectedChallenge) {
      setCode(selectedChallenge.starter_code[newLang] || '');
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setExecutionResult(null);
    try {
      const res = await api.post('/coding/execute', {
        language,
        code,
        challenge_id: selectedChallenge?.id
      });
      setExecutionResult(res.data);
      if (res.data.status === 'passed') {
        addToast('Code passed test cases successfully!', 'success');
      } else {
        addToast('Runtime issue detected in code execution.', 'error');
      }
    } catch (err) {
      addToast('Execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <Code2 className="w-3.5 h-3.5" /> Algorithmic Sandbox
        </div>
        <h1 className="text-3xl font-extrabold text-white">Coding Interview Sandbox</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Solve LeetCode-style algorithmic challenges in Python, JavaScript, Java, or C++. Test code execution output and receive AI complexity analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Challenge Selection & Prompt */}
        <div className="glass-card p-6 border border-slate-800 lg:col-span-1 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Select Challenge</label>
            <div className="space-y-2">
              {challenges.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                    selectedChallenge?.id === ch.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span>{ch.title}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {ch.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedChallenge && (
            <div className="space-y-4 text-xs text-slate-300 border-t border-slate-800 pt-4">
              <h3 className="text-sm font-bold text-white">{selectedChallenge.title} Description</h3>
              <p className="leading-relaxed text-slate-400">{selectedChallenge.description}</p>
              
              <div>
                <strong className="block text-white mb-1">Example:</strong>
                {selectedChallenge.examples?.map((ex, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                    <div>Input: {ex.input}</div>
                    <div>Output: {ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Editor & Output */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Language:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (Node)</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <button
                onClick={handleRunCode}
                disabled={loading}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run Code
              </button>
            </div>

            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Test Case Results & AI Feedback */}
          {executionResult && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={`glass-card p-5 border ${executionResult.status === 'passed' ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/40 bg-rose-950/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase flex items-center gap-1.5 ${executionResult.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {executionResult.status === 'passed' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    Execution Status: {executionResult.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{executionResult.execution_time_ms} ms</span>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                  {executionResult.output}
                </pre>
              </div>

              <div className="glass-card p-5 border border-purple-500/30 bg-purple-950/20 space-y-2">
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Solution Analysis & Complexity Optimization
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{executionResult.ai_feedback}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
