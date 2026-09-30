import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  HelpCircle,
  Users,
  Smartphone,
  Sliders,
  FileText,
  Inbox,
  Ticket,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role === 'STUDENT') return null;

  const adminNav = [
    { label: 'Analytics & KPIs', path: '/admin/analytics', icon: BarChart3 },
    { label: 'FAQ Manager', path: '/admin/faqs', icon: HelpCircle },
    { label: 'Agents & Depts', path: '/admin/team', icon: Users },
    { label: 'WhatsApp Setup', path: '/admin/whatsapp', icon: Smartphone },
    { label: 'Bot Settings', path: '/admin/settings', icon: Sliders },
    { label: 'Feedback Reports', path: '/admin/reports', icon: FileText },
  ];

  const agentNav = [
    { label: 'Support Inbox', path: '/agent/dashboard', icon: Inbox },
    { label: 'Knowledge Base', path: '/faqs', icon: HelpCircle },
  ];

  const navItems = user.role === 'ADMIN' ? adminNav : agentNav;

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {user.role === 'ADMIN' ? 'Administration' : 'Support Agent Workspace'}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400">
        <div className="font-semibold text-slate-200 mb-1">{user.name}</div>
        <div className="text-brand-400 font-medium">{user.role} Role</div>
      </div>
    </aside>
  );
};
