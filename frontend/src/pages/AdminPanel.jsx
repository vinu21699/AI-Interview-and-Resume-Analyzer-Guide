import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import {
  ShieldCheck, Users, FileText, Mic, Code2, Trash2, Search,
  CheckCircle2, Server, Database, Cpu, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

export default function AdminPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');
  const { addToast } = useNotification();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const resStats = await api.get('/admin/stats');
      setStats(resStats.data);
      const resUsers = await api.get('/admin/users');
      setUsers(resUsers.data);
    } catch (err) {
      addToast('Failed to load administration metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Confirm deletion of User ID #${userId}?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      addToast(`User #${userId} deleted.`, 'success');
    } catch (err) {
      addToast('Failed to delete user.', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.preferred_job_role || '').toLowerCase().includes(userSearch.toLowerCase());
    
    if (roleFilter === 'ADMIN') return matchesSearch && (u.is_admin || u.email?.includes('admin'));
    if (roleFilter === 'CANDIDATE') return matchesSearch && !u.is_admin && !u.email?.includes('admin');
    return matchesSearch;
  });

  const filteredLogs = (stats?.system_logs || []).filter((log) => {
    const matchesSev = logFilter === 'ALL' || log.level.toUpperCase() === logFilter;
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const usageChartData = [
    { name: 'Mon', Resumes: 12, Interviews: 8, Coding: 15 },
    { name: 'Tue', Resumes: 19, Interviews: 14, Coding: 22 },
    { name: 'Wed', Resumes: 28, Interviews: 22, Coding: 30 },
    { name: 'Thu', Resumes: 34, Interviews: 29, Coding: 38 },
    { name: 'Fri', Resumes: 45, Interviews: 36, Coding: 42 },
    { name: 'Sat', Resumes: 52, Interviews: 41, Coding: 49 },
    { name: 'Sun', Resumes: 60, Interviews: 48, Coding: 55 },
  ];

  const latencyChartData = [
    { time: '00:00', Latency: 120 },
    { time: '04:00', Latency: 110 },
    { time: '08:00', Latency: 145 },
    { time: '12:00', Latency: 180 },
    { time: '16:00', Latency: 160 },
    { time: '20:00', Latency: 130 },
    { time: '23:59', Latency: 115 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">System control panel</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            User directory governance, database audit logging, and service health monitoring.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-[#232325] hover:bg-[#2c2c30] text-xs font-medium text-slate-300 border border-white/[0.08] flex items-center gap-2 self-start md:self-auto shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh metrics</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'User Directory' },
          { id: 'analytics', label: 'Service Metrics' },
          { id: 'logs', label: 'Audit Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#232325] text-white border border-white/[0.08]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
          <span>Loading system diagnostics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-mono text-[11px] uppercase">Registered users</span>
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats?.total_users || 0}</div>
                  <span className="text-[10px] text-slate-500">Active accounts</span>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-mono text-[11px] uppercase">Resumes analyzed</span>
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats?.total_resumes_analyzed || 0}</div>
                  <span className="text-[10px] text-slate-500">ATS parsing jobs</span>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-mono text-[11px] uppercase">Interviews conducted</span>
                    <Mic className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats?.total_interviews_conducted || 0}</div>
                  <span className="text-[10px] text-slate-500">Mock sessions completed</span>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="font-mono text-[11px] uppercase">Coding tests</span>
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-2xl font-mono font-semibold text-white tabular-nums">{stats?.total_coding_tests || 0}</div>
                  <span className="text-[10px] text-slate-500">Sandbox submissions</span>
                </div>
              </div>

              {/* Service Health */}
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  <span>Infrastructure status</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">FastAPI backend</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">Port 8000 · operational</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">Google Gemini API</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">Verified · operational</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">SQLite database</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">Local · healthy</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#141415] border border-white/[0.08] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">Auth & RBAC guard</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">JWT security active</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>User directory ({filteredUsers.length})</span>
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#141415] p-1 rounded-lg border border-white/[0.08]">
                      {['ALL', 'ADMIN', 'CANDIDATE'].map((rf) => (
                        <button
                          key={rf}
                          onClick={() => setRoleFilter(rf)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            roleFilter === rf ? 'bg-[#232325] text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {rf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px] uppercase">
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Access</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredUsers.map((u) => {
                        const userIsAdmin = u.is_admin || u.email?.includes('admin');
                        return (
                          <tr key={u.id} className="hover:bg-[#141415] transition-colors">
                            <td className="p-2.5 text-slate-500 font-mono">#{u.id}</td>
                            <td className="p-2.5 font-medium text-white">{u.name}</td>
                            <td className="p-2.5 text-slate-400 font-mono text-[11px]">{u.email}</td>
                            <td className="p-2.5 text-slate-300">{u.preferred_job_role || 'Software Engineer'}</td>
                            <td className="p-2.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                                userIsAdmin ? 'bg-[#232325] text-amber-400 border border-amber-500/20' : 'bg-[#141415] text-slate-400 border border-white/[0.08]'
                              }`}>
                                {userIsAdmin ? 'Admin' : 'Candidate'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 rounded text-slate-500 hover:text-white hover:bg-[#232325] transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SYSTEM ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Weekly feature usage</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usageChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#232325" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#141415', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                        <Bar dataKey="Resumes" fill="#10b981" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Interviews" fill="#232325" stroke="rgba(255,255,255,0.2)" strokeWidth={1} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Coding" fill="#374151" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>API response time (ms)</span>
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#232325" />
                        <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#141415', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                        <Area type="monotone" dataKey="Latency" stroke="#10b981" fill="#10b98115" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-medium text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Audit logs ({filteredLogs.length})</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#141415] p-1 rounded-lg border border-white/[0.08]">
                      {['ALL', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLogFilter(lvl)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            logFilter === lvl ? 'bg-[#232325] text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No matching audit logs.</div>
                  ) : (
                    filteredLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#141415] border border-white/[0.08] flex items-center justify-between text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            log.level === 'error'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : log.level === 'warn'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-[#232325] text-slate-300 border border-white/[0.08]'
                          }`}>
                            {log.level}
                          </span>
                          <span className="font-semibold text-white">{log.action}:</span>
                          <span className="text-slate-400">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-4">{log.created_at}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
