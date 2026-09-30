import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, ShieldCheck, Clock, Ticket, Users, Sparkles, ArrowRight, BookOpen, Smartphone } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const categories = [
    'Admissions', 'Fees and Payments', 'Examinations and Results', 'Attendance',
    'Timetable and Academic Calendar', 'Courses and Curriculum', 'Scholarships and Financial Aid',
    'Hostel and Accommodation', 'Library', 'Transport', 'Technical Support', 'Contact Departments'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy-900 via-navy-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 text-brand-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-brand-400" />
            24/7 AI-Powered Student Assistance Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Instant Answers. 24/7 Support. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              UniAssist AI Student Portal
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Ask any question about university admissions, fees, exams, course schedules, or hostel allotments. Powered by Grounded RAG AI with instant fallback to human support officers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/chat"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-xl text-lg flex items-center gap-3 shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Launch AI Chatbot</span>
            </Link>
            <Link
              to="/faqs"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl text-lg flex items-center gap-2 border border-slate-700 transition w-full sm:w-auto justify-center"
            >
              <BookOpen className="w-5 h-5" />
              <span>Browse Knowledge Base</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900">Why Students & Staff Love UniAssist AI</h2>
          <p className="text-slate-600 mt-2">Comprehensive support workflow bridging AI automation and human care.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-brand-100 text-brand-600 p-3 rounded-xl w-fit mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">24/7 Instant Answers</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Get immediate, accurate responses grounded strictly in official university policies without waiting in queues.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl w-fit mb-4">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Smart Human Escalation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When queries require human review, the system automatically creates a support ticket routed directly to the appropriate department.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl w-fit mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">WhatsApp Cloud Integration</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Interact with the chatbot right from your mobile device via official WhatsApp Business API integration.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Reply Categories */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Supported Query Categories</h2>
              <p className="text-slate-600 text-sm">Select a category to start chatting with UniAssist AI</p>
            </div>
            <Link to="/chat" className="text-brand-600 font-semibold text-sm flex items-center gap-1 hover:underline">
              <span>View Chatbot</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/chat?category=${encodeURIComponent(cat)}`}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition flex items-center gap-3 text-slate-800 font-medium text-sm group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 group-hover:scale-125 transition" />
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
