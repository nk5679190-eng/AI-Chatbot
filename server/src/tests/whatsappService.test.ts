import { describe, it, expect } from 'vitest';
import { WhatsAppService } from '../services/whatsappService.js';
import { config } from '../config/index.js';

describe('WhatsApp Webhook & Messaging Tests', () => {
  it('should verify webhook challenge token correctly', () => {
    const challenge = '123456789';
    const result = WhatsAppService.verifyWebhook('subscribe', config.whatsapp.verifyToken, challenge);
    expect(result).toBe(challenge);
  });

  it('should reject invalid webhook verify token', () => {
    const result = WhatsAppService.verifyWebhook('subscribe', 'invalid_token_123', 'challenge_abc');
    expect(result).toBeNull();
  });

  it('should handle duplicate webhook events gracefully', async () => {
    const mockPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'DUP_ENTRY',
          changes: [
            {
              value: {
                messages: [{ from: '15550001111', id: 'SAME_MSG_ID_100', text: { body: 'Hello' } }],
              },
            },
          ],
        },
      ],
    };

    const firstRun = await WhatsAppService.processWebhookPayload(mockPayload);
    const secondRun = await WhatsAppService.processWebhookPayload(mockPayload);

    expect(firstRun.success).toBe(true);
    expect(secondRun.message).toBe('Duplicate event ignored');
  });
});
