"use client";

import { useState, useEffect, Suspense } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { FiMessageSquare, FiSend, FiSearch, FiMoreVertical, FiPaperclip, FiCheck, FiCornerUpLeft, FiCopy, FiTrash2, FiArrowDown } from "react-icons/fi";
import { messageService, Contact, Message } from "@/services/message.service";
import { useAuthStore } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import ListSkeleton from "@/components/ui/ListSkeleton";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/context/ToastContext";
import { studentService } from "@/services/student.service";

function CompanyMessagesContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const preSelectedStudentId = searchParams.get("studentId");
  const { socket, connected } = useSocket();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Mesaj panoya kopyalandı.", "success");
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await messageService.getContacts();
        
        if (preSelectedStudentId) {
          const sid = parseInt(preSelectedStudentId);
          let found = data.find(c => c.id === sid);
          
          if (found) {
            setActiveContact(found);
          } else {
            try {
              const studentProfile = await studentService.getStudentById(sid);
              const newContact: Contact = {
                id: studentProfile.user_id,
                name: studentProfile.full_name,
                role: 'Öğrenci',
                initials: studentProfile.full_name.substring(0, 2).toUpperCase(),
                lastMessageTime: new Date().toISOString(),
                unread: 0,
                imageUrl: studentProfile.profile_image_url
              };
              data.unshift(newContact);
              setActiveContact(newContact);
            } catch (err) {
              console.error("Failed to fetch student profile", err);
            }
          }
        }

        setContacts(data);
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [preSelectedStudentId]);

  useEffect(() => {
    if (activeContact) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const data = await messageService.getMessages(activeContact.id);
          setMessages(data);
        } catch (error) {
          console.error("Failed to fetch messages", error);
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [activeContact]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleReceiveMessage = (newMessage: Message) => {
      // If the message is from the active contact, append it
      if (activeContact && (newMessage.sender_id === activeContact.id || newMessage.receiver_id === activeContact.id)) {
        setMessages((prev) => [...prev, newMessage]);
      }
      
      // Update contacts unread count or last message time
      setContacts((prevContacts) => {
        const newContacts = [...prevContacts];
        const contactIndex = newContacts.findIndex(c => c.id === newMessage.sender_id || c.id === newMessage.receiver_id);
        
        if (contactIndex !== -1) {
          const contact = newContacts[contactIndex];
          contact.lastMessageTime = newMessage.created_at;
          if (newMessage.sender_id !== user?.id && activeContact?.id !== newMessage.sender_id) {
            contact.unread += 1;
          }
          // Move to top
          newContacts.splice(contactIndex, 1);
          newContacts.unshift(contact);
        }
        return newContacts;
      });
    };

    const handleDeleteMessageEvent = (data: { messageId: number }) => {
      setMessages((prev) => prev.filter(msg => msg.id !== data.messageId));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('delete_message', handleDeleteMessageEvent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('delete_message', handleDeleteMessageEvent);
    };
  }, [socket, connected, activeContact, user?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;
    try {
      const msg = await messageService.sendMessage(activeContact.id, newMessage.trim());
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (error: any) {
      console.error("Failed to send message", error);
      const errorMsg = error.response?.data?.message || error.message || "Mesaj gönderilemedi";
      showToast(errorMsg, "error");
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter(msg => msg.id !== messageId));
      showToast("Mesaj silindi", "success");
    } catch (error: any) {
      console.error("Failed to delete message", error);
      const errorMsg = error.response?.data?.message || error.message || "Mesaj silinemedi";
      showToast(errorMsg, "error");
    }
  };

  let lastDate = "";
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 py-6 h-[calc(100vh-64px)] flex flex-col">

      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 flex bg-transparent rounded-3xl border border-[#DFDED6] overflow-hidden">
        
        {/* Left Sidebar (Contacts) */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0 hidden md:flex border-r border-[#DFDED6] bg-white">
          <div className="p-5 border-b border-[#DFDED6]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Öğrenci ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-[50px] bg-gray-50 border border-transparent text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingContacts ? (
              <div className="p-4"><ListSkeleton count={4} /></div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex-1 min-h-[300px]">
                <EmptyState icon={FiMessageSquare} title="Kişi Bulunamadı" message="Henüz mesajınız yok." />
              </div>
            ) : filteredContacts.map((contact) => {
              const timeStr = new Date(contact.lastMessageTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              return (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-colors border-b border-[#DFDED6] last:border-0 ${
                  activeContact?.id === contact.id ? "bg-[#F1F0EA]/50" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                    {contact.imageUrl ? (
                      <img
                        src={contact.imageUrl}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      contact.initials
                    )}
                  </div>
                  {contact.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00342b] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {contact.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm font-bold truncate ${activeContact?.id === contact.id ? "text-[#0b1c30]" : "text-gray-800"}`}>
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium shrink-0">{timeStr}</span>
                  </div>
                  <p className="text-xs text-[#e28743] font-medium truncate">{contact.role}</p>
                </div>
              </button>
            )})}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-[#DFDED6] flex items-center justify-between px-6 shrink-0 bg-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                    {activeContact.imageUrl ? (
                      <img
                        src={activeContact.imageUrl}
                        alt={activeContact.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      activeContact.initials
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0b1c30]">{activeContact.name}</h2>
                  </div>
                </div>
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                  <FiMoreVertical size={20} />
                </button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-transparent custom-scrollbar">
                {loadingMessages ? (
                   <div className="flex-1 p-6"><ListSkeleton count={5} /></div>
                ) : messages.map((msg) => {
                  const dateObj = new Date(msg.created_at);
                  const msgDate = dateObj.toLocaleDateString('tr-TR');
                  const msgTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  const isMe = msg.sender_id === user?.id;

                  const showDate = msgDate !== lastDate;
                  if (showDate) lastDate = msgDate;

                  return (
                    <div key={msg.id} className="flex flex-col gap-4">
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {msgDate}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex max-w-[80%] group ${isMe ? "self-end" : "self-start"}`}>
                        
                        {/* Hover Actions (Sent) */}
                        {isMe && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                            <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Sil"><FiTrash2 size={14} /></button>
                          </div>
                        )}

                        <div className={`p-4 rounded-3xl relative ${
                          isMe 
                            ? "bg-[#004d40] text-white rounded-br-sm" 
                            : "bg-white border border-[#DFDED6] text-gray-800 rounded-bl-sm"
                        }`}>
                          <p className="text-sm font-medium">{msg.content}</p>
                          <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${isMe ? "text-white/70" : "text-gray-400"}`}>
                            <span>{msgTime}</span>
                          </div>
                        </div>

                        {/* Hover Actions (Received) */}
                        {!isMe && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Scroll to bottom button */}
              <button className="absolute bottom-[90px] right-8 w-10 h-10 bg-white shadow-md border border-[#DFDED6] rounded-full flex items-center justify-center text-gray-500 hover:text-[#00342b] hover:border-[#00342b] transition-all z-10">
                <FiArrowDown size={18} />
              </button>

              {/* Input Area */}
              <div className="p-4 border-t border-[#DFDED6] bg-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <button className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
                    <FiPaperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Bir mesaj yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-12 px-5 rounded-[50px] bg-white border border-[#DFDED6] text-sm focus:border-[#00342b] focus:ring-1 focus:ring-[#00342b] outline-none transition-all"
                  />
                  <button onClick={handleSendMessage} className="h-12 w-12 rounded-xl flex items-center justify-center p-0 shrink-0 bg-[#00342b] hover:bg-[#002620] border-none text-white transition-colors">
                    <FiSend size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent text-gray-400">
              <div className="w-20 h-20 bg-white border border-[#DFDED6] rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Mesajlarınızı Görüntüleyin</h3>
              <p className="text-sm text-center max-w-sm">
                Sohbeti başlatmak veya mevcut mesajları görmek için sol taraftan bir kişi seçin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CompanyMessagesPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <CompanyMessagesContent />
    </Suspense>
  );
}