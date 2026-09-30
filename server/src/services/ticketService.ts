import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTicketDTO {
  studentId: string;
  title: string;
  description: string;
  category: string;
  priority?: string; // LOW, MEDIUM, HIGH, URGENT
  departmentId?: string;
  conversationId?: string;
}

export class TicketService {
  // Map query category to department code
  private static mapCategoryToDepartmentCode(category: string): string {
    const map: Record<string, string> = {
      'Admissions': 'ADM',
      'Fees and Payments': 'FIN',
      'Examinations and Results': 'EXM',
      'Attendance': 'ACA',
      'Timetable and Academic Calendar': 'ACA',
      'Courses and Curriculum': 'ACA',
      'Scholarships and Financial Aid': 'FIN',
      'Hostel and Accommodation': 'HST',
      'Library': 'GEN',
      'Transport': 'GEN',
      'Technical Support': 'IT',
      'Contact University Departments': 'GEN',
    };
    return map[category] || 'GEN';
  }

  public static async createTicket(dto: CreateTicketDTO) {
    // Generate ticket number
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TICK-${1000 + count + 1}`;

    // Resolve department
    let deptId = dto.departmentId;
    if (!deptId) {
      const code = this.mapCategoryToDepartmentCode(dto.category);
      const dept = await prisma.department.findUnique({ where: { code } });
      deptId = dept ? dept.id : (await prisma.department.findFirst())?.id;
    }

    if (!deptId) {
      throw new Error('No department available to route ticket.');
    }

    // Check if an available agent exists in this department
    const availableAgent = await prisma.supportAgent.findFirst({
      where: { departmentId: deptId, isAvailable: true },
      orderBy: { activeTicketCount: 'asc' },
    });

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority || 'MEDIUM',
        status: availableAgent ? 'ASSIGNED' : 'OPEN',
        departmentId: deptId,
        studentId: dto.studentId,
        assignedAgentId: availableAgent ? availableAgent.id : null,
        conversationId: dto.conversationId || null,
      },
      include: {
        department: true,
        student: { select: { id: true, name: true, email: true, studentId: true } },
        assignedAgent: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    // Create initial status history entry
    await prisma.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        previousStatus: null,
        newStatus: availableAgent ? 'ASSIGNED' : 'OPEN',
        changedById: dto.studentId,
        note: availableAgent ? `Ticket created & auto-assigned to ${availableAgent.id}` : 'Ticket created and queued for department assignment.',
      },
    });

    if (availableAgent) {
      await prisma.supportAgent.update({
        where: { id: availableAgent.id },
        data: { activeTicketCount: { increment: 1 } },
      });

      // Send notification record to agent user
      await prisma.notificationRecord.create({
        data: {
          recipientId: availableAgent.userId,
          type: 'NEW_ASSIGNMENT',
          title: `New Ticket Assigned: ${ticketNumber}`,
          message: `Ticket "${dto.title}" has been assigned to you. Priority: ${ticket.priority}`,
        },
      });
    }

    return ticket;
  }

  public static async updateTicketStatus(ticketId: string, newStatus: string, changedById: string, note?: string) {
    const existing = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!existing) {
      throw new Error('Ticket not found');
    }

    const previousStatus = existing.status;
    const isResolving = newStatus === 'RESOLVED' || newStatus === 'CLOSED';

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        resolvedAt: isResolving ? new Date() : existing.resolvedAt,
      },
      include: {
        department: true,
        student: { select: { id: true, name: true, email: true } },
        assignedAgent: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    // History Log
    await prisma.ticketStatusHistory.create({
      data: {
        ticketId,
        previousStatus,
        newStatus,
        changedById,
        note: note || `Status updated to ${newStatus}`,
      },
    });

    // Notify student
    await prisma.notificationRecord.create({
      data: {
        recipientId: existing.studentId,
        type: 'TICKET_UPDATE',
        title: `Ticket Status Update: ${existing.ticketNumber}`,
        message: `Your ticket "${existing.title}" status changed to ${newStatus}.`,
      },
    });

    return updated;
  }
}
