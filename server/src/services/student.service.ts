// Student service for profile and task management
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { updateStudentProfileSchema, addSkillSchema } from '../utils/validation';
import { z } from 'zod';

const prisma = new PrismaClient() as any;

export class StudentService {
  async getProfile(userId: number) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        recommendations: {
          include: {
            company: true,
          },
        },
        submissions: {
          where: {
            status: 'approved',
          },
          include: {
            task: {
              include: {
                company: true,
              },
            },
            review: true,
          },
        },
        user: {
          select: {
            email: true,
            role: true,
            created_at: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    return profile;
  }

  async updateProfile(userId: number, data: z.infer<typeof updateStudentProfileSchema>) {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new AppError('Student profile not found', 404);
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { user_id: userId },
      data: {
        ...data,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return updatedProfile;
  }

  async addSkill(userId: number, skillName: string, category: string = "General", level: number = 3) {
    // Check if skill exists, if not create it
    let skill = await prisma.skill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: { name: skillName },
      });
    }

    // Check if student already has this skill
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skill.id,
        },
      },
    });

    if (existingStudentSkill) {
      // Update category if it exists but user wants to change/re-add it? 
      // Or just throw error?
      // Let's allow updating category if it exists
      await prisma.studentSkill.update({
        where: {
          student_user_id_skill_id: {
            student_user_id: userId,
            skill_id: skill.id,
          }
        },
        data: { category, level }
      });
    } else {
      // Add skill to student
      await prisma.studentSkill.create({
        data: {
          student_user_id: userId,
          skill_id: skill.id,
          category,
          level,
        },
      });
    }

    return this.getProfile(userId);
  }

  async removeSkill(userId: number, skillId: number) {
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skillId,
        },
      },
    });

    if (!existingStudentSkill) {
      throw new AppError('Skill not found in student profile', 404);
    }

    await prisma.studentSkill.delete({
      where: {
        student_user_id_skill_id: {
          student_user_id: userId,
          skill_id: skillId,
        },
      },
    });

    return this.getProfile(userId);
  }

  async getStats(userId: number) {
    const completedTasksCount = await prisma.submission.count({
      where: {
        student_user_id: userId,
        status: 'approved',
      },
    });

    const totalApplicationsCount = await prisma.submission.count({
      where: {
        student_user_id: userId,
      },
    });

    // Calculate average rating from reviews on student's submissions
    const reviews = await prisma.review.aggregate({
      where: {
        submission: {
          student_user_id: userId,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const badgesEarnedCount = await prisma.awardedBadge.count({
      where: {
        review: {
          submission: {
            student_user_id: userId,
          },
        },
      },
    });

    return {
      completedTasks: completedTasksCount,
      totalApplications: totalApplicationsCount,
      averageRating: reviews._avg.rating || 0,
      badgesEarned: badgesEarnedCount,
    };
  }

  async saveTask(userId: number, taskId: number) {
    return prisma.savedTask.upsert({
      where: {
        student_user_id_task_id: {
          student_user_id: userId,
          task_id: taskId,
        },
      },
      update: {},
      create: {
        student_user_id: userId,
        task_id: taskId,
      },
    });
  }

  async unsaveTask(userId: number, taskId: number) {
    return prisma.savedTask.delete({
      where: {
        student_user_id_task_id: {
          student_user_id: userId,
          task_id: taskId,
        },
      },
    });
  }

  async getSavedTasks(userId: number) {
    const saved = await prisma.savedTask.findMany({
      where: { student_user_id: userId },
      include: {
        task: {
          include: {
            company: true,
            requiredSkills: {
              include: { skill: true }
            }
          }
        }
      },
      orderBy: { saved_at: 'desc' }
    });
    return saved.map((s: any) => s.task);
  }
}
