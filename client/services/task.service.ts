import api from './api';
import { Task, TaskFilters } from '@/types/task';
import { ApiResponse } from '@/types/api';

interface TaskListResponse {
  tasks: Task[];
}

interface TaskDetailResponse {
  task: Task;
}

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);

    const response = await api.get<ApiResponse<TaskListResponse>>(`/tasks?${params.toString()}`);
    return response.data.data.tasks;
  },

  async getCompanyTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<TaskListResponse>>('/tasks/company/my-tasks');
    return response.data.data.tasks;
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<TaskDetailResponse>>(`/tasks/${id}`);
    return response.data.data.task;
  },

  async getRecommendedTasks(): Promise<Task[]> {
    const response = await api.get<ApiResponse<TaskListResponse>>('/tasks/recommended');
    return response.data.data.tasks;
  },

  async createTask(data: any): Promise<Task> {
    const response = await api.post<ApiResponse<TaskDetailResponse>>('/tasks', data);
    return response.data.data.task;
  },

  async updateTask(id: number, data: any): Promise<Task> {
    const response = await api.patch<ApiResponse<TaskDetailResponse>>(`/tasks/${id}`, data);
    return response.data.data.task;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};
