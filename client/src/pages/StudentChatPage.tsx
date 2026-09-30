import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bot, Send, ThumbsUp, ThumbsDown, HelpCircle, Ticket, Sparkles, RefreshCw, Search } from 'lucide-react';
import { api } from '../services/api';
import { Message, FAQ } from '../types';

export const StudentChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      conversationId: '',
      senderType: 'BOT',
      content: initialCategory
        ? `Hi! Welcome to UniAssist AI. How can I help you regarding ${initialCategory} today?`
        : 'Hi! Welcome to UniAssist AI. How can I help you today?',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqSearch, setFaqSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Admissions', 'Fees and Payments', 'Examinations and Results', 'Attendance',
    'Timetable and Academic Calendar', 'Courses and Curriculum', 'Scholarships and Financial Aid',
    'Hostel and Accommodation', 'Library', 'Transport', 'Technical Support', 'Contact University Departments'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    async function loadFAQs() {
      try {
        const res = await api.getFAQs();
        setFaqs(res.faqs || []);
      } catch {
        // Ignore load error
      }
    }
    loadFAQs();
  }, []);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input.trim();
    if (!query || loading) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      senderType: 'STUDENT',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage(conversationId, query);
      setConversationId(res.conversationId);

      const botMsg: Message = {
        id: res.botMessage.id,
        conversationId: res.conversationId,
        senderType: 'BOT',
        content: res.botMessage.content,
        confidenceScore: res.aiResult.confidenceScore,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.aiResult.shouldEscalate) {
        setShowEscalate(true);
      } else {
        setShowEscalate(false);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversationId: conversationId || '',
          senderType: 'BOT',
          content: 'I could not fetch an answer right now. Please try again or create a support ticket.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, type: 'HELPFUL' | 'UNHELPFUL') => {
    try {
      await api.submitMessageFeedback(messageId, type);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, helpfulness: type } : m))
      );
    } catch {
      // Ignore feedback error
    }
  };

  const filteredFAQs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
      {/* Sidebar Quick Reply Categories & Searchable FAQs */}
      <div className="lg:col-span-1 space-y-6">
        {/* Categories */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm text-navy-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Quick Query Categories</span>
          </h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(`Tell me about ${cat}`)}
                className="w-full text-left text-xs bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium px-3 py-2 rounded-xl transition border border-slate-200/60"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Searchable FAQ Suggestions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm text-navy-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Search Knowledge Base</span>
          </h3>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredFAQs.slice(0, 5).map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleSend(faq.question)}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-xs text-slate-800 transition"
              >
                <div className="font-semibold text-slate-900 line-clamp-1">{faq.question}</div>
                <div className="text-[10px] text-emerald-600 font-medium">{faq.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
        {/* Header */}
        <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2.5 rounded-xl text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                UniAssist AI Chat Assistant
              </h2>
              <p className="text-xs text-slate-300">Grounded University Knowledge Base RAG Engine</p>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  conversationId: '',
                  senderType: 'BOT',
                  content: 'Hi! Welcome to UniAssist AI. How can I help you today?',
                  createdAt: new Date().toISOString(),
                },
              ]);
              setConversationId(null);
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.senderType === 'STUDENT' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.senderType === 'STUDENT'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>

              {msg.senderType === 'BOT' && msg.id !== 'welcome-1' && (
                <div className="flex items-center gap-3 mt-1.5 px-1 text-xs text-slate-400">
                  {msg.confidenceScore && (
                    <span className="font-medium text-slate-500">
                      Match Confidence: {Math.round(msg.confidenceScore * 100)}%
                    </span>
                  )}
                  <span className="text-slate-300">•</span>
                  <span>Helpful?</span>
                  <button
                    onClick={() => handleFeedback(msg.id, 'HELPFUL')}
                    className={`p-1 rounded hover:bg-slate-200 transition ${msg.helpfulness === 'HELPFUL' ? 'text-emerald-600 font-bold' : ''}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'UNHELPFUL')}
                    className={`p-1 rounded hover:bg-slate-200 transition ${msg.helpfulness === 'UNHELPFUL' ? 'text-rose-600 font-bold' : ''}`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm bg-white border border-slate-200 rounded-2xl px-5 py-3 w-fit">
              <Bot className="w-5 h-5 text-brand-500 animate-spin" />
              <span>Searching university knowledge base...</span>
            </div>
          )}

          {showEscalate && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4 my-2">
              <div>
                <h4 className="font-bold">Unresolved Query / Low Confidence</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Would you like to lodge a support ticket for human staff review?
                </p>
              </div>
              <button
                onClick={() => navigate('/tickets/new')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" />
                <span>Create Support Ticket</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about admissions, tuition fees, exams, attendance..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
