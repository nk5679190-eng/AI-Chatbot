import React, { useState, useEffect } from 'react';
import { Search, HelpCircle, ThumbsUp, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import { FAQ } from '../types';

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All', 'Admissions', 'Fees and Payments', 'Examinations and Results', 'Attendance',
    'Timetable and Academic Calendar', 'Courses and Curriculum', 'Scholarships and Financial Aid',
    'Hostel and Accommodation', 'Library', 'Transport', 'Technical Support', 'Contact University Departments'
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getFAQs(selectedCategory, search);
        setFaqs(res.faqs || []);
      } catch {
        // Ignore load error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Official University Knowledge Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900">Frequently Asked Questions</h1>
        <p className="text-slate-600 text-sm">
          Browse verified university policies, admission guidelines, fee details, and academic schedules.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, questions, or topics..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">No FAQs match your search criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting category or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-sm hover:border-brand-300"
              >
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-brand-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-lg font-bold">
                      {faq.category}
                    </span>
                    <span className="text-base">{faq.question}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 bg-slate-50/50 text-slate-700 text-sm leading-relaxed">
                    <p>{faq.answer}</p>
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="italic">{faq.keywords}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <ThumbsUp className="w-3.5 h-3.5" /> {faq.helpfulCount} helpful
                        </span>
                        <span>• {faq.views} views</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
