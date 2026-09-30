import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { Download, Bot, Ticket, Star, Clock, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDashboard();
        setMetrics(res);
      } catch {
        // Ignore load error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ec4899', '#64748b'];

  const handleExportCSV = (type: 'tickets' | 'feedback') => {
    window.open(`/api/analytics/export?type=${type}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 py-20 text-center text-slate-400">Loading analytics data...</main>
      </div>
    );
  }

  const channelData = metrics
    ? [
        { name: 'Website Chatbot', value: metrics.channelSplit.website },
        { name: 'WhatsApp Cloud API', value: metrics.channelSplit.whatsapp },
      ]
    : [];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">University Analytics & Management Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time performance metrics, AI resolution rates, and CSAT scores</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExportCSV('tickets')}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-brand-600" />
              <span>Export Ticket CSV</span>
            </button>
            <button
              onClick={() => handleExportCSV('feedback')}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Feedback CSV</span>
            </button>
          </div>
        </div>

        {/* Top Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Conversations</span>
              <Bot className="w-5 h-5 text-brand-500" />
            </div>
            <div className="text-3xl font-extrabold text-navy-900">{metrics?.totalConversations}</div>
            <div className="text-xs text-slate-500">{metrics?.totalStudentQueries} Total Student Messages</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto-Resolution Rate</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">{metrics?.autoResolutionRate}%</div>
            <div className="text-xs text-slate-500">AI Grounded Resolution without Escalation</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escalation Rate</span>
              <Ticket className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600">{metrics?.escalationRate}%</div>
            <div className="text-xs text-slate-500">{metrics?.openTickets} Active Tickets Pending Staff</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Satisfaction</span>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            </div>
            <div className="text-3xl font-extrabold text-navy-900">{metrics?.avgRating} / 5.0</div>
            <div className="text-xs text-emerald-600 font-medium">{metrics?.chatbotHelpfulnessRate}% Positive Bot Rating</div>
          </div>
        </div>

        {/* Recharts Data Visualization */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Query Trends */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <span>Weekly Query & Ticket Escalation Trends</span>
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="websiteQueries" stroke="#0ea5e9" strokeWidth={3} name="Website Queries" />
                  <Line type="monotone" dataKey="whatsappQueries" stroke="#22c55e" strokeWidth={3} name="WhatsApp Queries" />
                  <Line type="monotone" dataKey="tickets" stroke="#f59e0b" strokeWidth={2} name="Escalated Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channel Split Pie Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-navy-900">Website vs WhatsApp Split</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {channelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top FAQs Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <span>Most Frequently Asked Student Queries</span>
          </h3>
          <div className="divide-y divide-slate-100">
            {metrics?.topFAQs.map((faq) => (
              <div key={faq.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm">{faq.question}</div>
                  <div className="text-xs text-brand-600">{faq.category}</div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>{faq.views} views</span>
                  <span className="text-emerald-600">{faq.helpfulCount} helpful</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
