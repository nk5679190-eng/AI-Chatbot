const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('uniassist_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'An error occurred during API call');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  me: () => request<any>('/auth/me'),

  // FAQs
  getFAQs: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return request<any>(`/faqs?${params.toString()}`);
  },
  createFAQ: (data: any) => request<any>('/faqs', { method: 'POST', body: JSON.stringify(data) }),
  updateFAQ: (id: string, data: any) => request<any>(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFAQ: (id: string) => request<any>(`/faqs/${id}`, { method: 'DELETE' }),

  // Chat
  sendMessage: (conversationId: string | null, content: string) =>
    request<any>('/chat/message', { method: 'POST', body: JSON.stringify({ conversationId, content }) }),
  getConversationHistory: (id: string) => request<any>(`/chat/conversations/${id}`),
  submitMessageFeedback: (messageId: string, helpfulness: 'HELPFUL' | 'UNHELPFUL') =>
    request<any>('/chat/feedback', { method: 'POST', body: JSON.stringify({ messageId, helpfulness }) }),

  // Tickets
  createTicket: (data: any) => request<any>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  getTickets: (filters: { status?: string; priority?: string; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    return request<any>(`/tickets?${params.toString()}`);
  },
  getTicketById: (id: string) => request<any>(`/tickets/${id}`),
  addTicketMessage: (id: string, content: string, internalNote = false) =>
    request<any>(`/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ content, internalNote }) }),
  updateTicketStatus: (id: string, status: string, note?: string) =>
    request<any>(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
  assignAgent: (id: string, agentId: string) =>
    request<any>(`/tickets/${id}/assign`, { method: 'PUT', body: JSON.stringify({ agentId }) }),

  // WhatsApp
  simulateWhatsApp: (phone: string, message: string) =>
    request<any>('/whatsapp/simulate', { method: 'POST', body: JSON.stringify({ phone, message }) }),

  // Analytics & Admin
  getDashboard: () => request<any>('/analytics/dashboard'),
  getDepartments: () => request<any>('/admin/departments'),
  createDepartment: (data: any) => request<any>('/admin/departments', { method: 'POST', body: JSON.stringify(data) }),
  getAgents: () => request<any>('/admin/agents'),
  createAgent: (data: any) => request<any>('/admin/agents', { method: 'POST', body: JSON.stringify(data) }),
  getConfigs: () => request<any>('/admin/configs'),
  updateConfigs: (configs: Record<string, string>) => request<any>('/admin/configs', { method: 'POST', body: JSON.stringify(configs) }),
  getFeedback: () => request<any>('/feedback'),
  submitFeedback: (data: any) => request<any>('/feedback', { method: 'POST', body: JSON.stringify(data) }),
};
