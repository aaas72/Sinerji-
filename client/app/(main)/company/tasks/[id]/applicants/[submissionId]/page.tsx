"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import MainSection from "@/components/layout/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import StepsTracker, { StepItem } from "@/components/ui/StepsTracker";
import { submissionService } from "@/services/submission.service";
import { taskService } from "@/services/task.service";
import { Submission } from "@/types/submission";
import { Task } from "@/types/task";
import { useToast } from "@/context/ToastContext";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiX,
  FiCheck,
  FiStar,
  FiAlertCircle,
  FiInfo,
  FiCreditCard,
  FiMessageSquare,
  FiClock,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";
import { reviewService } from "@/services/review.service";
import FormInput from "@/components/ui/form/FormInput";
import FormTextarea from "@/components/ui/form/FormTextarea";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const taskId = Number(params.id);
  const submissionId = Number(params.submissionId);

  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Modal actions states
  const [actionLoading, setActionLoading] = useState<"approved" | "rejected" | "reviewing" | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [hasReview, setHasReview] = useState(false);

  // Checkout card form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: "",
    cardNumber: "",
    expireMonth: "",
    expireYear: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!taskId || !submissionId) return;
      try {
        const [taskData, submissionData] = await Promise.all([
          taskService.getTaskById(taskId),
          submissionService.getSubmission(submissionId),
        ]);
        setTask(taskData);
        setSubmission(submissionData);
        if (submissionData.review) {
          setRating(submissionData.review.rating || 5);
          setFeedback(submissionData.review.feedback || "");
          setHasReview(true);
        }
      } catch (err: any) {
        showToast("Veri yüklenirken bir hata oluştu.", "error");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [taskId, submissionId]);

  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!submission) return;
    setActionLoading(status);
    try {
      const updated = await submissionService.updateSubmission(submission.id, status);
      setSubmission(updated);
      showToast(
        status === "approved" ? "Başvuru onaylandı ve bütçe öğrenciye aktarıldı." : "Başvuru reddedildi.",
        status === "approved" ? "success" : "error"
      );
      if (status === "approved") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00342b', '#004d40', '#e28743', '#dfded6']
        });
      }
      if (status === "rejected") {
        router.push(`/company/tasks/${taskId}/applicants`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!submission) return;
    setActionLoading("reviewing");
    try {
      await reviewService.createReview(submission.id, { rating, feedback });
      showToast("Değerlendirme başarıyla kaydedildi.", "success");
      setHasReview(true);
    } catch {
      showToast("Değerlendirme kaydedilirken bir hata oluştu.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;
    setPayLoading(true);
    try {
      const updated = await submissionService.paySubmission(submission.id, cardForm);
      setSubmission(updated);
      showToast("Ödeme alındı ve bütçe Escrow güvenli havuzunda kilitlendi.", "success");
      setShowPayForm(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Ödeme işlemi başarısız oldu.", "error");
    } finally {
      setPayLoading(false);
    }
  };

  const handleOfferUnpaid = async () => {
    if (!submission) return;
    setPayLoading(true);
    try {
      const updated = await submissionService.offerUnpaidSubmission(submission.id);
      setSubmission(updated);
      showToast("Öğrenciye görev teklifi başarıyla gönderildi.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Teklif gönderilemedi.", "error");
    } finally {
      setPayLoading(false);
    }
  };

  const autoFillTestCard = () => {
    setCardForm({
      cardHolderName: "Sinerji Test Company",
      cardNumber: "5890040000000016",
      expireMonth: "12",
      expireYear: "30",
      cvv: "123",
    });
    showToast("Test kartı bilgileri dolduruldu.", "info");
  };

  if (loadingData) return <PageLoadingSkeleton />;
  if (!submission) return <div className="p-12 text-center text-gray-500 font-bold">Başvuru bulunamadı.</div>;

  const budgetAmount = task?.budget || task?.reward_amount || submission.proposed_budget || "1000";
  const studentHasBank = !!submission.student.sub_merchant_key;
  const isPaid = submission.payment_status === "escrow_locked";
  const isReleased = submission.payment_status === "released";
  const isMonetaryTask = task?.reward_type === "money";

  const reviewSteps: StepItem[] = [
    {
      id: 1,
      title: "İnceleme",
      status: submission.status === "pending" ? "active" : "completed",
    },
    {
      id: 2,
      title: isMonetaryTask ? "Escrow / Ödeme" : "Teklif / Onay",
      status: (!isMonetaryTask && submission.status !== "pending") || isPaid || isReleased ? "completed" : "inactive",
    },
    {
      id: 3,
      title: "Değerlendirme",
      status: submission.status === "approved" ? "active" : "inactive",
    },
  ];

  return (
    <div className="min-h-screen w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 bg-[#faf9f6] text-[#00342b] relative flex flex-col font-sans">
      {/* Dynamic Synaptic Line Background Decorations */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100,200 Q400,100 800,400 T1600,200" fill="none" stroke="#004d40" strokeDasharray="10 5" strokeWidth="0.5" />
        <path d="M-100,800 Q600,900 1200,600 T1800,800" fill="none" stroke="#e28743" strokeDasharray="8 4" strokeWidth="0.5" />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .avatar-gradient { background: linear-gradient(135deg, #004d40 0%, #00342b 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #bfc9c4; border-radius: 10px; }
        .premium-shadow { box-shadow: 0 20px 50px rgba(0, 52, 43, 0.06); }
      `}} />

      {/* Breadcrumb Area */}
      <Breadcrumb
        items={[
          { label: "Panel", href: "/company/dashboard" },
          { label: "Görevlerim", href: "/company/tasks" },
          { label: task?.title || "Görev", href: `/company/tasks` },
          { label: "Başvurular", href: `/company/tasks/${taskId}/applicants` },
          { label: "Aday Detayı", active: true },
        ]}
      />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        {/* Header Bar */}
        <div className="mb-8 mt-2">
          <h1 className="text-2xl font-extrabold text-[#00342b]">Aday İnceleme ve {isMonetaryTask ? "Ödeme" : "Onay"}</h1>
        </div>

        {/* Main Columns Content - Mockup style */}
        <div className="bg-white w-full rounded-3xl premium-shadow overflow-hidden flex flex-col md:flex-row border border-[#DFDED6]">
          
          {/* Sidebar / Left Column (35% width) - Always shows candidate details */}
          <aside className="w-full md:w-[35%] bg-white p-6 md:p-8 flex flex-col gap-6 md:gap-8 border-r border-[#DFDED6] shrink-0">
            {/* Candidate Info Summary */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 avatar-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                  {submission.student.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#00342b]">
                    {submission.student.full_name}
                  </h2>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar
                        key={s}
                        className={`w-4 h-4 ${
                          s <= (submission.review?.rating || 4.5)
                            ? "text-[#e28743] fill-[#e28743]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-1">
                      {submission.review?.rating ? `${submission.review.rating}.0` : "4.5"}/5.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio description if available */}
              {submission.student.bio && (
                <p className="text-xs text-[#565e74] italic leading-relaxed mt-1">
                  "{submission.student.bio}"
                </p>
              )}
            </div>

            {/* Candidate Metadata Sections */}
            <div className="space-y-6">
              {/* Educational info */}
              <div>
                <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Eğitim</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#00342b]">
                    <FaUniversity className="text-gray-400 w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">{submission.student.university || "Üniversite belirtilmemiş"}</span>
                  </div>
                </div>
              </div>

              {/* Communication info */}
              {submission.status !== 'pending' && submission.status !== 'rejected' && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">İletişim</h4>
                  <Link
                    href={`/company/messages?studentId=${submission.student_user_id}`}
                    className="w-full py-2.5 bg-[#00342b] text-white rounded-full font-bold text-xs hover:bg-[#004d40] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FiMessageSquare className="w-3.5 h-3.5" />
                    Mesaj Gönder
                  </Link>
                </div>
              )}

              {/* Task and Terms details */}
              {task && (
                <div>
                  <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Görev ve Şartlar</h4>
                  <div className="space-y-3 text-xs pl-1">
                    <div className="font-bold text-[#00342b] truncate" title={task.title}>{task.title}</div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#DFDED6]">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <FiDollarSign className="text-gray-400 w-3.5 h-3.5 shrink-0" />
                        <span>Ödül / Bütçe:</span>
                      </span>
                      <span className="font-bold text-[#00342b]">
                        {isMonetaryTask ? `₺${task.budget || task.reward_amount || budgetAmount}` : (task?.reward_type === 'certificate' ? 'Sertifika' : (task?.reward_type === 'internship' ? 'Staj / Deneyim' : 'Gönüllü / Deneyim'))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <FiClock className="text-gray-400 w-3.5 h-3.5 shrink-0" />
                        <span>Teslim Süresi:</span>
                      </span>
                      <span className="font-bold text-[#00342b]">{submission.estimated_delivery_days ? `${submission.estimated_delivery_days} Gün` : "Belirtilmemiş"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400 w-3.5 h-3.5 shrink-0" />
                        <span>Başvuru Tarihi:</span>
                      </span>
                      <span className="font-bold text-[#00342b]">
                        {new Date(submission.submitted_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Application Status Card in Sidebar */}
            <div className="mt-auto pt-6 border-t border-[#DFDED6]">
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Başvuru Durumu</h4>
              {submission.status === "approved" ? (
                <div className="text-[#00342b] flex items-center justify-between text-xs pl-1 font-bold">
                  <span>Onaylandı</span>
                  <FiCheckCircle className="text-[#e28743] w-5 h-5" />
                </div>
              ) : submission.status === "rejected" ? (
                <div className="text-[#565e74] flex items-center justify-between text-xs pl-1 font-bold">
                  <span>Reddedildi</span>
                  <FiX className="text-gray-500 w-5 h-5" />
                </div>
              ) : (
                <div className="text-[#00342b] flex items-center justify-between text-xs pl-1 font-bold">
                  <span>Bekliyor</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main Modal Content (65% width) */}
          <div className="w-full md:w-[65%] flex flex-col bg-[#F1F0EA]">
            
            {/* Top AI Matchmaking Header Banner - Stretched, no margins */}
            <div className="bg-[#00342b] text-white w-full px-6 md:px-10 py-6 relative overflow-hidden shrink-0 border-b border-[#DFDED6]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743]/10 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#dfded6] uppercase tracking-wider">AI Analizi Aktif</span>
                </div>
                <div className="text-3xl font-extrabold text-[#e28743]">
                  %{Number(submission.ai_match_details?.score || submission.ai_match_score || 0).toFixed(2)}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white relative z-10">Akıllı Eşleşme Analizi</h3>
              <p className="text-[10px] text-white/80 mt-0.5 relative z-10">Adayın davranışsal kalıpları ve teknik yeterlilik analizi.</p>
            </div>

            {/* Padded Content Wrapper */}
            <div className="p-6 md:p-10 flex flex-col gap-8 md:gap-10 justify-between flex-grow">
              <div className="space-y-8 w-full">
                
                {/* Dynamic steps tracker at the top of the main area */}
                <StepsTracker steps={reviewSteps} layout="inline" className="pb-6 border-b border-[#DFDED6]" />

                {/* SECTION 1: Cover Letter / Submission Content */}
                <section className="relative bg-transparent p-0 overflow-hidden">
                  <div className="relative z-10 pl-0">
                    <h3 className="text-xs font-bold text-[#00342b] mb-3 flex items-center gap-2">
                      <FiBookOpen className="text-sm text-[#e28743]" />
                      Adayın Başvuru Açıklaması
                    </h3>
                    <p className="text-sm text-[#00342b] italic leading-relaxed font-medium">
                      "{formatSubmissionContent(submission.submission_content, "İçerik belirtilmemiş.")}"
                    </p>
                  </div>
                </section>

                {/* SECTION 2: AI Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-transparent p-0">
                    <p className="text-xs font-bold text-[#00342b] mb-2.5">
                      Güçlü Yönler
                    </p>
                    <ul className="text-xs text-[#00342b] space-y-1.5 list-disc list-inside pl-1">
                      {submission.ai_match_details?.strengths?.map((s, idx) => (
                        <li key={idx} className="leading-relaxed">{s}</li>
                      )) || <li className="italic text-gray-500">Veri yok</li>}
                    </ul>
                  </div>
                  <div className="bg-transparent p-0">
                    <p className="text-xs font-bold text-[#565e74] mb-2.5">
                      Gelişim Alanları
                    </p>
                    <ul className="text-xs text-[#00342b] space-y-1.5 list-disc list-inside pl-1">
                      {submission.ai_match_details?.weaknesses?.map((w, idx) => (
                        <li key={idx} className="leading-relaxed">{w}</li>
                      )) || <li className="italic text-gray-500">Veri yok</li>}
                    </ul>
                  </div>
                </div>

              {/* SECTION 3: Decision & Payment Workflow */}
              {submission.status === "pending" || submission.status === "offered" || submission.status === "accepted" || submission.status === "submitted" ? (
                <section className="space-y-6 pt-6 border-t border-[#DFDED6]">
                  {submission.status === "pending" && (
                    <>
                      <h3 className="text-base font-bold text-[#00342b]">Güvenli Ödeme ve Karar Süreci</h3>
                      
                      {/* 1. Banking check: Student must have bank details */}
                      {isMonetaryTask && !studentHasBank && (
                        <div className="text-xs text-[#00342b] flex items-start gap-2.5 pl-0 py-1">
                          <FiAlertCircle className="w-5 h-5 text-[#e28743] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-[#e28743]">Ödeme Tanımlanamaz</span>
                            Aday henüz banka hesabı (Sub-Merchant) tanımlamamıştır. Bu adaya bütçe kilitleme işlemi yapılamaz.
                          </div>
                        </div>
                      )}

                      {/* 2. If student has bank details but payment not locked yet */}
                      {isMonetaryTask && studentHasBank && !isPaid && !isReleased && (
                        <div className="relative overflow-hidden">
                          {/* Button Container */}
                          <div
                            className={`transition-all duration-500 ease-in-out transform ${
                              showPayForm
                                ? "max-h-0 opacity-0 pointer-events-none -translate-y-8 overflow-hidden"
                                : "max-h-[250px] opacity-100 translate-y-0"
                            }`}
                          >
                            <div className="flex flex-col gap-3 pb-4">
                              <div className="text-xs text-[#00342b] flex items-start gap-2.5 pl-0 py-1">
                                <FiInfo className="w-5 h-5 text-[#e28743] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block text-[#e28743]">Güvenli Escrow Ödemesi</span>
                                  Görevi onaylamadan önce bütçeyi güvenceye almanız gerekmektedir. Ödeme Iyzico Sandbox havuzunda kilitlenir, teslimat onaylandığında öğrenciye aktarılır.
                                </div>
                              </div>
                              <button
                                onClick={() => setShowPayForm(true)}
                                className="w-fit py-3.5 px-8 bg-[#00342b] relative overflow-hidden text-white rounded-full font-bold text-sm shadow-lg shadow-[#00342b]/20 hover:bg-[#004d40] transition-all active:scale-95 cursor-pointer group"
                              >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                  <FiCreditCard className="w-3.5 h-3.5" />
                                  Bütçeyi Escrow'da Kilitle ({budgetAmount} TL)
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* Card Details Form Container */}
                          <div
                            className={`transition-all duration-500 ease-in-out transform origin-bottom ${
                              showPayForm
                                ? "max-h-[800px] opacity-100 translate-y-0 pointer-events-auto"
                                : "max-h-0 opacity-0 translate-y-8 overflow-hidden pointer-events-none"
                            }`}
                          >
                            <form onSubmit={handlePayEscrow} className="space-y-4 pb-4">
                              <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center pb-2 border-b border-[#dfded6]">
                                  <span className="text-xs font-bold text-[#00342b] uppercase">Kart Bilgileri</span>
                                  <button
                                    type="button"
                                    onClick={autoFillTestCard}
                                    className="text-[10px] text-[#e28743] hover:underline font-bold"
                                  >
                                    ⚡ Test Kartını Doldur
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-4">
                                  <FormInput
                                    label="Kart Sahibi"
                                    type="text"
                                    required
                                    placeholder="Alexander Sinerji"
                                    value={cardForm.cardHolderName}
                                    onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value })}
                                    inputSize="sm"
                                    className="bg-white !rounded-full px-5 border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                                  />
                                  <FormInput
                                    label="Kart Numarası"
                                    type="text"
                                    required
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={16}
                                    value={cardForm.cardNumber}
                                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                                    inputSize="sm"
                                    className="bg-white !rounded-full px-5 border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                                    icon={FiCreditCard}
                                    iconPosition="right"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#00342b] select-none">Son Kullanma</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <FormInput
                                        type="text"
                                        required
                                        placeholder="AA"
                                        maxLength={2}
                                        value={cardForm.expireMonth}
                                        onChange={(e) => setCardForm({ ...cardForm, expireMonth: e.target.value })}
                                        inputSize="sm"
                                        className="bg-white text-center !rounded-full px-2 border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                                      />
                                      <FormInput
                                        type="text"
                                        required
                                        placeholder="YY"
                                        maxLength={2}
                                        value={cardForm.expireYear}
                                        onChange={(e) => setCardForm({ ...cardForm, expireYear: e.target.value })}
                                        inputSize="sm"
                                        className="bg-white text-center !rounded-full px-2 border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                                      />
                                    </div>
                                  </div>
                                  <FormInput
                                    label="CVV"
                                    type="password"
                                    required
                                    placeholder="***"
                                    maxLength={3}
                                    value={cardForm.cvv}
                                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                                    inputSize="sm"
                                    className="bg-white text-center !rounded-full px-5 border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => setShowPayForm(false)}
                                  className="w-fit px-8 py-3.5 border border-[#dfded6] text-[#565e74] rounded-full font-bold text-xs bg-white hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                                >
                                  İptal
                                </button>
                                <button
                                  type="submit"
                                  disabled={payLoading}
                                  className="w-fit px-8 py-3.5 bg-[#00342b] relative overflow-hidden text-white rounded-full font-bold text-xs hover:bg-[#004d40] transition-all active:scale-95 disabled:opacity-50 cursor-pointer group"
                                >
                                  <div className="relative z-10 flex items-center justify-center gap-1.5">
                                    <FiCheck className="w-3.5 h-3.5" />
                                    {payLoading ? "Ödeniyor..." : `Ödemeyi Tamamla`}
                                  </div>
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

                      {/* 3. Non-Monetary Task Offer button */}
                      {!isMonetaryTask && submission.status === 'pending' && (
                        <div className="relative overflow-hidden">
                           <div className="flex flex-col gap-3 pb-4">
                              <div className="text-xs text-[#00342b] flex items-start gap-2.5 pl-0 py-1">
                                <FiInfo className="w-5 h-5 text-[#e28743] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block text-[#e28743]">Staj / Referans Görevi</span>
                                  Bu görev finansal bir ödül içermemektedir. Herhangi bir ödeme yapmadan öğrenciye doğrudan teklif gönderebilirsiniz.
                                </div>
                              </div>
                              <button
                                onClick={handleOfferUnpaid}
                                disabled={payLoading}
                                className="w-fit py-3.5 px-8 bg-[#00342b] relative overflow-hidden text-white rounded-full font-bold text-sm shadow-lg shadow-[#00342b]/20 hover:bg-[#004d40] transition-all active:scale-95 cursor-pointer group disabled:opacity-50"
                              >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                  <FiCheck className="w-3.5 h-3.5" />
                                  {payLoading ? "Gönderiliyor..." : "Öğrenciye Teklif Gönder"}
                                </div>
                              </button>
                            </div>
                        </div>
                      )}
                    </>
                  )}

                  {submission.status === "offered" && (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <h4 className="text-lg font-extrabold text-[#00342b]">Öğrencinin Yanıtı Bekleniyor</h4>
                      <p className="text-sm text-[#565e74] mt-2 max-w-md mx-auto leading-relaxed">
                        Teklifiniz öğrenciye iletildi. Şu anda adayın teklifi kabul etmesi bekleniyor.
                      </p>
                    </div>
                  )}

                  {submission.status === "accepted" && (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <h4 className="text-lg font-extrabold text-[#00342b]">Öğrencinin Teslimatı Bekleniyor</h4>
                      <p className="text-sm text-[#565e74] mt-2 max-w-sm">
                        {isMonetaryTask ? "Bütçe başarıyla güvence altına alındı. Öğrenci çalışmayı teslim ettiğinde burada inceleyip onaylayabilirsiniz." : "Teklif kabul edildi. Öğrenci çalışmayı teslim ettiğinde burada inceleyip onaylayabilirsiniz."}
                      </p>
                    </div>
                  )}

                  {submission.status === "submitted" && (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center text-center py-6">
                        <h4 className="text-lg font-extrabold text-[#00342b]">Çalışma Teslim Edildi</h4>
                        <p className="text-sm text-[#565e74] mt-2 max-w-sm">
                          {isMonetaryTask ? "Öğrenci çalışmayı teslim etti. Lütfen inceleyin ve ödemeyi serbest bırakın." : "Öğrenci çalışmayı teslim etti. Lütfen inceleyin ve onaylayın."}
                        </p>
                        <div className="mt-4 text-sm font-bold text-[#565e74] truncate max-w-full">
                          Teslim Edilen Link: <a href={submission.submission_content || undefined} target="_blank" className="hover:underline text-[#00342b]">{submission.submission_content}</a>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusChange("rejected")}
                          disabled={actionLoading === "rejected"}
                          className="flex-1 py-3.5 border-2 border-gray-400 text-gray-700 bg-white rounded-full font-bold hover:bg-gray-100 hover:text-[#00342b] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <FiX className="w-4 h-4" />
                          {actionLoading === "rejected" ? "İşleniyor..." : "Reddet"}
                        </button>
                        <button
                          onClick={() => handleStatusChange("approved")}
                          disabled={actionLoading === "approved"}
                          className="flex-1 py-3.5 bg-[#00342b] relative overflow-hidden text-white rounded-full font-bold shadow-lg shadow-[#00342b]/20 hover:bg-[#004d40] transition-all active:scale-95 disabled:opacity-50 cursor-pointer group"
                        >
                          <div className="relative z-10 flex items-center justify-center gap-2">
                            <FiCheck className="w-4 h-4" />
                            {actionLoading === "approved" ? "İşleniyor..." : (isMonetaryTask ? "Onayla ve Öde" : "Onayla")}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              ) : submission.status === "approved" ? (
                <section className="space-y-6 pt-6 border-t border-[#DFDED6]">
                  {/* Status Banner */}
                  <div className="text-xs text-[#00342b] flex items-start gap-2.5 pl-0 py-1">
                    <div>
                      <span className="font-bold block text-[#e28743]">
                        {isMonetaryTask ? "Ödeme Serbest Bırakıldı!" : "Görev Başarıyla Tamamlandı!"}
                      </span>
                      {isMonetaryTask ? "Öğrenciye hak ettiği tutar (Komisyon düşülerek) başarıyla transfer edildi. Şimdi adayı değerlendirebilirsiniz." : "Öğrenci görevini başarıyla tamamladı. Şimdi adayı değerlendirebilirsiniz."}
                    </div>
                  </div>

                  {/* Rating & Feedback Form */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#00342b]">Aday Değerlendirmesi</h3>
                    <div className="space-y-6">
                      {hasReview ? (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-[#00342b] flex items-center gap-2 pb-2 border-b border-[#dfded6]">
                            <FiCheckCircle className="text-[#e28743] w-4.5 h-4.5" /> Değerlendirme Kaydedildi
                          </h4>
                          <div className="space-y-2 pl-0 py-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FiStar key={s} className={`w-4 h-4 ${s <= rating ? "text-[#e28743] fill-[#e28743]" : "text-gray-300"}`} />
                              ))}
                              <span className="text-xs font-bold ml-2 text-[#00342b]">{rating}/5.0</span>
                            </div>
                            <p className="text-xs text-[#00342b] italic leading-relaxed font-medium">{feedback || "Geri bildirim yok."}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Star Rating */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-[#00342b]">Teknik Yeterlilik</p>
                            <div className="flex gap-1.5" id="star-rating">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => setRating(s)}
                                  className="p-1 hover:scale-115 hover:rotate-6 transition-transform duration-200 cursor-pointer"
                                >
                                  <FiStar
                                    className={`w-8 h-8 transition-colors ${
                                      s <= rating
                                        ? "text-[#e28743] fill-[#e28743]"
                                        : "text-gray-300 hover:text-[#e28743]"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Feedback Textarea */}
                          <div className="space-y-3">
                            <FormTextarea
                              label="Detaylı Geri Bildirim"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Adayın performansı ve teslimatı hakkında geri bildirimlerinizi yazın..."
                              rows={4}
                              className="bg-white !rounded-2xl border-[#DFDED6] focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {!hasReview && (
                      <button
                        onClick={handleReviewSubmit}
                        disabled={actionLoading === "reviewing"}
                        className="w-full py-4 bg-[#00342b] text-white rounded-full font-bold text-sm hover:bg-[#004d40] active:scale-95 transition-all shadow-lg shadow-[#00342b]/20 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading === "reviewing" ? "Kaydediliyor..." : "Değerlendirmeyi Gönder"}
                      </button>
                    )}
                  </div>
                </section>
              ) : (
                <section className="pt-6 border-t border-[#DFDED6]">
                  <div className="flex items-center justify-center gap-2 text-xs text-[#565e74] font-medium py-6">
                    <FiX className="text-[#565e74] w-4 h-4" />
                    <span>Bu başvuru reddedilmiştir.</span>
                  </div>
                </section>
              )}
            </div>

            {/* Information Disclaimer */}
            {isMonetaryTask && (
              <p className="text-center text-[10px] font-bold text-[#565e74] uppercase tracking-wider px-12 pt-6 border-t border-[#DFDED6]">
                Your payment is held securely in escrow and will only be released once the review validation process is finalized.
              </p>
            )}
          </div>
        </div>
        </div>
      </MainSection>
    </div>
  );
}


function formatSubmissionContent(content: string | null | undefined, fallback: string): string {
  if (!content) return fallback;

  const withoutTags = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  let decoded = withoutTags;
  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = withoutTags;
    decoded = textarea.value;
  } else {
    decoded = withoutTags
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  const normalized = decoded
    .replace(/^\s*\[\s*BAŞVURU\s+MEKTUBU\s*\]\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}
