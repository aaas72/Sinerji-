import api from './api';
import { CompanyProfile } from '@/types/company';
import { ApiResponse } from '@/types/api';
import { Task } from '@/types/task';

interface CompanyProfileResponse {
  profile: CompanyProfile;
}

interface CompanyTasksResponse {
  tasks: Task[];
}

interface CompanyStats {
  activeTasks: number;
  totalTasks: number;
  totalApplications: number;
  pendingApplications: number;
  hiredStudents: number;
  recentTasks: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    _count: {
      submissions: number;
    };
  }[];
  recentApplications: {
    id: number;
    status: string;
    submitted_at: string;
    task: {
      title: string;
    };
    student: {
      full_name: string;
      user: {
        email: string;
      };
    };
  }[];
}

interface CompanyStatsResponse {
  stats: CompanyStats;
}

export const companyService = {
  async getCompanyById(id: number): Promise<CompanyProfile> {
    // Assuming backend has GET /companies/:id (public)
    // We might need to implement this in backend if not exists.
    // Currently we have GET /companies/me (protected).
    // We need a public endpoint.
    const response = await api.get<ApiResponse<CompanyProfileResponse>>(`/companies/${id}`);
    return response.data.data.profile;
  },

  async getCompanyTasks(id: number): Promise<Task[]> {
    const response = await api.get<ApiResponse<CompanyTasksResponse>>(`/tasks/company/${id}`);
    return response.data.data.tasks;
  },

  async getMyProfile(): Promise<CompanyProfile> {
    const response = await api.get<ApiResponse<CompanyProfileResponse>>('/companies/me');
    return response.data.data.profile;
  },

  async updateMyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const response = await api.patch<ApiResponse<CompanyProfileResponse>>('/companies/me', data);
    return response.data.data.profile;
  },

  async getMyStats(): Promise<CompanyStats> {
    const response = await api.get<ApiResponse<CompanyStatsResponse>>('/companies/me/stats');
    return response.data.data.stats;
  }
};
