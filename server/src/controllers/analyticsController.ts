import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../services/analyticsService.js';

const prisma = new PrismaClient();

export class AnalyticsController {
  public static async getDashboard(req: Request, res: Response) {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async exportCSVReport(req: Request, res: Response) {
    try {
      const { type } = req.query; // 'tickets', 'faqs', 'feedback'

      if (type === 'tickets') {
        const tickets = await prisma.supportTicket.findMany({
          include: { department: true, student: true, assignedAgent: { include: { user: true } } },
        });

        const formatted = tickets.map((t) => ({
          TicketNumber: t.ticketNumber,
          Title: t.title,
          Category: t.category,
          Priority: t.priority,
          Status: t.status,
          Department: t.department.name,
          StudentName: t.student.name,
          StudentEmail: t.student.email,
          AssignedAgent: t.assignedAgent?.user.name || 'Unassigned',
          ResponseTimeMinutes: t.responseTimeMinutes || 0,
          CreatedAt: t.createdAt.toISOString(),
        }));

        const headers = ['TicketNumber', 'Title', 'Category', 'Priority', 'Status', 'Department', 'StudentName', 'StudentEmail', 'AssignedAgent', 'ResponseTimeMinutes', 'CreatedAt'];
        const csv = AnalyticsService.exportCSV(formatted, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=uniassist_tickets_report.csv');
        return res.send(csv);
      } else if (type === 'feedback') {
        const feedback = await prisma.feedback.findMany({
          include: { student: true, ticket: true },
        });

        const formatted = feedback.map((f) => ({
          ID: f.id,
          Rating: f.rating,
          Comment: f.comment || '',
          StudentName: f.isAnonymous ? 'Anonymous' : f.student?.name || 'N/A',
          TicketNumber: f.ticket?.ticketNumber || 'N/A',
          CreatedAt: f.createdAt.toISOString(),
        }));

        const headers = ['ID', 'Rating', 'Comment', 'StudentName', 'TicketNumber', 'CreatedAt'];
        const csv = AnalyticsService.exportCSV(formatted, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=uniassist_feedback_report.csv');
        return res.send(csv);
      }

      return res.status(400).json({ error: 'Invalid export type. Must be tickets or feedback.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
