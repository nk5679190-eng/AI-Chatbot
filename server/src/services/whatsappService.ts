import { PrismaClient } from '@prisma/client';
import { AIService } from './aiService.js';
import { TicketService } from './ticketService.js';
import { config } from '../config/index.js';

const prisma = new PrismaClient();
const processedMessageIds = new Set<string>();

export class WhatsAppService {
  public static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      return challenge;
    }
    return null;
  }

  public static async processWebhookPayload(payload: any) {
    try {
      const entry = payload?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value || !value.messages || value.messages.length === 0) {
        return { success: true, message: 'No message payload' };
      }

      const msg = value.messages[0];
      const messageId = msg.id;
      const senderPhone = msg.from; // Phone number e.g. "15550199"
      const textBody = msg.text?.body || msg.interactive?.button_reply?.title || '';

      // 1. Deduplication check
      if (processedMessageIds.has(messageId)) {
        console.log(`[WhatsApp] Skipping duplicate event ID: ${messageId}`);
        return { success: true, message: 'Duplicate event ignored' };
      }
      processedMessageIds.add(messageId);
      if (processedMessageIds.size > 1000) {
        processedMessageIds.clear();
      }

      // 2. Find or create WhatsApp conversation
      let conversation = await prisma.conversation.findFirst({
        where: { channel: 'WHATSAPP', externalId: senderPhone },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            channel: 'WHATSAPP',
            externalId: senderPhone,
          },
        });
      }

      // 3. Save incoming message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'STUDENT',
          content: textBody,
        },
      });

      // 4. Check if student requests human support explicitly
      if (textBody.toLowerCase().includes('agent') || textBody.toLowerCase().includes('human support') || textBody.toLowerCase().includes('ticket')) {
        // Find existing student by phone or use default
        const studentUser = await prisma.user.findFirst({ where: { phone: senderPhone } }) || 
                            await prisma.user.findFirst({ where: { role: 'STUDENT' } });

        if (studentUser) {
          const ticket = await TicketService.createTicket({
            studentId: studentUser.id,
            title: `WhatsApp Inquiry: ${textBody.substring(0, 40)}...`,
            description: `Query received via WhatsApp (${senderPhone}): ${textBody}`,
            category: 'General Support',
            conversationId: conversation.id,
          });

          const responseText = `A support ticket (${ticket.ticketNumber}) has been created for your inquiry. A support representative will get back to you shortly.`;
          
          await this.sendWhatsAppMessage(senderPhone, responseText);
          return { success: true, ticketCreated: true };
        }
      }

      // 5. Run AI Grounded RAG Engine
      const aiResult = await AIService.generateAnswer(textBody);

      // Save Bot Message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderType: 'BOT',
          content: aiResult.answer,
          confidenceScore: aiResult.confidenceScore,
        },
      });

      // 6. Send Reply back to WhatsApp Cloud API
      let replyText = aiResult.answer;
      if (aiResult.shouldEscalate) {
        replyText += `\n\nReply "TICKET" if you would like me to create a support ticket for a human agent to assist you.`;
      }

      await this.sendWhatsAppMessage(senderPhone, replyText);
      return { success: true, botReplied: true, confidence: aiResult.confidenceScore };
    } catch (err) {
      console.error('[WhatsApp] Webhook processing error:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  public static async sendWhatsAppMessage(recipientPhone: string, text: string): Promise<boolean> {
    if (!config.whatsapp.phoneNumberId || !config.whatsapp.accessToken) {
      console.log(`[WhatsApp API Simulated] To: ${recipientPhone} | Msg: ${text.substring(0, 60)}...`);
      return false;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${config.whatsapp.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.whatsapp.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientPhone,
          type: 'text',
          text: { body: text },
        }),
      });

      const data = await res.json();
      return res.ok;
    } catch (err) {
      console.error('[WhatsApp API] Dispatch failed:', err);
      return false;
    }
  }
}
