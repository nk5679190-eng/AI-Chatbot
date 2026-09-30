import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { Department, SupportAgent } from '../types';
import { Users, Building2, Plus, Mail, Shield, UserPlus, X } from 'lucide-react';

export const AdminTeamPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Agent Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const loadData = async () => {
    try {
      const [deptRes, agentRes] = await Promise.all([
        api.getDepartments(),
        api.getAgents(),
      ]);
      setDepartments(deptRes.departments || []);
      setAgents(agentRes.agents || []);
      if (deptRes.departments?.length > 0) {
        setDepartmentId(deptRes.departments[0].id);
      }
    } catch {
      // Ignore load error
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAgent({ name, email, password, departmentId });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      await loadData();
    } catch {
      // Ignore create error
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Agents & Department Management</h1>
            <p className="text-xs text-slate-500 mt-1">Configure support staff, workload limits, and department routing</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Support Agent</span>
          </button>
        </div>

        {/* Departments Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-500" />
            <span>University Support Departments</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{dept._count?.agents || 0} Agents</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <span>Active Support Staff Roster</span>
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Agent Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Active Workload</th>
                  <th className="p-4 text-center">Availability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {agents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 flex items-center gap-3 font-semibold text-slate-900">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                        {ag.user.name.charAt(0)}
                      </div>
                      <div>
                        <div>{ag.user.name}</div>
                        <div className="text-xs text-slate-400 font-normal">{ag.user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {ag.department.name} ({ag.department.code})
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">
                      {ag.activeTicketCount} / {ag.maxTickets} Tickets
                    </td>
                    <td className="p-4 text-center">
                      {ag.isAvailable ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          AVAILABLE
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          OFFLINE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-navy-900">Register Support Agent</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@university.edu"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password123!"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition shadow-md"
              >
                Create Agent Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
