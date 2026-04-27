import api from './api';
import { ApiResponse } from '@/types/api';

export interface Review {
  submission_id: number;
  rating: number;
  feedback: string;
}

export const reviewService = {
  async createReview(submissionId: number, data: { rating: number; feedback: string }): Promise<Review> {
    const response = await api.post<ApiResponse<{ review: Review }>>(`/reviews/${submissionId}`, data);
    return response.data.data.review;
  },

  async getReview(submissionId: number): Promise<Review | null> {
    try {
      const response = await api.get<ApiResponse<{ review: Review }>>(`/reviews/${submissionId}`);
      return response.data.data.review;
    } catch {
      return null;
    }
  },
};
