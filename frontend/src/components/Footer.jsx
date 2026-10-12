import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/40 py-6 px-8 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <p>© 2026 AI Interview Analyzer & Career Assistant. Built for production excellence.</p>
        <div className="flex items-center gap-6 text-slate-400">
          <span className="hover:text-blue-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-blue-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-blue-400 cursor-pointer">API Documentation</span>
        </div>
      </div>
    </footer>
  );
}
