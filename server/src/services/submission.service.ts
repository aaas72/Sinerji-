import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { createSubmissionSchema } from '../utils/validation';
import { z } from 'zod';
import { MatchingService } from './matching.service';

const prisma = new PrismaClient();
const matchingService = new MatchingService();

export class SubmissionService {
  async createSubmission(studentId: number, taskId: number, data: z.infer<typeof createSubmissionSchema>) {
    // Check if task exists and is open
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { requiredSkills: { include: { skill: true } } }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.status !== 'Open' && task.status !== 'open') {
      throw new AppError('Task is not open for submissions', 400);
    }

    // Enforce Student Profile Completion requirements
    const student = await prisma.studentProfile.findUnique({
      where: { user_id: studentId },
      include: { skills: { include: { skill: true } } }
    });

    if (!student) {
        throw new AppError('Student profile not found', 404);
    }

    const hasPortfolio = Boolean(student.github_url || student.website_url);
    if (!student.major || !student.graduation_year || student.skills.length === 0 || !hasPortfolio) {
        throw new AppError('Profiliniz eksik. Lütfen yeteneklerinizi, okul bilgilerinizi ve portfolyo/github linkinizi sisteme ekleyin.', 400);
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        task_id: taskId,
        student_user_id: studentId,
      },
    });

    if (existingSubmission) {
      throw new AppError('You have already submitted to this task', 400);
    }

     // Calculate AI Match Score via Python matching microservice with local fallback
     const aiMatchScore = await matchingService.getMatchPercentageForTaskAndStudent(task, student);

    // Create Submission
    const submission = await prisma.submission.create({
      data: {
        task_id: taskId,
        student_user_id: studentId,
        submission_content: data.submission_content,
        proposed_budget: data.proposed_budget,
        estimated_delivery_days: data.estimated_delivery_days,
        ai_match_score: aiMatchScore,
        status: 'pending',
      },
      include: {
        task: true,
        student: true
      }
    });

    return submission;
  }

  async getSubmissionById(id: number) {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        task: true,
        student: {
            include: {
                user: {
                    select: { email: true }
                }
            }
        },
        review: {
            include: {
                awardedBadges: {
                    include: {
                        badge: true
                    }
                }
            }
        }
      },
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    return submission;
  }

  async getTaskSubmissions(taskId: number, companyUserId: number) {
      // Verify task belongs to company
      const task = await prisma.task.findUnique({
          where: { id: taskId }
      });
      
      if (!task) throw new AppError('Task not found', 404);
      if (task.company_user_id !== companyUserId) {
          throw new AppError('Not authorized to view these submissions', 403);
      }

      return prisma.submission.findMany({
          where: { task_id: taskId },
          include: {
              student: {
                  include: {
                      user: { select: { email: true } }
                  }
              },
              review: true
          }
      });
  }
  
  async getMySubmissions(studentUserId: number) {
      return prisma.submission.findMany({
          where: { student_user_id: studentUserId },
          include: {
              task: {
                  include: {
                      company: true
                  }
              },
              review: true
          }
      });
  }

  async updateSubmissionStatus(submissionId: number, companyUserId: number, status: 'approved' | 'rejected') {
      const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: { task: true }
      });

      if (!submission) throw new AppError('Submission not found', 404);
      if (submission.task.company_user_id !== companyUserId) {
          throw new AppError('Not authorized to update this submission', 403);
      }

      return prisma.submission.update({
          where: { id: submissionId },
          data: { status },
          include: {
              student: {
                  include: { user: { select: { email: true } } }
              },
              review: true
          }
      });
  }
}
