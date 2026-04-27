"use client";

import { useState, useEffect } from "react";
import MainSection from "@/components/ui/layouts/MainSection";
import Button from "@/components/ui/Button";
import { FiSend, FiMessageSquare, FiClock, FiHelpCircle, FiArrowRight } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { supportService, SupportTicket } from "@/services/support.service";

export default function StudentSupportPage() {
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
      showToast("Mesajınız iletildi. Sinerji ekibi en kısa sürede seninle iletişime geçecek!", "success");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (error) {
      showToast("Mesaj gönderilirken bir hata oluştu.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Panel", href: "/student" },
          { label: "Destek ve Yardım", active: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <MainSection title="Bize Ulaş">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <FiHelpCircle className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Nasıl yardımcı olabiliriz?</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Sinerji deneyiminle ilgili her türlü soru, görüş ve önerini bizimle paylaşabilirsin. 
                    Teknik bir sorun yaşıyorsan lütfen ekran görüntüsü veya detaylı açıklama eklemeyi unutma.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Konu Başlığı</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Örn: Profil doğrulaması hakkında"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Mesajın</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none text-sm"
                    placeholder="Sana yardımcı olabilmemiz için detayları buraya yazabilirsin..."
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={FiSend}
                className="w-full py-4 text-sm font-bold rounded-2xl shadow-lg shadow-primary/20"
              >
                Mesajı Gönder
              </Button>
            </form>
          </MainSection>
        </div>

        {/* Info & Tickets */}
        <div className="space-y-6">
          <MainSection title="Önceki Mesajlarım">
            {isFetching ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${ticket.status === 'open' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {ticket.status === 'open' ? 'Aktif' : 'Çözüldü'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{new Date(ticket.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-800 line-clamp-1">{ticket.subject}</h5>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare size={24} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 italic">Henüz bir destek talebin yok.</p>
              </div>
            )}
          </MainSection>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
              <FiHelpCircle className="text-amber-600" /> Hızlı Bilgi
            </h4>
            <div className="space-y-4">
              {[
                "Profilim nasıl doğrulanır?",
                "Ödemeler ne zaman yapılır?",
                "Yeteneklerimi nasıl güncellerim?"
              ].map((q) => (
                <button key={q} className="w-full flex items-center justify-between text-left text-xs text-amber-700 hover:text-amber-900 font-medium group">
                  {q}
                  <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
