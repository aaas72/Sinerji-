import api from './api';
import { Submission } from '@/types/submission';
import { ApiResponse } from '@/types/api';

interface SubmissionListResponse {
    submissions: Submission[];
}

interface SubmissionResponse {
    submission: Submission;
}

export const submissionService = {
    async getTaskSubmissions(taskId: number): Promise<Submission[]> {
        const response = await api.get<ApiResponse<SubmissionListResponse>>(`/submissions/task/${taskId}`);
        return response.data.data.submissions;
    },

    async getMySubmissions(): Promise<Submission[]> {
        const response = await api.get<ApiResponse<SubmissionListResponse>>(`/submissions/my`);
        return response.data.data.submissions;
    },

    async updateSubmission(submissionId: number, status: 'approved' | 'rejected'): Promise<Submission> {
        const response = await api.patch<ApiResponse<SubmissionResponse>>(`/submissions/${submissionId}`, { status });
        return response.data.data.submission;
    },
    async createSubmission(taskId: number, data: { submission_content: string; proposed_budget?: string; estimated_delivery_days?: number }): Promise<Submission> {
        const response = await api.post<ApiResponse<SubmissionResponse>>(`/submissions/task/${taskId}`, data);
        return response.data.data.submission;
    },
};
