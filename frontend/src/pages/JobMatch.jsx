import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Briefcase, Sparkles, AlertCircle, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
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
      addToast('Please paste a job description to compare.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/resume/job-match', {
        job_title: jobTitle,
        job_description: jobDescription
      });
      setResult(res.data);
      addToast('Job description match analysis complete!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Job matching failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <Sparkles className="w-3.5 h-3.5" /> AI Target Matcher
        </div>
        <h1 className="text-3xl font-extrabold text-white">Job Description Matcher</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Paste the job description of your dream role to evaluate match percentage, identify skill gaps, and get tailored recommendations to pass ATS filtering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-card p-6 border border-slate-800 lg:col-span-1 space-y-4">
          <form onSubmit={handleMatch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Paste Job Description</label>
              <textarea
                rows={10}
                required
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste requirements, responsibilities, tech stack, and qualifications from the job posting..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Matching...' : 'Calculate Job Match %'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score Box */}
              <div className="glass-card p-6 border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">ALIGNMENT INDEX</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{result.job_title || jobTitle}</h3>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold gradient-text">{result.match_percentage}%</span>
                  <span className="block text-[11px] text-slate-400">Match Accuracy</span>
                </div>
              </div>

              {/* Missing Skills & Tech */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card p-5 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missing Key Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_technologies?.map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missing Soft Skills & Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords?.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-xs text-amber-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gaps Analysis */}
              <div className="glass-card p-6 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Experience & Education Gap Analysis</h4>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-blue-400 block mb-1">Experience Alignment:</strong>
                    {result.experience_gap}
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-purple-400 block mb-1">Education Alignment:</strong>
                    {result.education_gap}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tailoring Recommendations
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Briefcase className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No Job Description Analyzed Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Paste a target job posting on the left panel to calculate your match score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
