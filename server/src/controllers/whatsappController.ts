import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsappService.js';

export class WhatsAppController {
  public static verifyWebhook(req: Request, res: Response) {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const result = WhatsAppService.verifyWebhook(mode, token, challenge);
    if (result) {
      console.log('[WhatsApp Webhook] Verification challenge passed successfully.');
      return res.status(200).send(result);
    }
    return res.status(403).json({ error: 'Webhook verification token mismatch.' });
  }

  public static async handleWebhookEvent(req: Request, res: Response) {
    try {
      const outcome = await WhatsAppService.processWebhookPayload(req.body);
      return res.status(200).json(outcome);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async simulateInbound(req: Request, res: Response) {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ error: 'Phone number and message text are required for simulation' });
      }

      const mockPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'WHATSAPP_ENTRY_1001',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: { display_phone_number: '15550199', phone_number_id: '109827364529101' },
                  contacts: [{ profile: { name: 'Demo WhatsApp Student' }, wa_id: phone }],
                  messages: [
                    {
                      from: phone,
                      id: `wamid.HBgL${Date.now()}`,
                      timestamp: `${Math.floor(Date.now() / 1000)}`,
                      text: { body: message },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const outcome = await WhatsAppService.processWebhookPayload(mockPayload);
      return res.json({ simulationResult: outcome });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
