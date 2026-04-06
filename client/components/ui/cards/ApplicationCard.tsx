import React from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { FiAward, FiBriefcase, FiStar, FiZap, FiPackage } from "react-icons/fi";
import SkillBadge from "../SkillBadge";

export type ApplicationStatus =
  | "Bekliyor"
  | "İnceleniyor"
  | "Kabul Edildi"
  | "Reddedildi";

export type RewardType =
  | "Money"
  | "Certificate"
  | "Internship"
  | "Recommendation"
  | "Experience"
  | "Product"
  | "Service";

type ApplicationCardProps = {
  title: string;
  tags: string[];
  companyName: string;
  date: string;
  status: ApplicationStatus;
  rewardType?: RewardType;
};

const getStatusText = (status: ApplicationStatus) => {
  switch (status) {
    case "Bekliyor":
      return "Başvuru Bekliyor...";
    case "İnceleniyor":
      return "Başvuru İnceleniyor...";
    case "Kabul Edildi":
      return "Başvuru Kabul Edildi";
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
  title,
  tags,
  companyName,
  date,
  status,
  rewardType,
}: ApplicationCardProps) {
  const reward = rewardType ? getRewardDetails(rewardType) : null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Top Section: Title and Reward */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900 text-base max-w-[80%] leading-snug">
          {title}
        </h3>
        {reward && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-sm text-gray-700">{reward.label}</span>
            <div
              className={`w-7 h-7 ${reward.color} rounded-xl flex items-center justify-center`}
            >
              <reward.icon className={`text-xs ${reward.iconColor}`} />
            </div>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, index) => (
          <SkillBadge className="bg-gray-50 border border-gray-100 text-gray-600 rounded-xl" key={index} label={tag} />
        ))}
      </div>

      {/* Bottom Section: Company, Status, Date */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <div className="w-5 h-5 border-2 border-[#004d40] rounded-md shrink-0"></div>
          <span className="text-gray-600">Şirket: <span className="font-medium">{companyName}</span></span>
        </div>

        <div className="flex items-center justify-center w-full md:w-auto mb-2 md:mb-0">
          <span className="text-gray-500">{getStatusText(status)}</span>
        </div>

        <div className="w-full md:w-auto text-right">
          <span className="text-gray-400">{date}</span>
        </div>
      </div>
    </div>
  );
}
