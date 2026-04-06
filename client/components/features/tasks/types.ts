import {
  FiDollarSign,
  FiBriefcase,
  FiFileText,
  FiLayout,
  FiAward,
  FiGift,
} from "react-icons/fi";

export type Task = {
  id: string;
  title: string;
  tags: string[];
  rewardAmount?: string; // e.g. "5.000 ₺"
  company: { id?: number; name: string };
  location?: string;
  workType?: string;
  rewardType?: string; // e.g. "Nakit", "Hediye Çeki"
  createdAtLabel?: string;
  description: string;
  detailTitle?: string;
  detailBody?: string;
};

export const getRewardIcon = (type?: string) => {
  switch (type) {
    case "Nakit":
      return FiDollarSign;
    case "Hediye Çeki":
      return FiGift;
    case "Staj":
      return FiBriefcase;
    case "Tavsiye Mektubu":
      return FiFileText;
    case "Proje":
      return FiLayout;
    default:
      return FiAward;
  }
};
