import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { notificationService } from '../services/notification.service';
import { getIO, userSockets } from '../socket';



export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const currentUserId = req.user.id;

    // Find all unique users this user has exchanged messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId },
          { receiver_id: currentUserId }
        ]
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          include: { companyProfile: true, studentProfile: true }
        },
        receiver: {
          include: { companyProfile: true, studentProfile: true }
        }
      }
    });

    const contactMap = new Map();
    messages.forEach(msg => {
      const isSender = msg.sender_id === currentUserId;
      const otherUser = isSender ? msg.receiver : msg.sender;
      
      if (!contactMap.has(otherUser.id)) {
        let name = 'Unknown';
        let role = otherUser.role;
        let initials = 'U';
        let imageUrl = null;
        
        if (otherUser.companyProfile) {
          name = otherUser.companyProfile.company_name;
          initials = name.substring(0, 2).toUpperCase();
          imageUrl = otherUser.companyProfile.logo_url;
        } else if (otherUser.studentProfile) {
          name = otherUser.studentProfile.full_name;
          initials = name.substring(0, 2).toUpperCase();
          imageUrl = otherUser.studentProfile.profile_image_url;
        }

        contactMap.set(otherUser.id, {
          id: otherUser.id,
          name,
          role,
          initials,
          imageUrl,
          lastMessageTime: msg.created_at,
          unread: !isSender && !msg.is_read ? 1 : 0 // simplify unread counting
        });
      } else {
        if (!isSender && !msg.is_read) {
          contactMap.get(otherUser.id).unread += 1;
        }
      }
    });

    const contacts = Array.from(contactMap.values());

    res.status(200).json({
      status: 'success',
      data: { contacts }
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    
    const unreadCount = await prisma.message.count({
      where: {
        receiver_id: req.user.id,
        is_read: false
      }
    });

    res.status(200).json({
      status: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: currentUserId }
        ]
      },
      orderBy: { created_at: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        sender_id: otherUserId,
        receiver_id: currentUserId,
        is_read: false
      },
      data: { is_read: true }
    });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return next(new AppError('receiver_id and content are required', 400));
    }

    const receiverIdInt = parseInt(receiver_id);

    // --- Task-Based Messaging Logic ---
    if (req.user.role === 'student') {
      // 1. Did the company message the student first?
      const existingMessage = await prisma.message.findFirst({
        where: {
          sender_id: receiverIdInt,
          receiver_id: sender_id
        }
      });

      if (!existingMessage) {
        // 2. Did the student apply to any task created by the company?
        const activeSubmission = await prisma.submission.findFirst({
          where: {
            student_user_id: sender_id,
            task: {
              company_user_id: receiverIdInt
            }
          }
        });

        if (!activeSubmission) {
          return next(new AppError('Şirkete mesaj gönderebilmek için göreve kabul edilmiş olmanız veya şirketin size mesaj göndermiş olması gerekir.', 403));
        }

        // 3. Ensure the submission status allows messaging
        const allowedStatuses = ['accepted', 'submitted', 'reviewed', 'approved', 'completed'];
        if (!activeSubmission.status || !allowedStatuses.includes(activeSubmission.status)) {
          return next(new AppError('Şirkete mesaj gönderebilmek için göreve kabul edilmiş olmanız veya şirketin size mesaj göndermiş olması gerekir.', 403));
        }
      }
    }
    // ----------------------------------

    const message = await prisma.message.create({
      data: {
        sender_id,
        receiver_id: receiverIdInt,
        content
      }
    });

    // Determine sender name
    let senderName = 'Bir kullanıcı';
    if (req.user.role === 'company') {
      const company = await prisma.companyProfile.findUnique({ where: { user_id: sender_id } });
      if (company) senderName = company.company_name;
    } else {
      const student = await prisma.studentProfile.findUnique({ where: { user_id: sender_id } });
      if (student) senderName = student.full_name;
    }

    // Emit live message
    const receiverSocket = userSockets.get(receiverIdInt);
    if (receiverSocket) {
      getIO().to(receiverSocket).emit('receive_message', message);
    }

    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    const currentUserId = req.user.id;
    const messageId = parseInt(req.params.id);

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    if (message.sender_id !== currentUserId) {
      return next(new AppError('You can only delete your own messages', 403));
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    // Optionally notify the receiver via socket so they can remove it from their UI
    const receiverSocket = userSockets.get(message.receiver_id);
    if (receiverSocket) {
      getIO().to(receiverSocket).emit('delete_message', { messageId });
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
