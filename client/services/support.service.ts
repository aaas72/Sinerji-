import api from './api';
import { ApiResponse } from '@/types/api';

export interface SupportTicket {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export const supportService = {
  async createTicket(data: { subject: string; message: string }): Promise<SupportTicket> {
    const response = await api.post<ApiResponse<{ ticket: SupportTicket }>>('/support', data);
    return response.data.data.ticket;
  },

  async getMyTickets(): Promise<SupportTicket[]> {
    const response = await api.get<ApiResponse<{ tickets: SupportTicket[] }>>('/support');
    return response.data.data.tickets;
  },
};
