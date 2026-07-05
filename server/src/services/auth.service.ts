import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { registerSchema, loginSchema } from '../utils/validation';
import { z } from 'zod';



export class AuthService {
  async register(data: z.infer<typeof registerSchema>) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user with transaction to ensure profile is created
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          role: data.role,
        },
      });

      if (data.role === 'student') {
        if (!data.full_name) throw new AppError('Full name required for student', 400);
        await tx.studentProfile.create({
          data: {
            user_id: newUser.id,
            full_name: data.full_name,
            university: data.university,
          },
        });
      } else if (data.role === 'company') {
        if (!data.company_name) throw new AppError('Company name required for company', 400);
        await tx.companyProfile.create({
          data: {
            user_id: newUser.id,
            company_name: data.company_name,
            description: data.description,
            website_url: data.website_url,
          },
        });
      }

      const fullUser = await tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          studentProfile: true,
          companyProfile: true,
        }
      });
      return fullUser;
    });

    const token = signToken(result!.id, result!.role);

    return { user: result!, token };
  }

  async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        studentProfile: true,
        companyProfile: true,
      }
    });

    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new AppError('Incorrect email or password', 401);
    }

    const token = signToken(user.id, user.role);

    return { user, token };
  }

  async changePassword(userId: number, data: { current: string; next: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !(await bcrypt.compare(data.current, user.password_hash))) {
      throw new AppError('Incorrect current password', 401);
    }

    const newPasswordHash = await bcrypt.hash(data.next, 12);

    return prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });
  }
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.', 404);
    }

    // Generate 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetCode,
        reset_password_expires: expires
      }
    });

    const { sendPasswordResetEmail } = require('./email.service');
    await sendPasswordResetEmail(email, resetCode);
    
    return true;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Geçersiz veya süresi dolmuş kod.', 400);
    }

    if (user.reset_password_token !== code || !user.reset_password_expires || user.reset_password_expires < new Date()) {
      throw new AppError('Geçersiz veya süresi dolmuş kod.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        reset_password_token: null,
        reset_password_expires: null
      }
    });

    return true;
  }
}
