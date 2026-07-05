import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiBriefcase, FiUserPlus, FiGithub, FiLinkedin, FiTwitter, FiGlobe, FiAward, FiStar, FiCalendar, FiBookOpen } from "react-icons/fi";
import { StudentType } from '@/components/features/students/StudentExploreCard';
import PrimaryButton from "@/components/ui/PrimaryButton";
import Link from "next/link";
import SkillBadge from "@/components/ui/SkillBadge";

interface StudentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentType | null;
}

export default function StudentProfileDrawer({ isOpen, onClose, student }: StudentProfileDrawerProps) {
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
        {student && (
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
                  <div className="w-full h-full rounded-full bg-[#f1f0ea] border border-[#dfded6] flex items-center justify-center text-[#00342b] font-bold text-3xl">
                    {student.initials}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                <p className="text-[#afefdd] font-medium mt-1">{student.headline}</p>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="text-white/60" />
                    <span>{student.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiBriefcase className="text-white/60" />
                    <span>{student.university}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 mt-8">
                  {/* Buttons removed before assignment */}
                </div>
                
                {/* View Full Profile Link */}
                <div className="mt-4 w-full">
                  <Link 
                    href={`/students/${student.id}`} 
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-[#e28743] hover:text-[#f89b52] hover:bg-transparent px-4 py-2 bg-transparent"
                  >
                    Tüm Profili Görüntüle &rarr;
                  </Link>
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
                    Hakkında
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {student.bio || "Öğrenci profili detayları henüz API tarafından tam olarak dönülmüyor. Bu alanda öğrencinin kendisi hakkında yazdığı detaylı biyografi yer alacak."}
                  </p>
                </div>

                {/* Skills */}
                <div className="mb-8">
                  <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
                    <FiAward className="text-[#e28743]" />
                    Teknik Yetenekler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {student.skills && student.skills.length > 0 ? (
                      student.skills.map((skill, idx) => (
                        <SkillBadge
                          key={idx}
                          label={typeof skill === "string" ? skill : (skill as any).skill?.name || "Bilinmeyen Yetenek"}
                        />
                      ))
                    ) : (
                      <span className="text-sm text-white/50">Yetenek eklenmemiş.</span>
                    )}
                  </div>
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
