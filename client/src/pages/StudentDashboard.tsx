import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { SupportTicket } from '../types';
import { useAuth } from '../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getTickets();
        setTickets(res.tickets || []);
      } catch {
        // Ignore load error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      OPEN: { bg: 'bg-amber-100', text: 'text-amber-800' },
      ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-800' },
      IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-800' },
      WAITING_FOR_STUDENT: { bg: 'bg-orange-100', text: 'text-orange-800' },
      RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      CLOSED: { bg: 'bg-slate-200', text: 'text-slate-800' },
    };
    const style = map[status] || { bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Student ID: <span className="font-semibold text-slate-700">{user?.studentId || 'N/A'}</span> | Email: {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/chat"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 border border-slate-200 transition"
          >
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>AI Chatbot</span>
          </Link>
          <Link
            to="/tickets/new"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </Link>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-500" />
            <span>Your Support Ticket History</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {tickets.length} Tickets
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700">No support tickets lodged yet</h3>
            <p className="text-xs text-slate-500">If the AI chatbot cannot answer your query, you can submit a ticket here.</p>
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Ticket</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/agent/tickets/${t.id}`}
                className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {t.ticketNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Dept: <strong className="text-slate-700">{t.department.name}</strong></span>
                    <span>•</span>
                    <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {statusBadge(t.status)}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
