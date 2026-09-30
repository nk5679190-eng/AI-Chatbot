import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';

const prisma = new PrismaClient();

export class ChatController {
  public static async createConversation(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.id || null;
      const conversation = await prisma.conversation.create({
        data: {
          studentId,
          channel: 'WEBSITE',
        },
      });

      return res.status(201).json({ conversation });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { conversationId, content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Message content is required' });
      }

      let convId = conversationId;
      let conversation;

      if (convId) {
        conversation = await prisma.conversation.findUnique({ where: { id: convId } });
      }

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            studentId: req.user?.id || null,
            channel: 'WEBSITE',
          },
        });
        convId = conversation.id;
      }

      // Save student message
      const studentMsg = await prisma.message.create({
        data: {
          conversationId: convId,
          senderType: 'STUDENT',
          senderId: req.user?.id || null,
          content,
        },
      });

      // Run AI Grounded Engine
      const aiResult = await AIService.generateAnswer(content);

      // Save bot response message
      const botMsg = await prisma.message.create({
        data: {
          conversationId: convId,
          senderType: 'BOT',
          content: aiResult.answer,
          confidenceScore: aiResult.confidenceScore,
        },
      });

      if (aiResult.shouldEscalate) {
        await prisma.conversation.update({
          where: { id: convId },
          data: { isEscalated: true },
        });
      }

      return res.json({
        conversationId: convId,
        studentMessage: studentMsg,
        botMessage: botMsg,
        aiResult,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getConversationHistory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      return res.json({ conversation });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async submitMessageFeedback(req: AuthRequest, res: Response) {
    try {
      const { messageId, helpfulness } = req.body; // 'HELPFUL' or 'UNHELPFUL'
      if (!['HELPFUL', 'UNHELPFUL'].includes(helpfulness)) {
        return res.status(400).json({ error: 'Invalid helpfulness value' });
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: { helpfulness },
      });

      return res.json({ message: updated });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
