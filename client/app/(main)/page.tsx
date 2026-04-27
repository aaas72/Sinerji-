"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { publicService, PublicStats, PublicTask } from "@/services/public.service";
import {
  FiBriefcase,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { openRegister, openLogin } = useAuthModal();

  const [stats, setStats] = useState<PublicStats>({
    students: 0,
    companies: 0,
    tasks: 0,
    badges: 0,
  });
  const [latestTasks, setLatestTasks] = useState<PublicTask[]>([]);

  useEffect(() => {
    publicService.getStats().then(setStats).catch(() => {});
    publicService.getLatestTasks().then(setLatestTasks).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative bg-linear-to-br from-[#004d40] to-[#00695c] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#fbb049] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <FiStar className="text-[#fbb049]" />
                <span>Yetenek ve Fırsat Buluşma Noktası</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-heading">
                Geleceğini{" "}
                <span className="text-[#fbb049]">Şekillendir,</span>{" "}
                Yeteneğini Kanıtla
              </h1>

              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                Öğrenciler gerçek dünya projeleriyle deneyim kazanır.
                Şirketler en parlak yetenekleri keşfeder.
              </p>

              <div className="flex flex-wrap gap-4">
                {_hasHydrated && (
                  <>
                    <button
                      onClick={openRegister}
                      className="bg-[#fbb049] hover:bg-[#f9a825] text-[#004d40] font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#fbb049]/25 hover:-translate-y-0.5"
                    >
                      Hemen Başla
                    </button>
                    <button
                      onClick={openLogin}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/25 hover:-translate-y-0.5"
                    >
                      Giriş Yap
                    </button>
                  </>
                )}

                {!_hasHydrated && (
                  <span className="text-white/60">Yükleniyor...</span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#fbb049]" />
                  <span>Ücretsiz kayıt</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#fbb049]" />
                  <span>Gerçek projeler</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#fbb049]" />
                  <span>Onaylı rozetler</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Son Görevler</span>
                      {latestTasks.length > 0 && (
                        <span className="bg-[#fbb049] text-[#004d40] text-xs font-bold px-3 py-1 rounded-full">
                          Yeni
                        </span>
                      )}
                    </div>

                    {latestTasks.length === 0 ? (
                      <div className="text-center py-10 text-gray-300 italic">
                        Henüz görev bulunmuyor
                      </div>
                    ) : (
                      latestTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                            <span className="text-xs text-gray-400">{task.company}</span>
                          </div>
                          <div className="flex gap-2">
                            {task.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-[11px] bg-[#004d40]/10 text-[#004d40] px-2 py-0.5 rounded-md font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fbb049]/10 rounded-lg flex items-center justify-center">
                    <FiAward className="text-[#fbb049]" size={20} />
                  </div>
                  <div>
                    <p className="text-[#004d40] font-bold text-sm">Rozet Sistemi</p>
                    <p className="text-gray-400 text-xs">Yeteneklerini kanıtla</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className="text-[#fbb049] fill-[#fbb049]"
                      />
                    ))}
                  </div>
                  <span className="text-[#004d40] font-bold text-sm">Real Stats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbb049] ">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: stats.students.toString(), label: "Öğrenci", icon: FiUsers },
              { value: stats.companies.toString(), label: "Şirket", icon: FiBriefcase },
              { value: stats.tasks.toString(), label: "Görev", icon: FiTrendingUp },
              { value: stats.badges.toString(), label: "Rozet", icon: FiAward },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <stat.icon className="text-[#004d40]" size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#004d40] font-heading">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#004d40]/70 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#004d40]/2 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-[#004d40]/10 text-[#004d40] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Başlamak Çok Kolay
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
              Nasıl Çalışır?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Profilini Oluştur",
                desc: "Kaydol, yeteneklerini ekle ve portföyünü oluşturmaya başla.",
                icon: FiUsers,
                color: "#004d40",
              },
              {
                step: "02",
                title: "Görevlere Başvur",
                desc: "Gerçek dünya görevlerini keşfet ve ilgini çekenlere başvur.",
                icon: FiBriefcase,
                color: "#fbb049",
              },
              {
                step: "03",
                title: "Rozet & Değerlendirme Kazan",
                desc: "Başarılı çalışmaların için rozet ve değerlendirme al.",
                icon: FiAward,
                color: "#004d40",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div className="absolute -top-4 left-8 bg-[#fbb049] text-[#004d40] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  Adım {item.step}
                </div>

                <div className="mt-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}10` }}
                  >
                    <item.icon size={24} style={{ color: item.color }} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-[#004d40]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-[#fbb049]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-[#004d40]/10 text-[#004d40] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Öğrenciler İçin
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                Kariyerine Burada Başla
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Üniversitende öğrendiklerini gerçek projelerde uygula.
              </p>

              <button
                onClick={openRegister}
                className="bg-[#004d40] hover:bg-[#00695c] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                Öğrenci Olarak Katıl
                <FiArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: stats.students.toString(), label: "Öğrenci", icon: FiUsers, color: "#004d40" },
                { value: "4.9", label: "Ortalama Puan", icon: FiStar, color: "#fbb049" },
                { value: stats.badges.toString(), label: "Rozet", icon: FiAward, color: "#004d40" },
                { value: "%94", label: "Memnuniyet", icon: FiTrendingUp, color: "#fbb049" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${stat.color}10` }}
                  >
                    <stat.icon size={22} style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-heading">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#004d40] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbb049] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">
            Harekete Geç,{" "}
            <span className="text-[#fbb049]">Fırsatı Yakala</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={openRegister}
              className="bg-[#fbb049] hover:bg-[#f9a825] text-[#004d40] font-bold px-10 py-4 rounded-xl text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#fbb049]/25 hover:-translate-y-0.5"
            >
              Ücretsiz Hesap Oluştur
            </button>
            <button
              onClick={openLogin}
              className="border-2 border-white/30 hover:border-white/60 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h4 className="text-white font-bold text-xl mb-4 font-heading">
            BridgePlatform
          </h4>
          <p className="text-sm">
            © {new Date().getFullYear()} BridgePlatform. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

