import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { TicketService } from '../services/ticketService.js';

const prisma = new PrismaClient();

export class TicketController {
  public static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { title, description, category, priority, departmentId, conversationId } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
      }

      const ticket = await TicketService.createTicket({
        studentId: req.user.id,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        departmentId,
        conversationId,
      });

      return res.status(201).json({ ticket });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { status, priority, departmentId, search } = req.query;

      const where: any = {};

      // Role-based filtering
      if (req.user.role === 'STUDENT') {
        where.studentId = req.user.id;
      } else if (req.user.role === 'AGENT') {
        const agent = await prisma.supportAgent.findUnique({ where: { userId: req.user.id } });
        if (agent) {
          where.OR = [
            { assignedAgentId: agent.id },
            { departmentId: agent.departmentId },
          ];
        }
      }
      // ADMIN sees all tickets

      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }

      if (priority && typeof priority === 'string' && priority !== 'ALL') {
        where.priority = priority;
      }

      if (departmentId && typeof departmentId === 'string' && departmentId !== 'ALL') {
        where.departmentId = departmentId;
      }

      if (search && typeof search === 'string') {
        where.AND = [
          {
            OR: [
              { ticketNumber: { contains: search } },
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          },
        ];
      }

      const tickets = await prisma.supportTicket.findMany({
        where,
        include: {
          department: true,
          student: { select: { id: true, name: true, email: true, studentId: true } },
          assignedAgent: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return res.json({ tickets });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
          department: true,
          student: { select: { id: true, name: true, email: true, phone: true, studentId: true } },
          assignedAgent: { include: { user: { select: { id: true, name: true, email: true } } } },
          statusHistory: {
            include: { changedBy: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'desc' },
          },
          conversation: {
            include: {
              messages: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      });

      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      // Enforce student access control
      if (req.user?.role === 'STUDENT' && ticket.studentId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to view this ticket' });
      }

      return res.json({ ticket });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async addMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { id } = req.params;
      const { content, internalNote } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      let conversationId = ticket.conversationId;
      if (!conversationId) {
        const conv = await prisma.conversation.create({
          data: { studentId: ticket.studentId, isEscalated: true },
        });
        conversationId = conv.id;
        await prisma.supportTicket.update({ where: { id }, data: { conversationId } });
      }

      const senderType = req.user.role === 'STUDENT' ? 'STUDENT' : 'AGENT';

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderType,
          senderId: req.user.id,
          content,
          internalNote: internalNote === true,
        },
      });

      // Calculate first response time if agent reply
      if (senderType === 'AGENT' && !ticket.responseTimeMinutes) {
        const diffMs = new Date().getTime() - ticket.createdAt.getTime();
        const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
        await prisma.supportTicket.update({
          where: { id },
          data: { responseTimeMinutes: diffMinutes, status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status },
        });
      }

      return res.status(201).json({ message });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) return res.status(400).json({ error: 'Status is required' });

      const updated = await TicketService.updateTicketStatus(id, status, req.user.id, note);
      return res.json({ ticket: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public static async assignAgent(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Authentication required' });

      const { id } = req.params;
      const { agentId } = req.body;

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      const updated = await prisma.supportTicket.update({
        where: { id },
        data: {
          assignedAgentId: agentId,
          status: 'ASSIGNED',
        },
        include: {
          assignedAgent: { include: { user: true } },
          department: true,
        },
      });

      await prisma.ticketAssignment.create({
        data: {
          ticketId: id,
          agentId,
          assignedBy: req.user.id,
        },
      });

      await prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          previousStatus: ticket.status,
          newStatus: 'ASSIGNED',
          changedById: req.user.id,
          note: `Reassigned to agent ${updated.assignedAgent?.user.name}`,
        },
      });

      return res.json({ ticket: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
