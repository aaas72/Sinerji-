import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiBriefcase, FiStar, FiBookOpen } from "react-icons/fi";
import { CompanyExploreType } from '@/components/features/companies/CompanyExploreCard';
import PrimaryButton from "@/components/ui/PrimaryButton";

interface CompanyProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyExploreType | null;
}

export default function CompanyProfileDrawer({ isOpen, onClose, company }: CompanyProfileDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#00342b]/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[560px] md:w-[600px] shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full h-full hero-gradient overflow-hidden">
        {company && (
          <div className="flex flex-col h-full relative z-10">
            {/* Header / Cover (Green Section) */}
            <div className="relative shrink-0 pt-16 px-8 pb-8 text-white">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-full bg-[#f1f0ea] border border-[#dfded6] flex items-center justify-center text-[#00342b] font-bold text-3xl overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      company.initials
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white">{company.name}</h2>
                <p className="text-[#afefdd] font-medium mt-1">{company.industry}</p>

                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-sm text-white/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="text-white/60" />
                    <span>{company.location}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <FiBriefcase className="text-white/60" />
                    <span>{company.openTasks} Görev (Açık İlan)</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <FiStar className="text-amber-400 fill-amber-400 shrink-0" size={14} />
                    <span>{company.rating}/5 Değerlendirme</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 mt-8">
                  <PrimaryButton 
                    href={`/companies/${company.id}`} 
                    onClick={onClose}
                    className="flex-1 rounded-full py-2.5 justify-center bg-[#e28743] hover:bg-[#c47133] text-white"
                  >
                    Tüm Profili Görüntüle
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* Profile Info (Dark Section) */}
            <div className="p-8 flex-1">
              <div className="relative z-10">
                {/* About / Bio Placeholder */}
              <div className="mb-8">
                <h3 className="text-[15px] font-bold text-white mb-3 flex items-center gap-2">
                  <FiBookOpen className="text-[#e28743]" />
                  Şirket Hakkında
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Bu şirket hakkında detaylı bilgi, geçmiş projeler ve yeni iş fırsatlarını görmek için lütfen tüm profili ziyaret edin.
                </p>
              </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
