"use client";

import { useState, useEffect } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import { useSocket } from '@/context/SocketContext';
import { useAuthStore } from '@/hooks/useAuth';
import { messageService } from '@/services/message.service';
import { usePathname } from 'next/navigation';

export default function MessageIndicator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connected } = useSocket();
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  const linkHref = user?.role === 'company' ? '/company/messages' : '/student/messages';

  const fetchUnreadCount = async () => {
    try {
      if (!isAuthenticated) return;
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (!socket || !connected || !user) return;

    const handleReceiveMessage = (message: any) => {
      if (message.receiver_id === user.id) {
        // Simple strategy: refetch to get accurate unread count
        setTimeout(fetchUnreadCount, 500);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, connected, user]);

  if (!isAuthenticated || !user) return null;

  return (
    <Link
      href={linkHref}
      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
    >
      <FiMessageSquare size={18} />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
      )}
    </Link>
  );
}
