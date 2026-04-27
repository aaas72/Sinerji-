import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import companyRoutes from './routes/company.routes';
import taskRoutes from './routes/task.routes';
import submissionRoutes from './routes/submission.routes';
import reviewRoutes from './routes/review.routes';
import badgeRoutes from './routes/badge.routes';
import recommendationRoutes from './routes/recommendation.routes';
import skillRoutes from './routes/skill.routes';
import publicRoutes from './routes/public.routes';
import supportRoutes from './routes/support.routes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Explicitly allow frontend origin
    credentials: true
}));
app.use(helmet());

// Request logger for debugging
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Logger integration with Morgan
const stream = {
    write: (message: string) => logger.info(message.trim()),
};
app.use(morgan('combined', { stream }));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/support', supportRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Backend API' });
});

// Health Check
app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.$connect();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        logger.error('Database connection failed', error);
        next(new AppError('Database connection failed', 500));
    }
});

// Handle undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // process.exit(1); // Keep it alive for debugging
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Keep process alive just in case
// setInterval(() => {}, 10000);

export default app;
