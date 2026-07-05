import api from './api';
import { ApiResponse } from '@/types/api';

export interface Contact {
  id: number;
  name: string;
  role: string;
  initials: string;
  lastMessageTime: string;
  unread: number;
  imageUrl?: string | null;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const messageService = {
  async getContacts(): Promise<Contact[]> {
    const response = await api.get<ApiResponse<{ contacts: Contact[] }>>('/messages/contacts');
    return response.data.data.contacts;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>('/messages/unread-count');
    return response.data.data.unreadCount;
  },

  async getMessages(userId: number): Promise<Message[]> {
    const response = await api.get<ApiResponse<{ messages: Message[] }>>(`/messages/${userId}`);
    return response.data.data.messages;
  },

  async sendMessage(receiver_id: number, content: string): Promise<Message> {
    const response = await api.post<ApiResponse<{ message: Message }>>('/messages', { receiver_id, content });
    return response.data.data.message;
  },

  async deleteMessage(messageId: number): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  }
};
