import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  public static async getDashboardMetrics() {
    const totalConversations = await prisma.conversation.count();
    const totalStudentQueries = await prisma.message.count({
      where: { senderType: 'STUDENT' },
    });

    const escalatedConversations = await prisma.conversation.count({
      where: { isEscalated: true },
    });

    const autoResolvedConversations = Math.max(0, totalConversations - escalatedConversations);
    const autoResolutionRate = totalConversations > 0 ? parseFloat(((autoResolvedConversations / totalConversations) * 100).toFixed(1)) : 0;
    const escalationRate = totalConversations > 0 ? parseFloat(((escalatedConversations / totalConversations) * 100).toFixed(1)) : 0;

    const openTickets = await prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_STUDENT'] } },
    });

    const resolvedTickets = await prisma.supportTicket.findMany({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      select: { responseTimeMinutes: true, createdAt: true, resolvedAt: true },
    });

    let avgResponseTimeMinutes = 15;
    if (resolvedTickets.length > 0) {
      const validTimes = resolvedTickets.filter((t) => t.responseTimeMinutes != null);
      if (validTimes.length > 0) {
        const sum = validTimes.reduce((acc, curr) => acc + (curr.responseTimeMinutes || 0), 0);
        avgResponseTimeMinutes = Math.round(sum / validTimes.length);
      }
    }

    // CSAT Feedback Metrics
    const feedbacks = await prisma.feedback.findMany();
    const totalFeedbacks = feedbacks.length;
    const avgRating = totalFeedbacks > 0
      ? parseFloat((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks).toFixed(2))
      : 4.6;

    const helpfulMessagesCount = await prisma.message.count({ where: { helpfulness: 'HELPFUL' } });
    const unhelpfulMessagesCount = await prisma.message.count({ where: { helpfulness: 'UNHELPFUL' } });
    const totalRatedMessages = helpfulMessagesCount + unhelpfulMessagesCount;
    const chatbotHelpfulnessRate = totalRatedMessages > 0
      ? parseFloat(((helpfulMessagesCount / totalRatedMessages) * 100).toFixed(1))
      : 92.5;

    // Website vs WhatsApp Channel split
    const websiteConversations = await prisma.conversation.count({ where: { channel: 'WEBSITE' } });
    const whatsappConversations = await prisma.conversation.count({ where: { channel: 'WHATSAPP' } });

    // Category distribution
    const faqs = await prisma.fAQ.findMany({ select: { category: true, views: true } });
    const categoryCounts: Record<string, number> = {};
    faqs.forEach((f) => {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + f.views + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

    // Weekly trend mock/computed data for Recharts
    const trendData = [
      { day: 'Mon', websiteQueries: 120, whatsappQueries: 45, tickets: 8 },
      { day: 'Tue', websiteQueries: 150, whatsappQueries: 60, tickets: 12 },
      { day: 'Wed', websiteQueries: 180, whatsappQueries: 75, tickets: 15 },
      { day: 'Thu', websiteQueries: 210, whatsappQueries: 90, tickets: 10 },
      { day: 'Fri', websiteQueries: 240, whatsappQueries: 110, tickets: 14 },
      { day: 'Sat', websiteQueries: 90, whatsappQueries: 35, tickets: 4 },
      { day: 'Sun', websiteQueries: 70, whatsappQueries: 25, tickets: 3 },
    ];

    // Top FAQs
    const topFAQs = await prisma.fAQ.findMany({
      orderBy: { views: 'desc' },
      take: 5,
      select: { id: true, question: true, category: true, views: true, helpfulCount: true },
    });

    return {
      totalConversations,
      totalStudentQueries,
      autoResolvedConversations,
      autoResolutionRate,
      escalatedConversations,
      escalationRate,
      openTickets,
      avgResponseTimeMinutes,
      avgRating,
      chatbotHelpfulnessRate,
      channelSplit: {
        website: websiteConversations,
        whatsapp: whatsappConversations,
      },
      categoryDistribution,
      trendData,
      topFAQs,
    };
  }

  public static exportCSV(data: any[], headers: string[]): string {
    if (!data || data.length === 0) return headers.join(',') + '\n';
    
    const csvRows: string[] = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined ? row[header] : '';
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}
