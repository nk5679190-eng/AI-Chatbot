import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export class FeedbackController {
  public static async submit(req: AuthRequest, res: Response) {
    try {
      const { ticketId, conversationId, rating, comment, isAnonymous } = req.body;

      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }

      const studentId = req.user?.id || null;

      const feedback = await prisma.feedback.create({
        data: {
          ticketId: ticketId || null,
          conversationId: conversationId || null,
          studentId,
          rating,
          comment: comment || null,
          isAnonymous: isAnonymous === true,
        },
      });

      return res.status(201).json({ feedback });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async list(req: AuthRequest, res: Response) {
    try {
      const feedbacks = await prisma.feedback.findMany({
        include: {
          student: { select: { id: true, name: true, email: true } },
          ticket: { select: { id: true, ticketNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ feedbacks });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
