import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ShieldAlert } from 'lucide-react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatch from './pages/JobMatch';
import MockInterview from './pages/MockInterview';
import CodingInterview from './pages/CodingInterview';
import CareerRoadmap from './pages/CareerRoadmap';
import LearningAssistant from './pages/LearningAssistant';
import ResumeBuilder from './pages/ResumeBuilder';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import LandingPage from './pages/LandingPage';
import ResumeClaimVerification from './pages/ResumeClaimVerification';
import ProjectDefense from './pages/ProjectDefense';
import CompanyPrep from './pages/CompanyPrep';

function AdminAccessGuard({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.is_admin || user?.email?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 bg-[#19191b] border border-white/[0.08] rounded-xl text-center space-y-4">
        <div className="w-10 h-10 rounded-lg bg-[#232325] border border-white/[0.08] text-amber-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Restricted access
          </span>
          <h2 className="text-base font-medium text-white">Administrator access required</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The Administration panel is restricted to system administrators. Your account (<span className="text-white font-mono">{user?.email || 'Candidate User'}</span>) is configured with candidate permissions.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium transition-colors">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141415] text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 border-t-transparent animate-spin"></span>
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141415] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-[#141415] min-h-[calc(100vh-56px)]">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume-claim-verification" element={<ResumeClaimVerification />} />
            <Route path="/project-defense" element={<ProjectDefense />} />
            <Route path="/company-prep" element={<CompanyPrep />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/job-match" element={<JobMatch />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/coding-interview" element={<CodingInterview />} />
            <Route path="/career-roadmap" element={<CareerRoadmap />} />
            <Route path="/learning-assistant" element={<LearningAssistant />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/admin"
              element={
                <AdminAccessGuard>
                  <AdminPanel />
                </AdminAccessGuard>
              }
            />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
