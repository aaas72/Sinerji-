"use client";
import { useState } from "react";
import { cn } from "@/utils/cn";
import CustomSelect from "@/components/ui/CustomSelect";
import Button from "@/components/ui/Button";
import MainSection from "@/components/ui/layouts/MainSection";
import { FiChevronDown, FiSearch, FiAward, FiFilter } from "react-icons/fi";

type SearchFilterProps = {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
};

export type SearchFilters = {
  keyword: string;
  category: string;
};

const skillOptions = [
  "Web Tasarım",
  "Mobil Uygulama",
  "Grafik Tasarım",
  "İçerik Yazımı",
  "SEO",
  "Sosyal Medya",
  "Video Düzenleme",
  "Fotoğrafçılık",
];

const categoriesData = [
  {
    label: "Development",
    options: [
      { value: "Web Development", label: "Web Development" },
      { value: "Mobile App", label: "Mobile App" },
      { value: "Software Engineering", label: "Software Engineering" },
      { value: "Game Development", label: "Game Development" },
    ],
  },
  {
    label: "Design",
    options: [
      { value: "Graphic Design", label: "Graphic Design" },
      { value: "UI/UX Design", label: "UI/UX Design" },
      { value: "Adobe Illustrator", label: "Adobe Illustrator" },
      { value: "Video Editing", label: "Video Editing" },
    ],
  },
  {
    label: "Marketing",
    options: [
      { value: "SEO", label: "SEO" },
      { value: "Social Media", label: "Social Media" },
      { value: "Content Marketing", label: "Content Marketing" },
      { value: "Email Marketing", label: "Email Marketing" },
    ],
  },
  {
    label: "Business",
    options: [
      { value: "Project Management", label: "Project Management" },
      { value: "Virtual Assistant", label: "Virtual Assistant" },
      { value: "Data Entry", label: "Data Entry" },
    ],
  },
];

const rewardTypeOptions = [
  "Para Ödülü",
  "Sertifika",
  "Deneyim",
  "Ürün",
  "Hizmet",
];

export default function SearchFilter({
  onSearch,
  className,
}: SearchFilterProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");

  const handleSearch = () => {
    onSearch?.({ keyword, category });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Senin İçin Önerilen Görevler</h2>
      <p className="text-sm text-gray-500 mb-5">Yeteneklerine uygun görevleri keşfet</p>
      <div className="flex flex-wrap gap-3 items-end relative">
        {/* حقل البحث الرئيسي */}
        <div className="flex-1 min-w-[250px] relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004d40]" />
          <input
            type="text"
            placeholder="Görevlerde ara..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] focus:bg-white text-sm transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="min-w-[200px]">
          <CustomSelect
            options={categoriesData}
            value={category}
            onChange={setCategory}
            placeholder="Select Category"
            variant="mega"
            fullWidth={true}
          />
        </div>

        {/* زر البحث */}
        <div>
          <Button
            onClick={handleSearch}
            variant="primary"
            className="h-11 px-6 rounded-xl"
          >
            <FiSearch className="w-4 h-4 mr-2 text-[#004d40]" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
