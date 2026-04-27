import api from './api';
import { StudentProfile, UpdateProfileData } from '@/types/student';
import { ApiResponse } from '@/types/api';

interface ProfileData {
  profile: StudentProfile;
}

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

interface StatsData {
  stats: StudentStats;
}

export const studentService = {
  async getProfile(): Promise<StudentProfile> {
    const response = await api.get<ApiResponse<ProfileData>>('/students/me');
    return response.data.data.profile;
  },

  async updateProfile(data: UpdateProfileData): Promise<StudentProfile> {
    const response = await api.patch<ApiResponse<ProfileData>>('/students/me', data);
    return response.data.data.profile;
  },

  async addSkill(skillName: string, category: string, level: number): Promise<StudentProfile> {
    const response = await api.post<ApiResponse<ProfileData>>('/students/skills', { skillName, category, level });
    return response.data.data.profile;
  },

  async removeSkill(skillId: number): Promise<StudentProfile> {
    const response = await api.delete<ApiResponse<ProfileData>>(`/students/skills/${skillId}`);
    return response.data.data.profile;
  },

  async getMyStats(): Promise<StudentStats> {
    const response = await api.get<ApiResponse<StatsData>>('/students/me/stats');
    return response.data.data.stats;
  },

  async getSavedTasks(): Promise<any[]> {
    const response = await api.get<ApiResponse<{ tasks: any[] }>>('/students/saved-tasks');
    return response.data.data.tasks;
  },

  async saveTask(taskId: number): Promise<void> {
    await api.post(`/students/tasks/${taskId}/save`);
  },

  async unsaveTask(taskId: number): Promise<void> {
    await api.delete(`/students/tasks/${taskId}/save`);
  }
};
