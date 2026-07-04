import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { createSubmissionSchema } from '../utils/validation';
import { z } from 'zod';
import { MatchingService } from './matching.service';
import { MailService } from './mail.service';
import axios from 'axios';
import crypto from 'crypto';

const matchingService = new MatchingService();
const mailService = new MailService();

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

    if (task.deadline && new Date(task.deadline) < new Date()) {
      throw new AppError('Görev başvuru süresi dolmuştur.', 400);
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

    if (!student.is_verified) {
        throw new AppError('Hesabınız doğrulanmamış. Lütfen başvurmadan önce e-Devlet Öğrenci Belgeniz ile profilinizi doğrulayın.', 403);
    }

    if (task.reward_type === 'money' && !student.sub_merchant_key) {
        throw new AppError('Banka hesap (IBAN) bilgileriniz girilmemiş. Lütfen başvurmadan önce profil ayarlarınızdan IBAN adresinizi tanımlayın.', 400);
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

    // Try to get match analysis, but don't fail if the microservice is down.
    let aiAnalysis;
    try {
        aiAnalysis = await matchingService.getMatchAnalysis(task, student);
    } catch (e: any) {
        console.warn('[MatchingService] Could not get match analysis:', e.message);
        aiAnalysis = { score: 0, reason: 'Matching service unavailable' };
    }

    // Create Submission
    const submission = await prisma.submission.create({
      data: {
        task_id: taskId,
        student_user_id: studentId,
        submission_content: data.submission_content,
        proposed_budget: data.proposed_budget,
        estimated_delivery_days: data.estimated_delivery_days,
        ai_match_score: aiAnalysis.score,
        ai_match_details: aiAnalysis as any,
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
                      company: true,
                      requiredSkills: {
                          include: {
                              skill: true
                          }
                      }
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
      if (status === 'approved') {
          if (submission.status !== 'submitted') {
              throw new AppError('Çalışma henüz teslim edilmediği için onaylanamaz ve ödeme serbest bırakılamaz.', 400);
          }
      }

      let paymentStatusUpdate = undefined;
      
      if (status === 'approved' && submission.payment_status === 'escrow_locked' && submission.payment_transaction_id) {
          const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
          
          try {
              const releaseResponse = await axios.post(`${paymentServiceUrl}/api/payments/release`, {
                  paymentTransactionId: submission.payment_transaction_id
              });
              
              if (!releaseResponse.data || !releaseResponse.data.success) {
                  throw new AppError(releaseResponse.data?.error || 'Ödeme serbest bırakılamadı.', 400);
              }
              
              paymentStatusUpdate = 'released';
          } catch (error: any) {
              if (error instanceof AppError) throw error;
              const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown network error';
              throw new AppError(`Ödeme serbest bırakma işlemi microservice tarafında başarısız oldu: ${errMsg}`, error.response?.status || 502);
          }
      } else if (status === 'rejected' && submission.payment_status === 'escrow_locked' && submission.payment_transaction_id) {
          await this.cancelPayment(submission.payment_transaction_id);
          paymentStatusUpdate = 'cancelled';
      }

      let guaranteeTokenUpdate: string | undefined = undefined;
      const validRewardTypes = ['Internship', 'Certificate', 'Recommendation', 'internship', 'certificate', 'recommendation'];
      if (status === 'approved' && submission.task.reward_type && validRewardTypes.includes(submission.task.reward_type)) {
          guaranteeTokenUpdate = crypto.randomUUID();
      }

      const updatedSubmission = await prisma.submission.update({
          where: { id: submissionId },
          data: { 
              status,
              completion_status: status === 'approved' ? 'completed' : (status === 'rejected' ? 'disputed' : undefined),
              ...(paymentStatusUpdate ? { payment_status: paymentStatusUpdate } : {}),
              ...(guaranteeTokenUpdate ? { guarantee_token: guaranteeTokenUpdate } : {})
          },
          include: {
              student: {
                  include: { user: { select: { email: true } } }
              },
              review: true,
              task: {
                  include: { company: true }
              }
          }
      });

      if (status === 'approved') {
          await mailService.sendTaskCompletedEmail(
              updatedSubmission.student.user.email,
              updatedSubmission.student.full_name,
              updatedSubmission.task.title
          );
      }

      // Check Task Completion
      const activeSubmissions = await prisma.submission.findMany({
        where: {
          task_id: submission.task_id,
          status: { in: ['offered', 'accepted', 'submitted', 'approved', 'reviewed'] }
        }
      });

      if (activeSubmissions.length > 0) {
        const allFinished = activeSubmissions.every((sub: any) => ['approved', 'reviewed'].includes(sub.status));
        if (allFinished) {
          await prisma.task.update({
            where: { id: submission.task_id },
            data: { status: 'Completed' }
          });
        }
      } else if (submission.task.status === 'in_progress') {
        // If there are no active submissions left (e.g. all were rejected)
        await prisma.task.update({
          where: { id: submission.task_id },
          data: { status: 'Open' }
        });
      }

      return updatedSubmission;
  }

  async offerUnpaidSubmission(submissionId: number, companyUserId: number) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { company: true } },
        student: { include: { user: true } }
      }
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.task.company_user_id !== companyUserId) throw new AppError('Not authorized', 403);
    if (submission.task.reward_type === 'money') throw new AppError('Bu görev ücretlidir. Lütfen ödeme yapın.', 400);
    
    if (submission.status === 'pending') {
        const acceptedSubmissionsCount = await prisma.submission.count({
          where: {
            task_id: submission.task_id,
            status: { in: ['offered', 'accepted', 'submitted', 'approved', 'reviewed'] }
          }
        });
        const positions = submission.task.positions || 1;
        if (acceptedSubmissionsCount >= positions) {
          throw new AppError('Görev için belirlenen kontenjan dolmuştur.', 400);
        }
    }

    const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'offered' },
        include: { task: { include: { company: true } }, student: { include: { user: true } } }
    });

    await mailService.sendOfferEmail(
        updatedSubmission.student.user.email,
        updatedSubmission.student.full_name,
        updatedSubmission.task.title,
        updatedSubmission.task.company.company_name
    );

    return updatedSubmission;
  }

  async paySubmission(submissionId: number, companyUserId: number, cardData: any, buyerEmail: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            company: true
          }
        },
        student: {
          include: { user: true }
        }
      }
    });

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    if (submission.task.company_user_id !== companyUserId) {
      throw new AppError('Not authorized to pay for this submission', 403);
    }

    if (submission.payment_status === 'escrow_locked' || submission.payment_status === 'released') {
      throw new AppError('Ödeme zaten yapıldı veya serbest bırakıldı.', 400);
    }

    if (submission.status === 'pending') {
      const acceptedSubmissionsCount = await prisma.submission.count({
        where: {
          task_id: submission.task_id,
          status: { in: ['offered', 'accepted', 'submitted', 'approved', 'reviewed'] }
        }
      });
      const positions = submission.task.positions || 1;
      if (acceptedSubmissionsCount >= positions) {
        throw new AppError('Görev için belirlenen kontenjan dolmuştur.', 400);
      }
    }

    const subMerchantKey = submission.student.sub_merchant_key;
    if (!subMerchantKey) {
      throw new AppError('Öğrenci henüz banka hesabı (Sub-Merchant) tanımlamamış. Ödeme alınamaz.', 400);
    }

    // Determine the price. Use proposed_budget or task.budget
    const priceStr = submission.proposed_budget || submission.task.budget || submission.task.reward_amount || '0';
    const parsedPrice = parseFloat(priceStr);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new AppError('Geçersiz görev bütçesi.', 400);
    }

    const buyer = {
      id: `company_${submission.task.company.user_id}`,
      name: submission.task.company.company_name.split(' ')[0] || 'Şirket',
      surname: submission.task.company.company_name.split(' ').slice(1).join(' ') || 'Temsilcisi',
      email: buyerEmail || 'company@sinerji.com',
      gsmNumber: '+905555555555',
      address: submission.task.company.location || 'Istanbul, Turkey'
    };

    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';

    try {
      // Mock payment for UI testing
      const response = { data: { success: true, paymentId: Date.now().toString(), paymentTransactionId: Date.now().toString() } };
      /*
      const response = await axios.post(`${paymentServiceUrl}/api/payments/checkout`, {
        ...cardData,
        price: parsedPrice.toString(),
        buyer,
        subMerchantKey
      });

      if (!response.data || !response.data.success) {
        throw new AppError(response.data?.error || 'Ödeme işlemi başarısız.', 400);
      }
      */

      const { paymentId, paymentTransactionId } = response.data;

      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          payment_id: paymentId,
          payment_transaction_id: paymentTransactionId,
          payment_status: 'escrow_locked',
          status: 'offered'
        },
        include: {
          task: true,
          student: true
        }
      });

      // Send Email Offer
      await mailService.sendOfferEmail(
        submission.student.user.email,
        submission.student.full_name,
        submission.task.title,
        submission.task.company.company_name
      );

      return updatedSubmission;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown network error';
      throw new AppError(`Ödeme işlemi microservice tarafında başarısız oldu: ${errMsg}`, error.response?.status || 502);
    }
  }

  async submitWork(submissionId: number, studentUserId: number, workLink: string, notes?: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true }
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.student_user_id !== studentUserId) {
      throw new AppError('Not authorized', 403);
    }
    if (submission.status !== 'accepted') {
      throw new AppError('Görev henüz kabul edilmemiş veya zaten teslim edilmiş', 400);
    }

    const updatedSub = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'submitted',
        submission_content: workLink,
        delivery_url: workLink,
        delivery_notes: notes,
        delivered_at: new Date(),
        completion_status: 'delivered'
      },
      include: {
        task: { include: { company: { include: { user: true } } } },
        student: true
      }
    });

    await mailService.sendSubmissionDeliveredEmail(
        updatedSub.task.company.user.email,
        updatedSub.task.company.company_name,
        updatedSub.task.title,
        updatedSub.student.full_name
    );

    return updatedSub;
  }

  async respondToOffer(submissionId: number, studentUserId: number, accept: boolean) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true }
    });

    if (!submission) throw new AppError('Submission not found', 404);
    if (submission.student_user_id !== studentUserId) {
      throw new AppError('Not authorized', 403);
    }
    if (submission.status !== 'offered') {
      throw new AppError('Geçerli bir teklif bulunmamaktadır.', 400);
    }

    if (accept) {
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'accepted' },
        include: { task: true, student: true }
      });

      // Check if task positions are filled before setting to in_progress
      const acceptedCount = await prisma.submission.count({
        where: {
          task_id: submission.task_id,
          status: { in: ['accepted', 'submitted', 'approved', 'reviewed'] }
        }
      });

      if (acceptedCount >= (submission.task.positions || 1)) {
        await prisma.task.update({
          where: { id: submission.task_id },
          data: { status: 'in_progress' }
        });
      }

      return updatedSubmission;
    } else {
      // Reject Offer
      let paymentStatusUpdate = undefined;
      if (submission.payment_status === 'escrow_locked' && submission.payment_transaction_id) {
        await this.cancelPayment(submission.payment_transaction_id);
        paymentStatusUpdate = 'cancelled';
      }

      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          status: 'rejected',
          ...(paymentStatusUpdate ? { payment_status: paymentStatusUpdate } : {})
        },
        include: { task: true, student: true }
      });
      
      return updatedSubmission;
    }
  }
  
  private async cancelPayment(paymentTransactionId: string) {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
    try {
      const response = await axios.post(`${paymentServiceUrl}/api/payments/cancel`, {
        paymentTransactionId
      });
      if (!response.data || !response.data.success) {
        throw new AppError(response.data?.error || 'Ödeme iptal edilemedi.', 400);
      }
      return true;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown network error';
      throw new AppError(`Ödeme iptal işlemi microservice tarafında başarısız oldu: ${errMsg}`, error.response?.status || 502);
    }
  }

  async getGuaranteeDetails(token: string, type?: string) {
    const submission = await prisma.submission.findUnique({
      where: { guarantee_token: token },
      include: {
        student: {
          include: { user: { select: { email: true } } }
        },
        task: {
          include: { company: { select: { company_name: true } } }
        }
      }
    });

    if (!submission) {
      throw new AppError('Geçersiz veya süresi dolmuş sertifika kodu.', 404);
    }
    
    // Type validation based on frontend tab selection
    if (type) {
        const isRec = submission.task.reward_type?.toLowerCase() === 'recommendation';
        if (type === 'recommendation' && !isRec) {
             throw new AppError('Geçersiz veya süresi dolmuş sertifika kodu.', 404);
        }
        if (type === 'certificate' && isRec) {
             throw new AppError('Geçersiz veya süresi dolmuş sertifika kodu.', 404);
        }
    }

    if (submission.status !== 'approved' && submission.status !== 'reviewed') {
      throw new AppError('Bu çalışma henüz onaylanmamış.', 400);
    }

    return {
      studentName: submission.student.full_name,
      companyName: submission.task.company.company_name,
      taskTitle: submission.task.title,
      completedAt: submission.submitted_at, // or updated_at, submitted_at is fine for now
      rewardType: submission.task.reward_type
    };
  }
}