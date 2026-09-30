export type Role = 'STUDENT' | 'AGENT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentId?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  email?: string;
  _count?: {
    agents: number;
    tickets: number;
  };
}

export interface SupportAgent {
  id: string;
  userId: string;
  departmentId: string;
  isAvailable: boolean;
  maxTickets: number;
  activeTicketCount: number;
  user: User;
  department: Department;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string;
  priority: number;
  views: number;
  helpfulCount: number;
  unhelpfulCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'STUDENT' | 'BOT' | 'AGENT' | 'SYSTEM';
  senderId?: string | null;
  content: string;
  confidenceScore?: number | null;
  helpfulness?: 'HELPFUL' | 'UNHELPFUL' | null;
  internalNote?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  studentId?: string | null;
  channel: 'WEBSITE' | 'WHATSAPP';
  externalId?: string | null;
  isEscalated: boolean;
  isResolved: boolean;
  rating?: number | null;
  feedbackComment?: string | null;
  messages?: Message[];
  createdAt: string;
}

export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_STUDENT' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  departmentId: string;
  studentId: string;
  assignedAgentId?: string | null;
  conversationId?: string | null;
  responseTimeMinutes?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  department: Department;
  student: User;
  assignedAgent?: SupportAgent | null;
  conversation?: Conversation | null;
  statusHistory?: any[];
}

export interface DashboardMetrics {
  totalConversations: number;
  totalStudentQueries: number;
  autoResolvedConversations: number;
  autoResolutionRate: number;
  escalatedConversations: number;
  escalationRate: number;
  openTickets: number;
  avgResponseTimeMinutes: number;
  avgRating: number;
  chatbotHelpfulnessRate: number;
  channelSplit: {
    website: number;
    whatsapp: number;
  };
  categoryDistribution: { name: string; count: number }[];
  trendData: { day: string; websiteQueries: number; whatsappQueries: number; tickets: number }[];
  topFAQs: { id: string; question: string; category: string; views: number; helpfulCount: number }[];
}
