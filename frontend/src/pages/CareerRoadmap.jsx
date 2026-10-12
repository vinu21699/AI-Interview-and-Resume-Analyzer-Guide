import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Map, CheckCircle2, Award, Briefcase, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const getDefaultRoadmap = (role = 'Software Engineer') => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('data') || roleLower.includes('machine') || roleLower.includes('ai')) {
    return {
      target_role: role,
      timeline: [
        { phase: 'Month 1', title: 'Advanced Python, SQL & Exploratory Data Analysis', status: 'completed' },
        { phase: 'Month 2', title: 'Statistical Modeling & Feature Engineering', status: 'in_progress' },
        { phase: 'Month 3', title: 'Machine Learning Algorithms & Model Evaluation', status: 'upcoming' },
        { phase: 'Month 4', title: 'MLOps, Model Deployment & Portfolio Launch', status: 'upcoming' }
      ],
      weekly_goals: [
        { week: 'Week 1', task: 'Master complex SQL window functions & data aggregation', completed: true },
        { week: 'Week 2', task: 'Clean raw datasets & conduct EDA using Pandas & Seaborn', completed: true },
        { week: 'Week 3', task: 'Train baseline regression & classification models in Scikit-Learn', completed: false },
        { week: 'Week 4', task: 'Deploy predictive ML model API using FastAPI & Docker', completed: false }
      ],
      recommended_certifications: [
        'Google Professional Data Engineer',
        'AWS Certified Data Analytics – Specialty',
        'IBM Data Science Professional Certificate'
      ],
      recommended_projects: [
        { title: 'Customer Churn Prediction Engine', desc: 'Build end-to-end ML pipeline with XGBoost, SHAP explainability, and interactive dashboard.' },
        { title: 'Automated Financial Time Series Forecasting', desc: 'Develop ARIMA and Prophet forecasting model for stock & sales trend predictions.' },
        { title: 'Real-time NLP Sentiment Analyzer', desc: 'Fine-tune BERT transformer model for customer review sentiment classification.' }
      ]
    };
  }

  if (roleLower.includes('frontend') || roleLower.includes('ui') || roleLower.includes('react')) {
    return {
      target_role: role,
      timeline: [
        { phase: 'Month 1', title: 'Modern JavaScript (ES6+), React & Component Architecture', status: 'completed' },
        { phase: 'Month 2', title: 'TypeScript, State Management & Tailwind CSS', status: 'in_progress' },
        { phase: 'Month 3', title: 'Web Performance, Accessibility (a11y) & Testing', status: 'upcoming' },
        { phase: 'Month 4', title: 'Micro-frontends, Next.js & Production Deployment', status: 'upcoming' }
      ],
      weekly_goals: [
        { week: 'Week 1', task: 'Master React Hooks (useMemo, useCallback, useRef) & custom hooks', completed: true },
        { week: 'Week 2', task: 'Refactor JS codebase to strict TypeScript interfaces & types', completed: true },
        { week: 'Week 3', task: 'Optimize Lighthouse Web Vitals (LCP, INP, CLS) score above 90', completed: false },
        { week: 'Week 4', task: 'Write end-to-end UI automation tests using Playwright / Cypress', completed: false }
      ],
      recommended_certifications: [
        'Meta Front-End Developer Professional Certificate',
        'OpenJS Node.js Application Developer (JSNAD)',
        'AWS Certified Developer – Associate'
      ],
      recommended_projects: [
        { title: 'SaaS Dashboard with Glassmorphism System', desc: 'Design responsive real-time analytics UI using React, Tailwind, and Recharts.' },
        { title: 'E-Commerce Web App with Next.js & Stripe', desc: 'Build server-side rendered application with cart management and payment gateway.' },
        { title: 'Interactive Collaborative Whiteboard App', desc: 'Implement WebSockets and HTML5 Canvas for multi-user live editing.' }
      ]
    };
  }

  return {
    target_role: role,
    timeline: [
      { phase: 'Month 1', title: 'Core Foundations & Modern Web Frameworks', status: 'completed' },
      { phase: 'Month 2', title: 'Backend Engineering & Microservices Architecture', status: 'in_progress' },
      { phase: 'Month 3', title: 'DevOps, Containers & Cloud Deployment', status: 'upcoming' },
      { phase: 'Month 4', title: 'System Design, AI Mock Interviews & Portfolio Launch', status: 'upcoming' }
    ],
    weekly_goals: [
      { week: 'Week 1', task: 'Master RESTful API principles & OpenAPI documentation specs', completed: true },
      { week: 'Week 2', task: 'Implement JWT authentication & RBAC authorization middleware', completed: true },
      { week: 'Week 3', task: 'Set up multi-container Docker Compose & Redis caching layer', completed: false },
      { week: 'Week 4', task: 'Conduct 3 AI Mock Technical Interviews & publish GitHub portfolio', completed: false }
    ],
    recommended_certifications: [
      'AWS Certified Solutions Architect – Associate',
      'Docker Certified Associate (DCA)',
      'CKAD: Certified Kubernetes Application Developer'
    ],
    recommended_projects: [
      { title: 'Scalable E-Commerce Backend', desc: 'Build microservices architecture using FastAPI, Redis caching, and PostgreSQL.' },
      { title: 'Real-Time Streaming Pipeline', desc: 'Implement WebSockets and Docker containerized data processing engine.' },
      { title: 'AI-Powered Career & Interview Platform', desc: 'Integrate GenAI LLM API with automated CI/CD deployment flow.' }
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
        // Fall back gracefully to role-adapted roadmap
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
          addToast(`Generated fresh AI roadmap for ${currentRole}!`, 'success');
        }
      })
      .catch(() => {
        setRoadmap(getDefaultRoadmap(currentRole));
        addToast(`Updated career roadmap for ${currentRole}`, 'info');
      })
      .finally(() => setGenerating(false));
  };

  const toggleGoal = (index) => {
    if (!roadmap || !roadmap.weekly_goals) return;
    const updatedGoals = [...roadmap.weekly_goals];
    updatedGoals[index].completed = !updatedGoals[index].completed;
    setRoadmap({ ...roadmap, weekly_goals: updatedGoals });
    addToast('Milestone goal status updated!', 'success');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <Map className="w-3.5 h-3.5" /> Personalized Career Timeline
          </div>
          <h1 className="text-3xl font-extrabold text-white">Career Acceleration Roadmap</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Custom step-by-step career milestones, weekly actionable goals, recommended industry certifications, and high-impact portfolio projects for <strong className="text-white">{currentRole}</strong>.
          </p>
        </div>

        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="gradient-btn px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 self-start md:self-auto shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating AI Roadmap...' : 'Generate New AI Roadmap'}
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 flex items-center justify-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          Loading personalized roadmap...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Milestone Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roadmap.timeline?.map((phase, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass-card p-5 border relative ${
                  phase.status === 'completed'
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : phase.status === 'in_progress'
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{phase.phase}</span>
                <h4 className="text-sm font-bold text-white mt-1 leading-snug">{phase.title}</h4>
                <div className="mt-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    phase.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30'
                      : phase.status === 'in_progress'
                      ? 'bg-blue-500/20 text-blue-900 dark:text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                  }`}>
                    {(phase.status || 'upcoming').replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Checklist Goals */}
            <div className="glass-card p-6 border border-slate-800 lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Actionable Weekly Micro-Goals
              </h3>
              <div className="space-y-3">
                {roadmap.weekly_goals?.map((goal, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleGoal(idx)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      goal.completed
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        goal.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                      }`}>
                        {goal.completed && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-400 block">{goal.week}</span>
                        <span className={`text-sm font-semibold ${goal.completed ? 'line-through opacity-90' : ''}`}>
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
              <div className="glass-card p-6 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Recommended Certifications
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {roadmap.recommended_certifications?.map((cert, idx) => (
                    <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Projects */}
              <div className="glass-card p-6 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" /> High-Impact Projects
                </h3>
                <div className="space-y-3">
                  {roadmap.recommended_projects?.map((proj, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <h4 className="text-xs font-bold text-blue-300">{proj.title}</h4>
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

