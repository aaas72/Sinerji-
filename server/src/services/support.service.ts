// Support service for handling tickets
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export class SupportService {
  async createTicket(userId: number, data: { subject: string; message: string }) {
    return prisma.supportTicket.create({
      data: {
        user_id: userId,
        subject: data.subject,
        message: data.message,
      },
    });
  }

  async getMyTickets(userId: number) {
    return prisma.supportTicket.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
