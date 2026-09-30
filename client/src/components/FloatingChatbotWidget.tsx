import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, ThumbsUp, ThumbsDown, HelpCircle, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Message } from '../types';

export const FloatingChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      conversationId: '',
      senderType: 'BOT',
      content: 'Hi! Welcome to UniAssist AI. How can I help you today?',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEscalatePrompt, setShowEscalatePrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const quickPills = [
    'Admissions Process',
    'Tuition Fees',
    'Attendance Policy',
    'Exam Results',
    'Hostel Room Allotment',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const tempStudentMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      senderType: 'STUDENT',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempStudentMsg]);
    if (!textToSend) setInput('');
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
        setShowEscalatePrompt(true);
      } else {
        setShowEscalatePrompt(false);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversationId: conversationId || '',
          senderType: 'BOT',
          content: 'Sorry, I encountered an error. Please try again or create a support ticket.',
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform transform hover:scale-105 group"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-semibold text-sm pl-2">
            Ask UniAssist AI
          </span>
        </button>
      )}

      {/* Expandable Chat Overlay */}
      {isOpen && (
        <div className="bg-white border border-slate-200 w-[92vw] sm:w-[420px] h-[580px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-brand-500 p-2 rounded-xl text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  UniAssist AI <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                </h3>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Virtual Assistant Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/chat')}
                title="Expand Full Page"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Category Badges */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill)}
                className="whitespace-nowrap text-xs bg-white text-slate-700 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 hover:border-brand-200 px-2.5 py-1 rounded-full transition font-medium"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.senderType === 'STUDENT' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.senderType === 'STUDENT'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Feedback buttons for Bot messages */}
                {msg.senderType === 'BOT' && msg.id !== 'welcome-1' && (
                  <div className="flex items-center gap-2 mt-1 px-1 text-xs text-slate-400">
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

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl px-4 py-2.5 w-fit">
                <Bot className="w-4 h-4 text-brand-500 animate-spin" />
                <span>UniAssist AI is searching knowledge base...</span>
              </div>
            )}

            {/* Escalation Prompt */}
            {showEscalatePrompt && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex flex-col gap-2 my-2">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Low confidence match. Need human support?</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/tickets/new');
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-semibold w-full transition text-center"
                >
                  Create Support Ticket Now
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about admissions, fees, exams..."
                className="flex-1 bg-slate-100 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
