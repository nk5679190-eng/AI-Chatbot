import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { FAQ } from '../types';
import { Plus, Edit2, Trash2, Search, HelpCircle, Check, X } from 'lucide-react';

export const AdminFAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Admissions');
  const [keywords, setKeywords] = useState('');
  const [priority, setPriority] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const categories = [
    'Admissions', 'Fees and Payments', 'Examinations and Results', 'Attendance',
    'Timetable and Academic Calendar', 'Courses and Curriculum', 'Scholarships and Financial Aid',
    'Hostel and Accommodation', 'Library', 'Transport', 'Technical Support', 'Contact University Departments'
  ];

  const loadFAQs = async () => {
    try {
      const res = await api.getFAQs(selectedCategory, search);
      setFaqs(res.faqs || []);
    } catch {
      // Ignore load error
    }
  };

  useEffect(() => {
    loadFAQs();
  }, [selectedCategory, search]);

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setCategory(faq.category);
      setKeywords(faq.keywords);
      setPriority(faq.priority);
      setIsPublished(faq.isPublished);
    } else {
      setEditingFaq(null);
      setQuestion('');
      setAnswer('');
      setCategory('Admissions');
      setKeywords('');
      setPriority(0);
      setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.updateFAQ(editingFaq.id, { question, answer, category, keywords, priority, isPublished });
      } else {
        await api.createFAQ({ question, answer, category, keywords, priority, isPublished });
      }
      setIsModalOpen(false);
      await loadFAQs();
    } catch {
      // Ignore save error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteFAQ(id);
      await loadFAQs();
    } catch {
      // Ignore delete error
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">FAQ & Knowledge Base Manager</h1>
            <p className="text-xs text-slate-500 mt-1">Add, edit, publish, and structure grounded university answers</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs by question, answer, or keywords..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Question & Answer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Keywords</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 max-w-md space-y-1">
                    <div className="font-bold text-slate-900">{faq.question}</div>
                    <div className="text-xs text-slate-500 line-clamp-2">{faq.answer}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-200">
                      {faq.category}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 italic max-w-xs truncate">
                    {faq.keywords}
                  </td>
                  <td className="p-4 text-center">
                    {faq.isPublished ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        DRAFT
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-navy-900">
                {editingFaq ? 'Edit FAQ Entry' : 'Create New FAQ Entry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Weight</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keyword Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="admission, process, deadline, fee"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <label htmlFor="published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Publish to AI Grounding Search Engine
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
