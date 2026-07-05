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

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
    code: z.string().min(6, { message: 'Code must be at least 6 characters' }),
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface User {
    id: number;
    email: string;
    role: 'student' | 'company' | 'admin';
    studentProfile?: {
        user_id: number;
        full_name: string;
        university?: string | null;
        major?: string | null;
        bio?: string | null;
        profile_image_url?: string | null;
        is_verified?: boolean;
        last_verified_at?: string | null;
        university_email?: string | null;
        is_university_email_verified?: boolean;
        phone?: string | null;
        sub_merchant_key?: string | null;
    } | null;
    companyProfile?: {
        user_id: number;
        company_name: string;
        description?: string | null;
        logo_url?: string | null;
    } | null;
}

export interface AuthState {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
