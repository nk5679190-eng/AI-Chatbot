import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, ArrowLeft, Send, Lock, User, Clock, CheckCircle2, Shield, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { SupportTicket, Message, SupportAgent } from '../types';
import { useAuth } from '../context/AuthContext';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadTicket = async () => {
    if (!id) return;
    try {
      const res = await api.getTicketById(id);
      setTicket(res.ticket);
      if (res.ticket.conversation?.messages) {
        setMessages(res.ticket.conversation.messages);
      }
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();

    if (user?.role === 'ADMIN') {
      api.getAgents().then((res) => setAgents(res.agents || [])).catch(() => {});
    }

    // Connect Socket.IO for real-time ticket updates
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;

    socket.emit('join_ticket_room', { ticketId: id });

    socket.on('new_ticket_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leave_ticket_room', { ticketId: id });
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || submitting || !id) return;

    setSubmitting(true);
    try {
      const res = await api.addTicketMessage(id, replyInput, isInternalNote);
      const newMsg = res.message;

      setMessages((prev) => [...prev, newMsg]);
      if (socketRef.current) {
        socketRef.current.emit('send_ticket_message', { ticketId: id, message: newMsg });
      }

      setReplyInput('');
      setIsInternalNote(false);
      await loadTicket();
    } catch {
      // Ignore reply error
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const res = await api.updateTicketStatus(id, newStatus);
      setTicket(res.ticket);
    } catch {
      // Ignore status update error
    }
  };

  const handleAgentAssign = async (agentId: string) => {
    if (!id) return;
    try {
      const res = await api.assignAgent(id, agentId);
      setTicket(res.ticket);
    } catch {
      // Ignore assign error
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading ticket details...</div>;
  }

  if (!ticket) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="font-bold">Ticket not found</h3>
      </div>
    );
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Ticket List</span>
      </button>

      {/* Ticket Title Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
              {ticket.ticketNumber}
            </span>
            <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-semibold">
              {ticket.category}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">
              Priority: {ticket.priority}
            </span>
          </div>
          <h1 className="text-xl font-bold text-navy-900 mt-2">{ticket.title}</h1>
        </div>

        {/* Status Update Control */}
        {isStaff && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_FOR_STUDENT">WAITING_FOR_STUDENT</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Conversation & Reply Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
            <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-xs text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Live Support Conversation</span>
              <span className="flex items-center gap-1.5 text-emerald-600 normal-case font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Socket.IO Live
              </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {/* Ticket Initial Issue Description */}
              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-950 space-y-2">
                <div className="font-bold text-brand-900 flex items-center justify-between">
                  <span>Student Opening Inquiry ({ticket.student.name})</span>
                  <span className="text-[10px] text-brand-700 font-normal">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm">{ticket.description}</p>
              </div>

              {messages.map((msg) => {
                if (msg.internalNote && !isStaff) return null; // Hide internal notes from student

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderType === 'STUDENT' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.internalNote
                          ? 'bg-amber-100 border border-amber-300 text-amber-950'
                          : msg.senderType === 'STUDENT'
                          ? 'bg-brand-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.internalNote && (
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Internal Staff Note Only</span>
                        </div>
                      )}
                      <div>{msg.content}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Form */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendReply} className="space-y-3">
                {isStaff && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      id="internalNote"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="internalNote" className="cursor-pointer flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Post as Internal Staff Note (Invisible to Student)</span>
                    </label>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder={isInternalNote ? "Write internal staff note..." : "Write a reply to student..."}
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim() || submitting}
                    className={`font-bold px-6 py-3 rounded-xl text-white transition flex items-center gap-2 ${
                      isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-600 hover:bg-brand-700'
                    }`}
                  >
                    <span>Reply</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Ticket Metadata & History */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-3">
              Ticket Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Student</span>
                <span className="font-bold text-slate-800">{ticket.student.name}</span> ({ticket.student.email})
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-bold text-slate-800">{ticket.department.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Assigned Support Agent</span>
                {user?.role === 'ADMIN' ? (
                  <select
                    value={ticket.assignedAgentId || ''}
                    onChange={(e) => handleAgentAssign(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>{ag.user.name} ({ag.department.code})</option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-brand-600">
                    {ticket.assignedAgent?.user.name || 'Unassigned'}
                  </span>
                )}
              </div>

              {ticket.responseTimeMinutes && (
                <div>
                  <span className="text-slate-400 block font-medium">First Agent Response Time</span>
                  <span className="font-bold text-emerald-600">{ticket.responseTimeMinutes} Minutes</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Audit Trail */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Status Audit Trail</span>
            </h3>

            <div className="space-y-3 text-xs">
              {ticket.statusHistory?.map((hist) => (
                <div key={hist.id} className="border-l-2 border-brand-500 pl-3 space-y-0.5">
                  <div className="font-bold text-slate-800">{hist.newStatus}</div>
                  <div className="text-[11px] text-slate-500">{hist.note || 'Status updated'}</div>
                  <div className="text-[10px] text-slate-400">
                    By {hist.changedBy.name} • {new Date(hist.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
