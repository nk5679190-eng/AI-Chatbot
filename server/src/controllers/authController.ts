import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'AGENT', 'ADMIN']).optional().default('STUDENT'),
  studentId: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.parse(req.body);

      const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered.' });
      }

      const passwordHash = await bcrypt.hash(parsed.password, 10);

      const user = await prisma.user.create({
        data: {
          email: parsed.email,
          password: passwordHash,
          name: parsed.name,
          role: parsed.role,
          studentId: parsed.studentId,
          phone: parsed.phone,
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId },
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.errors ? err.errors[0].message : err.message });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email: parsed.email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isValid = await bcrypt.compare(parsed.password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId, avatar: user.avatar },
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, studentId: true, phone: true, avatar: true },
    });

    return res.json({ user });
  }
}
