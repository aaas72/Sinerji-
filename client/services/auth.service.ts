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
    }
};
