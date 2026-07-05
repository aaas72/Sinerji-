import React from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { FiAward, FiBriefcase, FiStar, FiZap, FiPackage, FiClock } from "react-icons/fi";
import SkillBadge from "@/components/ui/SkillBadge";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";

export type ApplicationStatus =| "Bekliyor"| "Teklif Alındı"| "Devam Ediyor"| "İnceleniyor"| "Tamamlandı"| "Reddedildi"| "Değerlendirildi";

export type RewardType =
  | "Money"
  | "Certificate"
  | "Internship"
  | "Recommendation"
  | "Experience"
  | "Product"
  | "Service";
type ApplicationCardProps = {
  id: number;
  title: string;
  tags: string[];
  companyName: string;
  companyId?: number;
  date: string;
  status: ApplicationStatus;
  rewardType?: RewardType;
};

const getStatusText = (status: ApplicationStatus) => {
  switch (status) {
    case "Bekliyor":
      return "Başvuru Bekliyor...";
    case "Teklif Alındı":
      return "Teklif Alındı! Onayınız Bekleniyor";
    case "Devam Ediyor":
      return "Görev Devam Ediyor";
    case "İnceleniyor":
      return "Başvuru/İş İnceleniyor...";
    case "Tamamlandı":
    case "Değerlendirildi":
      return "Başvuru Tamamlandı";
    case "Reddedildi":
      return "Başvuru Reddedildi";
    default:
      return status;
  }
};

const getRewardDetails = (type: RewardType) => {
  switch (type) {
    case "Money":
      return { label: "Ödül", icon: BsCurrencyDollar, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Certificate":
      return { label: "Sertifika", icon: FiAward, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Internship":
      return { label: "Staj", icon: FiBriefcase, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Recommendation":
      return { label: "Referans", icon: FiStar, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Experience":
      return { label: "Deneyim", icon: FiZap, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Product":
      return { label: "Ürün", icon: FiPackage, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    case "Service":
      return { label: "Hizmet", icon: FiBriefcase, color: "bg-[#004d40]/10", iconColor: "text-[#004d40]" };
    default:
      return { label: "Ödül", icon: BsCurrencyDollar, color: "bg-gray-100", iconColor: "text-[#004d40]" };
  }
};

export default function ApplicationCard({
  id,
  title,
  tags,
  companyName,
  companyId,
  date,
  status,
  rewardType,
}: ApplicationCardProps) {
  const router = useRouter();
  const reward = rewardType ? getRewardDetails(rewardType) : null;

  return (
    <div className="bg-white border border-[#dfded6] rounded-2xl p-6 hover:rounded-none relative group hover-card-effect transition-all">
      {/* Top Section: Title and Status/Reward */}
      <div className="flex justify-between items-start mb-4 select-none">
        <h3 className="text-[20px] font-bold tracking-tight text-[#0b1c30] group-hover:text-[#004d40] transition-colors leading-snug max-w-[75%]">
          {title}
        </h3>
        
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={status} />
          {reward && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{reward.label}</span>
              <div
                className={`w-7 h-7 ${reward.color} rounded-xl flex items-center justify-center`}
              >
                <reward.icon className={`text-[13px] ${reward.iconColor}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, index) => (
          <SkillBadge key={index} label={tag} />
        ))}
      </div>

      {/* Bottom Section: Company, Date, Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center pt-5 border-t border-[#dfded6] select-none gap-4 md:gap-0">
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-[#565e74] w-full md:w-auto">
          <div className="flex items-center gap-2">
            <FiBriefcase className="text-[#004d40]" size={14} />
            <span className="text-[#00342b]">{companyName}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiClock size={14} />
            <span>{date}</span>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center justify-end gap-3">
          {(status === "Teklif Alındı" || status === "Devam Ediyor" || status === "İnceleniyor" || status === "Reddedildi" || status === "Tamamlandı" || status === "Değerlendirildi") && (
            <PrimaryButton 
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/student/applications/${id}`);
              }}
              className="px-4 py-2 text-[12px] h-[36px]"
            >
              Çalışma Alanı
            </PrimaryButton>
          )}
          {companyId && (status === "Devam Ediyor" || status === "Tamamlandı" || status === "Değerlendirildi") && (
            <PrimaryButton 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/student/messages?companyId=${companyId}`);
              }}
              className="px-4 py-2 text-[12px] h-[36px] text-[#004d40] border-[#004d40]/20 hover:bg-[#004d40]/5"
            >
              Mesaj Gönder
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
