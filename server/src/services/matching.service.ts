import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const DEFAULT_MATCHING_SERVICE_URL = 'http://localhost:8001';

type ScoreStudentTaskResponse = {
  task_id: number;
  student_user_id: number;
  score: number;
  hard_score?: number;
  semantic_score?: number;
  breakdown?: Record<string, number>;
  reasons?: string[];
  top_projects?: Array<{ task_id: number; title: string; similarity: number }>;
  missing_skills?: string[];
};

type RankTaskCandidatesResponse = {
  task_id: number;
  alpha?: number;
  top_k?: number;
  min_score?: number;
  filtered_out?: number;
  candidates: Array<{
    student_user_id: number;
    score: number;
    hard_score?: number;
    semantic_score?: number;
    breakdown?: Record<string, number>;
    reasons?: string[];
    top_projects?: Array<{ task_id: number; title: string; similarity: number }>;
    missing_skills?: string[];
  }>;
};

type RecommendTasksResponse = {
  student_user_id: number;
  alpha?: number;
  top_k?: number;
  min_score?: number;
  tasks: Array<{
    task_id: number;
    score: number;
    hard_score?: number;
    semantic_score?: number;
    breakdown?: Record<string, number>;
    reasons?: string[];
    top_projects?: Array<{ task_id: number; title: string; similarity: number }>;
    missing_skills?: string[];
  }>;
};

// Matching Service to calculate match percentages between students and tasks
export class MatchingService {
  private readonly configuredMatchingServiceUrl = (process.env.MATCHING_SERVICE_URL || '').trim();
  private readonly matchingTimeoutMs = Number(process.env.MATCHING_SERVICE_TIMEOUT_MS || 5000);
  private readonly matchingAlpha = process.env.MATCHING_ALPHA ? Number(process.env.MATCHING_ALPHA) : undefined;
  private readonly matchingTopK = process.env.MATCHING_TOP_K ? Number(process.env.MATCHING_TOP_K) : undefined;
  private readonly matchingMinScore = process.env.MATCHING_MIN_SCORE ? Number(process.env.MATCHING_MIN_SCORE) : undefined;
  private hasWarnedDefaultMatchingUrl = false;

  private buildRuntimeConfig() {
    const config: { alpha?: number; top_k?: number; min_score?: number } = {};

    if (Number.isFinite(this.matchingAlpha)) {
      config.alpha = Math.max(0, Math.min(1, Number(this.matchingAlpha)));
    }
    if (Number.isFinite(this.matchingTopK) && Number(this.matchingTopK) > 0) {
      config.top_k = Math.floor(Number(this.matchingTopK));
    }
    if (Number.isFinite(this.matchingMinScore)) {
      config.min_score = Math.max(0, Math.min(100, Number(this.matchingMinScore)));
    }

    return config;
  }

  private normalizeScoreToPercentage(score: number): number {
    if (!Number.isFinite(score)) return 0;
    const scaled = score <= 1 ? score * 100 : score;
    return Math.max(0, Math.min(100, Math.round(scaled)));
  }

  private getBaseUrl(): string {
    const resolvedUrl = this.configuredMatchingServiceUrl || DEFAULT_MATCHING_SERVICE_URL;

    if (!this.configuredMatchingServiceUrl && !this.hasWarnedDefaultMatchingUrl) {
      logger.warn(`MATCHING_SERVICE_URL is not set. Falling back to ${DEFAULT_MATCHING_SERVICE_URL}`);
      this.hasWarnedDefaultMatchingUrl = true;
    }

    if (!/^https?:\/\//i.test(resolvedUrl)) {
      throw new AppError('MATCHING_SERVICE_URL must start with http:// or https://', 500);
    }

    return resolvedUrl.replace(/\/+$/, '');
  }

  private async postJson<TResponse>(endpoint: string, body: unknown): Promise<TResponse> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.matchingTimeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Matching service responded with ${response.status} for ${endpoint}`);
      }

      return (await response.json()) as TResponse;
    } catch (error) {
      logger.error('Matching microservice call failed', {
        url,
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AppError('Matching microservice is unavailable or returned invalid response', 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getMatchPercentageForTaskAndStudent(task: any, student: any): Promise<number> {
    const taskId = Number(task?.id);
    const studentUserId = Number(student?.user_id);

    if (!Number.isFinite(taskId) || !Number.isFinite(studentUserId)) {
      throw new AppError('Invalid task or student payload for matching', 400);
    }

    const response = await this.postJson<ScoreStudentTaskResponse>(
      '/api/v1/match/score-student-task',
      {
        task_id: taskId,
        student_user_id: studentUserId,
        ...this.buildRuntimeConfig(),
      }
    );

    if (typeof response?.score !== 'number') {
      throw new AppError('Matching microservice response missing final score for student', 502);
    }

    return this.normalizeScoreToPercentage(response.score);
  }
  
  // Get tasks that match a student's skills
  async getRecommendedTasksForStudent(studentUserId: number) {
    const recommendation = await this.postJson<RecommendTasksResponse>(
      '/api/v1/match/recommend-tasks',
      {
        student_user_id: studentUserId,
        ...this.buildRuntimeConfig(),
      }
    );

    const rankedTaskIds = recommendation?.tasks?.map((t) => t.task_id) || [];
    if (rankedTaskIds.length === 0) {
      return [];
    }

    const scoreMap = new Map<number, number>();
    recommendation.tasks.forEach((item) => {
      scoreMap.set(item.task_id, this.normalizeScoreToPercentage(item.score));
    });

    const tasks = await prisma.task.findMany({
      where: { id: { in: rankedTaskIds } },
      include: {
        company: { select: { company_name: true, logo_url: true } },
        requiredSkills: { include: { skill: true } }
      }
    });

    return tasks
      .map((task: any) => ({ ...task, matchPercentage: scoreMap.get(task.id) ?? 0 }))
      .filter((task: any) => task.matchPercentage > 0)
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }

  // Get students who match a task's required skills
  async getMatchingStudentsForTask(companyUserId: number, taskId: number) {
    const ranking = await this.postJson<RankTaskCandidatesResponse>(
      '/api/v1/match/rank-task-candidates',
      {
        task_id: taskId,
        company_user_id: companyUserId,
        ...this.buildRuntimeConfig(),
      }
    );

    const rankedStudentIds = ranking?.candidates?.map((candidate) => candidate.student_user_id) || [];
    if (rankedStudentIds.length === 0) {
      return [];
    }

    const scoreMap = new Map<number, number>();
    ranking.candidates.forEach((candidate) => {
      scoreMap.set(candidate.student_user_id, this.normalizeScoreToPercentage(candidate.score));
    });

    const students = await prisma.studentProfile.findMany({
      where: {
        user_id: { in: rankedStudentIds },
      },
      include: {
        skills: { include: { skill: true } },
        user: { select: { email: true } }
      }
    });

    const matchedStudents = students.map((student: any) => {
      const matchPercentage = scoreMap.get(student.user_id) ?? 0;
      return { ...student, matchPercentage };
    });

    return matchedStudents
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }
}
