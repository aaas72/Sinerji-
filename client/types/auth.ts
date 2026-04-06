import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const registerSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['student', 'company'], { message: 'Role is required' }),
    full_name: z.string().optional(),
    university: z.string().optional(),
    company_name: z.string().optional(),
    website_url: z.string().url().optional(),
}).refine((data) => {
    if (data.role === 'student' && !data.full_name) return false;
    if (data.role === 'company' && !data.company_name) return false;
    return true;
}, {
    message: "Full name is required for students, Company name is required for companies",
    path: ["role"]
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface User {
    id: number;
    email: string;
    role: 'student' | 'company' | 'admin';
}

export interface AuthState {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
