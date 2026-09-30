import React from 'react';
import { Bot, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 py-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-500" />
          <span className="font-semibold text-white">UniAssist AI</span>
          <span className="text-slate-500">| University Student Support & Ticket Escalation Portal</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <span>Powered by RAG AI & Socket.IO Real-time Engine</span>
        </div>
      </div>
    </footer>
  );
};
