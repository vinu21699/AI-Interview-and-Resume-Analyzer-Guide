import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Map, CheckCircle2, Award, Briefcase, Calendar, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const getDefaultRoadmap = (role = 'Software Engineer') => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('data') || roleLower.includes('machine') || roleLower.includes('ai')) {
    return {
      target_role: role,
      timeline: [
        { phase: 'Month 1', title: 'Python, SQL & Exploratory Data Analysis', status: 'completed' },
        { phase: 'Month 2', title: 'Statistical Modeling & Feature Engineering', status: 'in_progress' },
        { phase: 'Month 3', title: 'Machine Learning Algorithms & Evaluation', status: 'upcoming' },
        { phase: 'Month 4', title: 'Model Deployment & Portfolio Systems', status: 'upcoming' }
      ],
      weekly_goals: [
        { week: 'Week 1', task: 'Master complex SQL window functions & aggregation', completed: true },
        { week: 'Week 2', task: 'Clean raw datasets & conduct EDA using Pandas', completed: true },
        { week: 'Week 3', task: 'Train baseline models in Scikit-Learn', completed: false },
        { week: 'Week 4', task: 'Deploy predictive ML API using FastAPI & Docker', completed: false }
      ],
      recommended_certifications: [
        'Google Professional Data Engineer',
        'AWS Certified Data Analytics – Specialty',
        'IBM Data Science Professional Certificate'
      ],
      recommended_projects: [
        { title: 'Customer Churn Prediction Engine', desc: 'Build ML pipeline with XGBoost, SHAP explainability, and interactive dashboard.' },
        { title: 'Automated Financial Time Series Forecasting', desc: 'Develop ARIMA and Prophet forecasting model for trend predictions.' },
        { title: 'Real-time NLP Sentiment Analyzer', desc: 'Fine-tune BERT transformer model for review classification.' }
      ]
    };
  }

  if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
    return {
      target_role: role,
      timeline: [
        { phase: 'Month 1', title: 'Modern JavaScript (ES6+), React Architecture', status: 'completed' },
        { phase: 'Month 2', title: 'TypeScript, State Management & Design Systems', status: 'in_progress' },
        { phase: 'Month 3', title: 'Web Performance, Accessibility (a11y) & Testing', status: 'upcoming' },
        { phase: 'Month 4', title: 'Next.js & Production Deployment', status: 'upcoming' }
      ],
      weekly_goals: [
        { week: 'Week 1', task: 'Master React Hooks & custom hooks patterns', completed: true },
        { week: 'Week 2', task: 'Refactor codebase to strict TypeScript interfaces', completed: true },
        { week: 'Week 3', task: 'Optimize Core Web Vitals (LCP, INP, CLS)', completed: false },
        { week: 'Week 4', task: 'Write component integration tests using Vitest & Testing Library', completed: false }
      ],
      recommended_certifications: [
        'Meta Front-End Developer Professional Certificate',
        'OpenJS Node.js Application Developer (JSNAD)',
        'AWS Certified Developer – Associate'
      ],
      recommended_projects: [
        { title: 'Analytics Dashboard System', desc: 'Responsive analytics UI with high data density, keyboard shortcuts, and Recharts.' },
        { title: 'Full-Stack Application with Next.js', desc: 'Server-side rendered application with session auth and stripe integration.' },
        { title: 'Interactive Collaborative Canvas', desc: 'WebSockets and HTML5 Canvas for multi-user live editing.' }
      ]
    };
  }

  return {
    target_role: role,
    timeline: [
      { phase: 'Month 1', title: 'Core Foundations & API Design', status: 'completed' },
      { phase: 'Month 2', title: 'Backend Engineering & Microservices', status: 'in_progress' },
      { phase: 'Month 3', title: 'DevOps, Containers & Cloud Deployment', status: 'upcoming' },
      { phase: 'Month 4', title: 'System Design & Portfolio Launch', status: 'upcoming' }
    ],
    weekly_goals: [
      { week: 'Week 1', task: 'Master RESTful API principles & OpenAPI documentation', completed: true },
      { week: 'Week 2', task: 'Implement JWT authentication & RBAC middleware', completed: true },
      { week: 'Week 3', task: 'Set up multi-container Docker Compose & Redis caching', completed: false },
      { week: 'Week 4', task: 'Complete mock technical interviews & publish portfolio', completed: false }
    ],
    recommended_certifications: [
      'AWS Certified Solutions Architect – Associate',
      'Docker Certified Associate (DCA)',
      'Certified Kubernetes Application Developer (CKAD)'
    ],
    recommended_projects: [
      { title: 'Scalable Backend Service', desc: 'Microservices architecture with FastAPI, Redis caching, and PostgreSQL.' },
      { title: 'Real-Time Streaming Pipeline', desc: 'WebSockets and Docker containerized data processing engine.' },
      { title: 'AI Placement & Career Platform', desc: 'LLM integration with automated CI/CD deployment flow.' }
    ]
  };
};

export default function CareerRoadmap() {
  const { user } = useAuth();
  const currentRole = user?.preferred_job_role || 'Software Engineer';
  const [roadmap, setRoadmap] = useState(() => getDefaultRoadmap(currentRole));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { addToast } = useNotification();

  useEffect(() => {
    fetchRoadmap();
  }, [currentRole]);

  const fetchRoadmap = () => {
    setLoading(true);
    api.get('/roadmap/latest')
      .then((res) => {
        if (res.data && res.data.timeline && res.data.timeline.length > 0) {
          setRoadmap(res.data);
        } else {
          setRoadmap(getDefaultRoadmap(currentRole));
        }
      })
      .catch(() => {
        setRoadmap(getDefaultRoadmap(currentRole));
      })
      .finally(() => setLoading(false));
  };

  const handleGenerateNew = () => {
    setGenerating(true);
    api.get(`/roadmap/generate?target_role=${encodeURIComponent(currentRole)}`)
      .then((res) => {
        if (res.data) {
          setRoadmap(res.data);
          addToast(`Roadmap generated for ${currentRole}.`, 'success');
        }
      })
      .catch(() => {
        setRoadmap(getDefaultRoadmap(currentRole));
        addToast(`Roadmap loaded for ${currentRole}.`, 'info');
      })
      .finally(() => setGenerating(false));
  };

  const toggleGoal = (index) => {
    if (!roadmap || !roadmap.weekly_goals) return;
    const updatedGoals = [...roadmap.weekly_goals];
    updatedGoals[index].completed = !updatedGoals[index].completed;
    setRoadmap({ ...roadmap, weekly_goals: updatedGoals });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Map className="w-3.5 h-3.5" />
            <span>Target Role Timeline</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Career acceleration roadmap</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Phased milestones, weekly checkpoints, and project recommendations tailored to <span className="text-white font-medium">{currentRole}</span>.
          </p>
        </div>

        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="px-3.5 py-2 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-slate-200 text-xs font-medium border border-white/[0.08] flex items-center gap-2 self-start md:self-auto shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Regenerating...' : 'Regenerate roadmap'}</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          <span>Loading roadmap...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Milestone Timeline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.timeline?.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-[#19191b] border rounded-xl p-4 space-y-2.5 ${
                  phase.status === 'completed'
                    ? 'border-emerald-500/30'
                    : phase.status === 'in_progress'
                    ? 'border-white/20'
                    : 'border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">{phase.phase}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    phase.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : phase.status === 'in_progress'
                      ? 'bg-[#232325] text-white border border-white/[0.08]'
                      : 'bg-[#141415] text-slate-500 border border-white/[0.06]'
                  }`}>
                    {(phase.status || 'upcoming').replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-medium text-white leading-snug">{phase.title}</h4>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Checklist Goals */}
            <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Weekly action goals</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500">Click to toggle status</span>
              </div>

              <div className="space-y-2">
                {roadmap.weekly_goals?.map((goal, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleGoal(idx)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      goal.completed
                        ? 'bg-[#141415] border-white/[0.08] text-slate-400'
                        : 'bg-[#141415] border-white/[0.08] hover:border-white/20 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        goal.completed ? 'bg-emerald-500 border-emerald-500 text-graphite-950' : 'border-white/20'
                      }`}>
                        {goal.completed && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">{goal.week}</span>
                        <span className={`text-xs ${goal.completed ? 'line-through opacity-70' : 'font-medium'}`}>
                          {goal.task}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications & Recommended Projects */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target certifications</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {roadmap.recommended_certifications?.map((cert, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center gap-2">
                      <span className="text-emerald-400 font-mono">·</span>
                      <span className="text-xs">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Projects */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recommended projects</span>
                </h3>
                <div className="space-y-2">
                  {roadmap.recommended_projects?.map((proj, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1">
                      <h4 className="text-xs font-medium text-white">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
