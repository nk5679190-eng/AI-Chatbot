import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LogOut, User as UserIcon, LayoutDashboard, HelpCircle, MessageSquare, Ticket, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-navy-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-brand-500 transition">
              <div className="bg-brand-500 text-white p-2 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <span>UniAssist <span className="text-brand-500">AI</span></span>
            </Link>
            <span className="hidden md:inline-block bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-700">
              Student Support System
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/chat" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <span>AI Chatbot</span>
            </Link>

            <Link to="/faqs" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>FAQs</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                {user.role === 'STUDENT' && (
                  <Link to="/student/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition">
                    <Ticket className="w-4 h-4 text-brand-500" />
                    <span>My Dashboard</span>
                  </Link>
                )}

                {user.role === 'AGENT' && (
                  <Link to="/agent/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition">
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    <span>Agent Inbox</span>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/analytics" className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition shadow-sm">
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase border border-brand-400">
                    {user.name.charAt(0)}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-1.5 text-sm font-medium">
                  Log in
                </Link>
                <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
