import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0f0f10] py-4 px-6 text-xs text-[#85858b]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <p className="font-mono text-[11px]">NexHire AI • Placement readiness & engineering career verification</p>
        <div className="flex items-center gap-5 text-[11px]">
          <span className="hover:text-[#ededed] cursor-pointer transition-colors">Documentation</span>
          <span className="hover:text-[#ededed] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[#ededed] cursor-pointer transition-colors">Terms</span>
        </div>
      </div>
    </footer>
  );
}
