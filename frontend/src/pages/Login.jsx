import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    addToast(`Welcome back, ${userData.name}!`, 'success');
    if (userData.is_admin || userData.email?.includes('admin')) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      handleLoginSuccess(userData);
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickAdminLogin = async () => {
    setEmail('admin@antigravity.ai');
    setPassword('admin123');
    setLoading(true);
    try {
      const userData = await login('admin@antigravity.ai', 'admin123');
      handleLoginSuccess(userData);
    } catch (err) {
      addToast('Failed to log in with Admin credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickUserLogin = async () => {
    setEmail('user@antigravity.ai');
    setPassword('user123');
    setLoading(true);
    try {
      const userData = await login('user@antigravity.ai', 'user123');
      handleLoginSuccess(userData);
    } catch (err) {
      addToast('Failed to log in with Candidate credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 border border-slate-800 relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your AI Career Assistant account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

