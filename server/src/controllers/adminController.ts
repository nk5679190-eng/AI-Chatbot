import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class AdminController {
  // Departments
  public static async listDepartments(req: Request, res: Response) {
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { agents: true, tickets: true } },
      },
    });
    return res.json({ departments });
  }

  public static async createDepartment(req: Request, res: Response) {
    try {
      const { name, code, description, email } = req.body;
      const dept = await prisma.department.create({
        data: { name, code, description, email },
      });
      return res.status(201).json({ department: dept });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Agents
  public static async listAgents(req: Request, res: Response) {
    const agents = await prisma.supportAgent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        department: true,
      },
    });
    return res.json({ agents });
  }

  public static async createAgent(req: Request, res: Response) {
    try {
      const { name, email, password, departmentId, phone } = req.body;

      const passwordHash = await bcrypt.hash(password || 'Agent@123', 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          name,
          role: 'AGENT',
          phone,
        },
      });

      const agent = await prisma.supportAgent.create({
        data: {
          userId: user.id,
          departmentId,
        },
        include: { user: true, department: true },
      });

      return res.status(201).json({ agent });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Integrations & Settings
  public static async getConfigs(req: Request, res: Response) {
    const configs = await prisma.integrationConfig.findMany();
    const configMap: Record<string, string> = {};
    configs.forEach((c) => {
      configMap[c.key] = c.value;
    });
    return res.json({ configs: configMap });
  }

  public static async updateConfigs(req: Request, res: Response) {
    try {
      const updates: Record<string, string> = req.body;
      for (const [key, value] of Object.entries(updates)) {
        await prisma.integrationConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
      return res.json({ message: 'Configurations updated successfully' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
