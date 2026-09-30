import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  category: z.string(),
  keywords: z.string(),
  priority: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true),
});

export class FAQController {
  public static async list(req: Request, res: Response) {
    try {
      const { category, search, publishedOnly } = req.query;

      const where: any = {};
      if (publishedOnly === 'true' || publishedOnly === undefined) {
        where.isPublished = true;
      }

      if (category && typeof category === 'string' && category !== 'All') {
        where.category = category;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { question: { contains: search } },
          { answer: { contains: search } },
          { keywords: { contains: search } },
        ];
      }

      const faqs = await prisma.fAQ.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { views: 'desc' }],
      });

      return res.json({ faqs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const faq = await prisma.fAQ.findUnique({ where: { id } });
      if (!faq) return res.status(404).json({ error: 'FAQ not found' });
      return res.json({ faq });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const parsed = faqSchema.parse(req.body);
      const faq = await prisma.fAQ.create({ data: parsed });
      return res.status(201).json({ faq });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = faqSchema.partial().parse(req.body);
      const faq = await prisma.fAQ.update({ where: { id }, data: parsed });
      return res.json({ faq });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.fAQ.delete({ where: { id } });
      return res.json({ message: 'FAQ deleted successfully' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
