import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const prisma = new PrismaClient();

type MatcherSkill = {
  name: string;
  level: number;
};

type MatcherJob = {
  id: string;
  location: string;
  max_budget?: number;
  required_skills: MatcherSkill[];
  required_languages: string[];
  description: string;
  alpha?: number;
};

type MatcherStudent = {
  id: string;
  location: string;
  expected_budget?: number;
  skills: MatcherSkill[];
  languages: string[];
  description: string;
};

type MatcherResponse = {
  job_id: string;
  matches: Array<{
    student_id: string;
    deterministic_score: number;
    semantic_score: number;
    final_score: number;
  }>;
};

// Matching Service to calculate match percentages between students and tasks
export class MatchingService {
  private readonly matchingServiceUrl = (process.env.MATCHING_SERVICE_URL || '').trim();
  private readonly matchingEndpoint = (process.env.MATCHING_SERVICE_ENDPOINT || '/api/v1/match').trim();
  private readonly matchingTimeoutMs = Number(process.env.MATCHING_SERVICE_TIMEOUT_MS || 5000);
  private readonly defaultAlpha = Number(process.env.MATCHING_DEFAULT_ALPHA || 0.6);

  private parseBudget(value?: string | null): number | undefined {
    if (!value) return undefined;
    const normalized = value.replace(/,/g, '.');
    const match = normalized.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!match) return undefined;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private normalizeScoreToPercentage(score: number): number {
    if (!Number.isFinite(score)) return 0;
    const scaled = score <= 1 ? score * 100 : score;
    return Math.max(0, Math.min(100, Math.round(scaled)));
  }

  private buildJobPayload(task: any): MatcherJob {
    const alpha = Number.isFinite(this.defaultAlpha)
      ? Math.max(0, Math.min(1, this.defaultAlpha))
      : 0.6;

    return {
      id: String(task.id),
      location: task.location || task.work_type || 'Remote',
      max_budget: this.parseBudget(task.budget) ?? this.parseBudget(task.reward_amount),
      required_skills: (task.requiredSkills || []).map((ts: any) => ({
        name: ts.skill.name,
        level: ts.level || 3,
      })),
      required_languages: [],
      description: [task.title, task.description, task.detail_title, task.detail_body]
        .filter(Boolean)
        .join(' '),
      alpha,
    };
  }

  private buildStudentPayload(student: any): MatcherStudent {
    return {
      id: String(student.user_id),
      location: student.availability_status || 'Remote',
      skills: (student.skills || []).map((s: any) => ({
        name: s.skill.name,
        level: s.level || 3,
      })),
      languages: [],
      description: [student.bio, student.major, student.categories_of_interest]
        .filter(Boolean)
        .join(' '),
    };
  }

  private getMatchUrl(): string {
    if (!this.matchingServiceUrl) {
      throw new AppError('MATCHING_SERVICE_URL is required to use matching microservice', 500);
    }

    const base = this.matchingServiceUrl.replace(/\/+$/, '');
    const endpoint = this.matchingEndpoint.startsWith('/')
      ? this.matchingEndpoint
      : `/${this.matchingEndpoint}`;

    return `${base}${endpoint}`;
  }

  private async requestMatcher(job: MatcherJob, students: MatcherStudent[]): Promise<MatcherResponse> {
    const matchUrl = this.getMatchUrl();
    if (students.length === 0) {
      throw new AppError('No students provided for matching request', 400);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.matchingTimeoutMs);

    try {
      const response = await fetch(matchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, students }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Matching service responded with ${response.status}`);
      }

      const body = (await response.json()) as MatcherResponse;
      if (!body || !Array.isArray(body.matches)) {
        throw new Error('Invalid response schema from matching microservice');
      }
      return body;
    } catch (error) {
      logger.error('Matching microservice call failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AppError('Matching microservice is unavailable or returned invalid response', 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getMatchPercentageForTaskAndStudent(task: any, student: any): Promise<number> {
    const jobPayload = this.buildJobPayload(task);
    const studentPayload = this.buildStudentPayload(student);
    const result = await this.requestMatcher(jobPayload, [studentPayload]);

    const score = result?.matches?.find((m) => m.student_id === String(student.user_id))?.final_score;
    if (typeof score !== 'number') {
      throw new AppError('Matching microservice response missing final score for student', 502);
    }

    return this.normalizeScoreToPercentage(score);
  }
  
  // Get tasks that match a student's skills
  async getRecommendedTasksForStudent(studentUserId: number) {
    const student = await prisma.studentProfile.findUnique({
      where: { user_id: studentUserId },
      include: { skills: { include: { skill: true } } }
    });

    if (!student) throw new AppError('Student profile not found', 404);

    const tasks = await prisma.task.findMany({
      where: { status: 'Open' },
      include: {
        company: { select: { company_name: true, logo_url: true } },
        requiredSkills: { include: { skill: true } }
      }
    });

    const matchedTasks = await Promise.all(tasks.map(async (task: any) => {
      const matchPercentage = await this.getMatchPercentageForTaskAndStudent(task, student);
      return { ...task, matchPercentage };
    }));

    return matchedTasks
      .filter((t: any) => t.matchPercentage > 0)
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }

  // Get students who match a task's required skills
  async getMatchingStudentsForTask(companyUserId: number, taskId: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId, company_user_id: companyUserId },
      include: { requiredSkills: { include: { skill: true } } }
    });

    if (!task) throw new AppError('Task not found or not authorized', 404);

    const taskSkillIds = task.requiredSkills.map((ts: any) => ts.skill_id);
    if (taskSkillIds.length === 0) return [];

    const students = await prisma.studentProfile.findMany({
      where: {
        skills: {
          some: {
            skill_id: { in: taskSkillIds }
          }
        }
      },
      include: {
        skills: { include: { skill: true } },
        user: { select: { email: true } }
      }
    });

    const jobPayload = this.buildJobPayload(task);
    const studentPayloads = students.map((student) => this.buildStudentPayload(student));
    const matcherResult = await this.requestMatcher(jobPayload, studentPayloads);

    const scoreMap = new Map<string, number>();
    matcherResult?.matches?.forEach((match) => {
      scoreMap.set(match.student_id, this.normalizeScoreToPercentage(match.final_score));
    });

    const matchedStudents = students.map((student: any) => {
      const matchPercentage = scoreMap.get(String(student.user_id)) ?? 0;
      return { ...student, matchPercentage };
    });

    return matchedStudents
      .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage);
  }
}
