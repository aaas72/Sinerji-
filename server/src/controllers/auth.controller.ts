import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validation';
import { AppError } from '../utils/AppError';

const authService = new AuthService();
const isProduction = process.env.NODE_ENV === 'production';

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

const authCookieClearOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessages = (validation.error as any).errors.map((e: any) => e.message).join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const { user, token } = await authService.register(validation.data);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.cookie('token', token, authCookieOptions);

    res.status(201).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return next(new AppError('Invalid email or password format', 400));
    }

    const { user, token } = await authService.login(validation.data);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.cookie('token', token, authCookieOptions);

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('token', authCookieClearOptions);
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by the protect middleware
    const { password_hash, ...userWithoutPassword } = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

