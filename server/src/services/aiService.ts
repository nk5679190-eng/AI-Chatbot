import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

export interface RAGAnswerResult {
  answer: string;
  confidenceScore: number;
  matchedFAQId?: string;
  category?: string;
  sources: { title: string; type: string; id: string }[];
  suggestedQuickReplies: string[];
  shouldEscalate: boolean;
  escalationReason?: string;
}

export class AIService {
  // Anti-prompt injection check
  private static isPromptInjection(input: string): boolean {
    const injectionPatterns = [
      /(ignore|override|forget)\s+.*(instruction|rule|prompt|system)/i,
      /you are now a/i,
      /reveal\s+.*(system|hidden|prompt|password|secret|key)/i,
      /drop table/i,
      /grant admin/i,
    ];
    return injectionPatterns.some((pattern) => pattern.test(input));
  }

  // Tokenize & calculate TF-IDF keyword match score
  private static calculateMatchScore(query: string, textToMatch: string, keywordsStr: string): number {
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/gi, '');
    const queryTokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

    if (queryTokens.length === 0) return 0;

    const targetText = (textToMatch + ' ' + keywordsStr).toLowerCase();
    let matches = 0;
    let keywordBonus = 0;

    const keywords = keywordsStr.toLowerCase().split(',').map((k) => k.trim());

    for (const token of queryTokens) {
      if (targetText.includes(token)) {
        matches += 1;
      }
      if (keywords.some((k) => k.includes(token))) {
        keywordBonus += 0.5;
      }
    }

    const baseScore = (matches + keywordBonus) / queryTokens.length;
    return Math.min(1.0, Math.max(0.0, baseScore));
  }

  public static async generateAnswer(query: string): Promise<RAGAnswerResult> {
    // 1. Guardrail against prompt injection
    if (this.isPromptInjection(query)) {
      return {
        answer: 'I am unable to process requests that attempt to override system rules. Please ask a valid question regarding university admissions, fees, exams, or support.',
        confidenceScore: 0.1,
        sources: [],
        suggestedQuickReplies: ['Admissions Process', 'Tuition Fees', 'Contact Support'],
        shouldEscalate: false,
      };
    }

    // 2. Fetch all published FAQs and Knowledge Base documents
    const faqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
    });

    const kbDocs = await prisma.kBDocument.findMany({
      where: { isPublished: true },
    });

    let bestFAQ: (typeof faqs)[0] | null = null;
    let maxScore = 0;

    for (const faq of faqs) {
      const score = this.calculateMatchScore(query, faq.question + ' ' + faq.answer, faq.keywords);
      if (score > maxScore) {
        maxScore = score;
        bestFAQ = faq;
      }
    }

    // Check KB Docs as well
    let bestKBDoc: (typeof kbDocs)[0] | null = null;
    let maxKBScore = 0;
    for (const doc of kbDocs) {
      const score = this.calculateMatchScore(query, doc.title + ' ' + doc.content, doc.tags);
      if (score > maxKBScore) {
        maxKBScore = score;
        bestKBDoc = doc;
      }
    }

    const threshold = config.aiConfidenceThreshold;

    // 3. Low Confidence / Insufficient Information Fallback
    if (maxScore < threshold && maxKBScore < threshold) {
      return {
        answer: "I couldn't verify the answer from the available university information. I can create a support ticket or connect you with the appropriate support team.",
        confidenceScore: Math.max(maxScore, maxKBScore),
        sources: [],
        suggestedQuickReplies: ['Create Support Ticket', 'Contact IT Helpdesk', 'View All FAQs'],
        shouldEscalate: true,
        escalationReason: 'Low confidence in knowledge base response',
      };
    }

    // 4. Higher scoring match (FAQ vs KB Document)
    if (maxScore >= maxKBScore && bestFAQ) {
      // Increment view count for the FAQ asynchronously
      prisma.fAQ.update({ where: { id: bestFAQ.id }, data: { views: { increment: 1 } } }).catch(() => {});

      // Build follow-up suggestions based on category
      const relatedFAQs = faqs
        .filter((f) => f.category === bestFAQ!.category && f.id !== bestFAQ!.id)
        .slice(0, 3)
        .map((f) => f.question);

      return {
        answer: bestFAQ.answer,
        confidenceScore: Math.min(0.98, parseFloat(maxScore.toFixed(2))),
        matchedFAQId: bestFAQ.id,
        category: bestFAQ.category,
        sources: [{ title: bestFAQ.question, type: 'FAQ', id: bestFAQ.id }],
        suggestedQuickReplies: relatedFAQs.length > 0 ? relatedFAQs : ['Fee Payment Options', 'Exam Timetable', 'Contact Support'],
        shouldEscalate: false,
      };
    } else if (bestKBDoc) {
      return {
        answer: bestKBDoc.content,
        confidenceScore: Math.min(0.95, parseFloat(maxKBScore.toFixed(2))),
        category: bestKBDoc.category,
        sources: [{ title: bestKBDoc.title, type: 'Knowledge Base', id: bestKBDoc.id }],
        suggestedQuickReplies: ['View Academic Calendar', 'Contact Student Affairs', 'Create Support Ticket'],
        shouldEscalate: false,
      };
    }

    // Default Fallback
    return {
      answer: "I couldn't verify the answer from the available university information. I can create a support ticket or connect you with the appropriate support team.",
      confidenceScore: 0.0,
      sources: [],
      suggestedQuickReplies: ['Create Support Ticket', 'Contact Helpdesk'],
      shouldEscalate: true,
    };
  }
}
