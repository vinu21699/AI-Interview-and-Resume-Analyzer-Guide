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

function AdminAccessGuard({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.is_admin || user?.email?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="p-12 max-w-3xl mx-auto my-12 glass-card border border-rose-500/30 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
            Access Denied • 403 Forbidden
          </span>
          <h2 className="text-2xl font-extrabold text-white">Administrator Access Required</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            The System Administration Portal is restricted to platform administrators. Your account (<strong className="text-white">{user?.email || 'Candidate User'}</strong>) is configured as a Candidate Workspace user.
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link to="/dashboard" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
            Return to Candidate Dashboard
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></span>
          Loading Session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-slate-950 min-h-[calc(100vh-61px)]">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
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

