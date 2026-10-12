import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Award, Activity, FileCheck, ArrowRight, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import api from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/resume/my-stats')
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        setStats({ total_resumes: 0, trajectory: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const totalResumes = stats?.total_resumes || 0;

  const categoryScoreData = stats ? [
    { name: 'ATS Keywords', score: stats.keywords_score || 0 },
    { name: 'Formatting', score: stats.formatting_score || 0 },
    { name: 'Technical Skills', score: stats.skills_score || 0 },
    { name: 'Experience', score: stats.experience_score || 0 },
    { name: 'Projects', score: stats.projects_score || 0 },
    { name: 'Education', score: stats.education_score || 0 },
  ] : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
          <BarChart3 className="w-3.5 h-3.5" /> Personalized Candidate Analytics
        </div>
        <h1 className="text-3xl font-extrabold text-white">Comprehensive Career Analytics</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Real-time tracking of your ATS score trajectory, formatting performance, and technical proficiency derived directly from your uploaded resumes.
        </p>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 flex items-center justify-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
          Loading your personal analytics...
        </div>
      ) : totalResumes === 0 ? (
        /* Empty State for New Users */
        <div className="glass-card p-12 text-center border border-slate-800 space-y-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
            <FileCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Analytics Data Yet</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              You haven't uploaded any resumes yet! Upload your resume in the <strong>Resume Analyzer</strong> to automatically generate your ATS score progression, formatting evaluation, and technical skill matrix.
            </p>
          </div>
          <Link
            to="/resume-analyzer"
            className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" /> Upload Your First Resume <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Dynamic Real Analytics for Existing Uploads */
        <div className="space-y-8">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card p-5 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Uploaded Resumes</span>
              <div className="text-3xl font-extrabold text-white">{stats.total_resumes}</div>
              <span className="text-[11px] text-blue-400 font-medium">Recorded in Database</span>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Latest ATS Score</span>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.latest_ats_score}%</div>
              <span className="text-[11px] text-emerald-400 font-medium">From Latest Resume Upload</span>
            </div>

            <div className="glass-card p-5 border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Average ATS Score</span>
              <div className="text-3xl font-extrabold text-purple-400">{stats.avg_ats_score}%</div>
              <span className="text-[11px] text-purple-400 font-medium">Across All Resumes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Real ATS Line Chart */}
            <div className="glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> ATS Resume Score Trajectory
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Performance Bar Chart */}
            <div className="glass-card p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" /> Resume Component Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="score" fill="#a855f7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Employability Metric Overview */}
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Latest Resume Evaluation Scores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Formatting Score</span>
                <strong className="text-emerald-400 text-sm">{stats.formatting_score}/100</strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>ATS Keyword Score</span>
                <strong className="text-blue-400 text-sm">{stats.keywords_score}/100</strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span>Technical Skills Score</span>
                <strong className="text-purple-400 text-sm">{stats.skills_score}/100</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

