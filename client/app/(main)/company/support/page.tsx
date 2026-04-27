"use client";

import { useState, useEffect } from "react";
import MainSection from "@/components/ui/layouts/MainSection";
import Button from "@/components/ui/Button";
import { FiSend, FiMessageSquare, FiClock, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { supportService, SupportTicket } from "@/services/support.service";

export default function SupportPage() {
  const { showToast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await supportService.createTicket({ subject, message });
      showToast("Mesajınız başarıyla iletildi. En kısa sürede size döneceğiz.", "success");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (error) {
      showToast("Mesaj gönderilirken bir hata oluştu.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Açık</span>;
      case "closed":
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Kapandı</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Panel", href: "/company/dashboard" },
          { label: "Destek ve Yardım", active: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <MainSection title="Destek Talebi Oluştur">
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-500 mb-2">
                Sorularınız, teknik sorunlarınız veya önerileriniz için bize ulaşabilirsiniz.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Konu</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Sorununuzun kısa bir özeti"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Lütfen detaylı bilgi veriniz..."
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={FiSend}
                className="w-full md:w-auto px-8"
              >
                Gönder
              </Button>
            </form>
          </MainSection>
        </div>

        {/* Previous Tickets & Info */}
        <div className="space-y-6">
          <MainSection title="Geçmiş Talepler">
            {isFetching ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.message}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <FiClock size={12} />
                      {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FiMessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs italic">Henüz bir destek talebiniz bulunmuyor.</p>
              </div>
            )}
          </MainSection>

          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiHelpCircle size={20} />
              </div>
              <h3 className="font-bold">Yardıma mı ihtiyacınız var?</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Sıkça sorulan sorular (SSS) sayfamıza göz atarak sorularınıza daha hızlı yanıt bulabilirsiniz.
            </p>
            <Button variant="outline" className="w-full text-xs py-2 bg-white/10 border-white/20 hover:bg-white/20 text-white">
              SSS Görüntüle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
