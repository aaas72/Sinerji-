import { Request, Response, NextFunction } from 'express';
import { SupportService } from '../services/support.service';
import { AppError } from '../utils/AppError';

const supportService = new SupportService();

export class SupportController {
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { subject, message } = req.body;

      if (!subject || !message) {
        throw new AppError('Subject and message are required', 400);
      }

      const ticket = await supportService.createTicket(userId, { subject, message });

      res.status(201).json({
        status: 'success',
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const tickets = await supportService.getMyTickets(userId);

      res.status(200).json({
        status: 'success',
        data: { tickets },
      });
    } catch (error) {
      next(error);
    }
  }
}
