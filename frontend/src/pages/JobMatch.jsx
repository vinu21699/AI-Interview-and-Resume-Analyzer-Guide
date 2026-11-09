import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Briefcase, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JobMatch() {
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useNotification();

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      addToast('Paste a job description to compare.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/resume/job-match', {
        job_title: jobTitle,
        job_description: jobDescription
      });
      setResult(res.data);
      addToast('Job match analysis complete.', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Job matching failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Role Alignment</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Job description matcher</h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Compare your parsed resume against a target role description to detect keyword gaps and requirements alignment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 lg:col-span-1 space-y-4">
          <form onSubmit={handleMatch} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">Target role title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-[#141415] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400">Job description text</label>
              <textarea
                rows={11}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste role requirements, tech stack, and responsibilities..."
                className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-white/20 transition-colors leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <span>Calculate match score</span>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Score Box */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">Alignment</span>
                  <h3 className="text-base font-medium text-white">{result.job_title || jobTitle}</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-semibold text-emerald-400 tabular-nums">
                    {result.match_percentage}%
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500">match rate</span>
                </div>
              </div>

              {/* Missing Skills & Tech */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing technologies</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_technologies?.map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#232325] border border-white/[0.08] text-xs font-mono text-slate-300">
                        {tech}
                      </span>
                    ))}
                    {(!result.missing_technologies || result.missing_technologies.length === 0) && (
                      <span className="text-xs text-slate-500 italic">No missing core technologies found.</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Missing keywords</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_keywords?.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-[#232325] border border-white/[0.08] text-xs font-mono text-slate-300">
                        {kw}
                      </span>
                    ))}
                    {(!result.missing_keywords || result.missing_keywords.length === 0) && (
                      <span className="text-xs text-slate-500 italic">All expected keywords matched.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gaps Analysis */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-medium text-white uppercase tracking-wider">Gap analysis</h4>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-400 font-mono text-[11px] block mb-1">Experience alignment</span>
                    <p className="leading-relaxed">{result.experience_gap}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08]">
                    <span className="text-slate-400 font-mono text-[11px] block mb-1">Education alignment</span>
                    <p className="leading-relaxed">{result.education_gap}</p>
                  </div>
                </div>
              </div>

              {/* Tailoring Recommendations */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tailoring suggestions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.tailoring_recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400">·</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-12 text-center text-slate-500 text-xs">
              Paste a target job description and run analysis to inspect keyword alignment and missing competencies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
