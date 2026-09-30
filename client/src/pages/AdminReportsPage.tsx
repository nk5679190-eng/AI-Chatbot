import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { Star, Download, MessageSquare, ThumbsUp, User } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getFeedback();
        setFeedbacks(res.feedbacks || []);
      } catch {
        // Ignore load error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/analytics/export?type=feedback', '_blank');
  };

  const starRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Student Satisfaction & Feedback Reports</h1>
            <p className="text-xs text-slate-500 mt-1">Review post-resolution surveys, star ratings, and student comments</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Feedback CSV</span>
          </button>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            <span>Submitted Student Reviews</span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading student feedback...</div>
          ) : feedbacks.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No feedback submissions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {feedbacks.map((f) => (
                <div key={f.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {starRating(f.rating)}
                      <span className="font-bold text-slate-900 text-sm">
                        {f.isAnonymous ? 'Anonymous Student' : f.student?.name || 'Student'}
                      </span>
                      {f.ticket && (
                        <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {f.ticket.ticketNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {f.comment && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 italic">
                      "{f.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
