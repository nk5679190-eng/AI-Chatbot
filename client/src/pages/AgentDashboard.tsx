import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Search, Filter, Clock, AlertTriangle, CheckCircle, Ticket, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { SupportTicket } from '../types';
import { Sidebar } from '../components/Sidebar';

export const AgentDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getTickets({ status: statusFilter, priority: priorityFilter, search });
        setTickets(res.tickets || []);
      } catch {
        // Ignore load error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter, priorityFilter, search]);

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const assignedCount = tickets.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

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

  const priorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      LOW: 'text-slate-600 bg-slate-100',
      MEDIUM: 'text-blue-700 bg-blue-50',
      HIGH: 'text-orange-700 bg-orange-50 font-bold',
      URGENT: 'text-rose-700 bg-rose-50 font-extrabold',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border border-current ${map[priority] || ''}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Support Agent Inbox</h1>
            <p className="text-xs text-slate-500 mt-1">Manage, assign, and respond to escalated student tickets</p>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Queue Open</div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">{openCount}</div>
            </div>
            <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</div>
              <div className="text-3xl font-extrabold text-brand-600 mt-1">{assignedCount}</div>
            </div>
            <div className="bg-brand-100 text-brand-700 p-3 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</div>
            </div>
            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, title, or student name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_FOR_STUDENT">WAITING_FOR_STUDENT</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>

        {/* Ticket List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading support ticket queue...</div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No tickets found</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/agent/tickets/${t.id}`}
                  className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition block"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {t.ticketNumber}
                      </span>
                      {priorityBadge(t.priority)}
                      <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Student: <strong className="text-slate-800">{t.student.name}</strong> ({t.student.email})</span>
                      <span>•</span>
                      <span>Dept: <strong className="text-slate-800">{t.department.name}</strong></span>
                      <span>•</span>
                      <span>Assigned Agent: <strong className="text-brand-600">{t.assignedAgent?.user.name || 'Unassigned'}</strong></span>
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
      </main>
    </div>
  );
};
