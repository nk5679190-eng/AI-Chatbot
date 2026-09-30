import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { FAQController } from '../controllers/faqController.js';
import { ChatController } from '../controllers/chatController.js';
import { TicketController } from '../controllers/ticketController.js';
import { WhatsAppController } from '../controllers/whatsappController.js';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { FeedbackController } from '../controllers/feedbackController.js';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, optionalToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Auth
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.me);

// FAQs
router.get('/faqs', FAQController.list);
router.get('/faqs/:id', FAQController.getById);
router.post('/faqs', authenticateToken, requireRole(['ADMIN', 'AGENT']), FAQController.create);
router.put('/faqs/:id', authenticateToken, requireRole(['ADMIN', 'AGENT']), FAQController.update);
router.delete('/faqs/:id', authenticateToken, requireRole(['ADMIN']), FAQController.delete);

// Chat & RAG Engine
router.post('/chat/conversations', optionalToken, ChatController.createConversation);
router.post('/chat/message', optionalToken, ChatController.sendMessage);
router.get('/chat/conversations/:id', optionalToken, ChatController.getConversationHistory);
router.post('/chat/feedback', optionalToken, ChatController.submitMessageFeedback);

// Support Tickets
router.get('/tickets', authenticateToken, TicketController.list);
router.post('/tickets', authenticateToken, TicketController.create);
router.get('/tickets/:id', authenticateToken, TicketController.getById);
router.post('/tickets/:id/messages', authenticateToken, TicketController.addMessage);
router.put('/tickets/:id/status', authenticateToken, requireRole(['AGENT', 'ADMIN']), TicketController.updateStatus);
router.put('/tickets/:id/assign', authenticateToken, requireRole(['ADMIN']), TicketController.assignAgent);

// WhatsApp Webhook
router.get('/whatsapp/webhook', WhatsAppController.verifyWebhook);
router.post('/whatsapp/webhook', WhatsAppController.handleWebhookEvent);
router.post('/whatsapp/simulate', authenticateToken, requireRole(['ADMIN']), WhatsAppController.simulateInbound);

// Analytics & Reports
router.get('/analytics/dashboard', authenticateToken, requireRole(['ADMIN', 'AGENT']), AnalyticsController.getDashboard);
router.get('/analytics/export', authenticateToken, requireRole(['ADMIN']), AnalyticsController.exportCSVReport);

// Feedback
router.post('/feedback', optionalToken, FeedbackController.submit);
router.get('/feedback', authenticateToken, requireRole(['ADMIN']), FeedbackController.list);

// Admin Management
router.get('/admin/departments', authenticateToken, AdminController.listDepartments);
router.post('/admin/departments', authenticateToken, requireRole(['ADMIN']), AdminController.createDepartment);
router.get('/admin/agents', authenticateToken, requireRole(['ADMIN']), AdminController.listAgents);
router.post('/admin/agents', authenticateToken, requireRole(['ADMIN']), AdminController.createAgent);
router.get('/admin/configs', authenticateToken, requireRole(['ADMIN']), AdminController.getConfigs);
router.post('/admin/configs', authenticateToken, requireRole(['ADMIN']), AdminController.updateConfigs);

export default router;
