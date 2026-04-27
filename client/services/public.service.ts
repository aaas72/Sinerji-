import api from './api';

export interface PublicStats {
    students: number;
    companies: number;
    tasks: number;
    badges: number;
}

export interface PublicTask {
    id: number;
    title: string;
    company: string;
    skills: string[];
}

export const publicService = {
    getStats: async (): Promise<PublicStats> => {
        const response = await api.get('/public/stats');
        return response.data;
    },
    getLatestTasks: async (): Promise<PublicTask[]> => {
        const response = await api.get('/public/tasks');
        return response.data;
    }
};
