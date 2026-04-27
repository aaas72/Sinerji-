import api from './api';
import { LoginFormData, RegisterFormData, User } from '@/types/auth';
import { ApiResponse } from '@/types/api';

// Define the specific data structure returned inside the "data" field of the response
interface AuthData {
    user: User;
}

export const authService = {
    async login(data: LoginFormData): Promise<{ user: User }> {
        // The generic ApiResponse<T> wraps the AuthData
        const response = await api.post<ApiResponse<AuthData>>('/auth/login', data);

        return {
            user: response.data.data.user,
        };
    },

    async register(data: RegisterFormData): Promise<{ user: User }> {
        const response = await api.post<ApiResponse<AuthData>>('/auth/register', data);
        return {
            user: response.data.data.user,
        };
    },

    async logout() {
        await api.post('/auth/logout');
    },

    async getMe(): Promise<User> {
        const response = await api.get<ApiResponse<AuthData>>('/auth/me');
        return response.data.data.user;
    },

    async changePassword(current: string, next: string): Promise<void> {
        await api.post('/auth/change-password', { current, next });
    }
};

