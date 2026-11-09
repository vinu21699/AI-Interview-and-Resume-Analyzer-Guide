import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Briefcase, GraduationCap, Save, RefreshCw } from 'lucide-react';

export default function UserProfile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [education, setEducation] = useState(user?.education || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [role, setRole] = useState(user?.preferred_job_role || 'Software Engineer');
  const [loading, setLoading] = useState(false);

  const { addToast } = useNotification();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({
        name,
        education,
        experience,
        skills,
        preferred_job_role: role
      });
      addToast('Profile saved successfully.', 'success');
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <User className="w-3.5 h-3.5" />
          <span>Candidate Preferences</span>
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">User profile</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Configure your target role, academic credentials, and primary technical competencies.
        </p>
      </div>

      <div className="bg-[#19191b] border border-white/[0.08] rounded-xl p-5 sm:p-6 space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Full name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Target role</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Education</label>
            <div className="relative">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="B.S. in Computer Science"
                className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Experience overview</label>
            <textarea
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Brief summary of past engineering experience..."
              className="w-full bg-[#141415] border border-white/[0.08] rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400">Primary skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, React, FastAPI, SQL, AWS, Docker"
              className="w-full bg-[#141415] border border-white/[0.08] rounded-lg py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-graphite-950 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
