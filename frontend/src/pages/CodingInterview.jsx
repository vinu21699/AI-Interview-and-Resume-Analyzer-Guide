import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Code2, Play, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
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
        addToast('Failed to fetch coding challenges.', 'error');
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
        addToast('Execution passed all test cases.', 'success');
      } else {
        addToast('Runtime issue or failing test cases.', 'error');
      }
    } catch (err) {
      addToast('Execution failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Code2 className="w-3.5 h-3.5" />
          <span>Algorithmic Sandbox</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Coding interview sandbox</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Practice data structures and algorithmic problems. Test code against execution runners with AI complexity analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Selection & Prompt */}
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 lg:col-span-1 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Select challenge</label>
            <div className="space-y-1.5">
              {challenges.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChallenge(ch)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    selectedChallenge?.id === ch.id
                      ? 'bg-[#232325] border-white/20 text-white'
                      : 'bg-[#141415] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{ch.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#19191b] border border-white/[0.08] text-slate-300">
                      {ch.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedChallenge && (
            <div className="space-y-3 text-xs text-slate-300 border-t border-white/[0.06] pt-4">
              <h3 className="text-sm font-medium text-white">{selectedChallenge.title}</h3>
              <p className="leading-relaxed text-slate-400">{selectedChallenge.description}</p>
              
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-500 uppercase">Example</span>
                {selectedChallenge.examples?.map((ex, idx) => (
                  <div key={idx} className="bg-[#141415] p-2.5 rounded-md border border-white/[0.08] font-mono text-[11px] text-slate-300 space-y-0.5">
                    <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                    <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Editor & Output */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-[#141415] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs text-white focus:outline-none font-mono"
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
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Run code</span>
              </button>
            </div>

            <textarea
              rows={15}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-3.5 font-mono text-xs text-emerald-400 focus:outline-none focus:border-white/20 transition-colors leading-relaxed"
            />
          </div>

          {/* Test Case Results & AI Feedback */}
          {executionResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase flex items-center gap-1.5 ${executionResult.status === 'passed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {executionResult.status === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>Status: {executionResult.status}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">{executionResult.execution_time_ms} ms</span>
                </div>
                <pre className="bg-[#141415] p-3 rounded-lg border border-white/[0.08] font-mono text-xs text-slate-300 overflow-x-auto">
                  {executionResult.output}
                </pre>
              </div>

              {executionResult.ai_feedback && (
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
                  <h4 className="text-xs font-medium text-white uppercase tracking-wider font-mono">
                    Complexity & performance analysis
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{executionResult.ai_feedback}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
