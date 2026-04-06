export interface SubCategory {
  value: string;
  label: string;
}

export interface Category {
  value: string;
  label: string;
  subcategories: SubCategory[];
}

export const TASK_CATEGORIES: Category[] = [
  {
    value: "programming",
    label: "Programlama",
    subcategories: [
      { value: "frontend", label: "Frontend Geliştirme" },
      { value: "backend", label: "Backend Geliştirme" },
      { value: "fullstack", label: "Full Stack Geliştirme" },
      { value: "mobile", label: "Mobil Uygulama Geliştirme" },
      { value: "game", label: "Oyun Geliştirme" },
      { value: "embedded", label: "Gömülü Sistemler" },
      { value: "devops", label: "DevOps & CI/CD" },
      { value: "api", label: "API Geliştirme" },
      { value: "testing", label: "Test & QA" },
      { value: "desktop", label: "Masaüstü Uygulama" },
    ],
  },
  {
    value: "design",
    label: "Tasarım",
    subcategories: [
      { value: "uiux", label: "UI/UX Tasarım" },
      { value: "graphic", label: "Grafik Tasarım" },
      { value: "web_design", label: "Web Tasarım" },
      { value: "mobile_design", label: "Mobil Tasarım" },
      { value: "branding", label: "Marka Kimliği" },
      { value: "illustration", label: "İllüstrasyon" },
      { value: "motion", label: "Motion Design" },
      { value: "3d", label: "3D Modelleme" },
      { value: "product_design", label: "Ürün Tasarımı" },
    ],
  },
  {
    value: "data",
    label: "Veri Bilimi & Yapay Zeka",
    subcategories: [
      { value: "ml", label: "Makine Öğrenimi" },
      { value: "deep_learning", label: "Derin Öğrenme" },
      { value: "nlp", label: "Doğal Dil İşleme (NLP)" },
      { value: "computer_vision", label: "Bilgisayarlı Görü" },
      { value: "data_analysis", label: "Veri Analizi" },
      { value: "data_engineering", label: "Veri Mühendisliği" },
      { value: "bi", label: "İş Zekası (BI)" },
      { value: "statistics", label: "İstatistik & Modelleme" },
    ],
  },
  {
    value: "marketing",
    label: "Pazarlama",
    subcategories: [
      { value: "digital_marketing", label: "Dijital Pazarlama" },
      { value: "seo", label: "SEO & SEM" },
      { value: "social_media", label: "Sosyal Medya Yönetimi" },
      { value: "content_marketing", label: "İçerik Pazarlama" },
      { value: "email_marketing", label: "E-posta Pazarlama" },
      { value: "influencer", label: "Influencer Pazarlama" },
      { value: "brand_strategy", label: "Marka Stratejisi" },
      { value: "market_research", label: "Pazar Araştırması" },
    ],
  },
  {
    value: "content",
    label: "İçerik Üretimi",
    subcategories: [
      { value: "copywriting", label: "Metin Yazarlığı" },
      { value: "blog", label: "Blog Yazarlığı" },
      { value: "technical_writing", label: "Teknik Yazarlık" },
      { value: "translation", label: "Çeviri" },
      { value: "video_production", label: "Video Prodüksiyon" },
      { value: "podcast", label: "Podcast Üretimi" },
      { value: "photography", label: "Fotoğrafçılık" },
    ],
  },
  {
    value: "business",
    label: "İş & Yönetim",
    subcategories: [
      { value: "project_management", label: "Proje Yönetimi" },
      { value: "business_analysis", label: "İş Analizi" },
      { value: "consulting", label: "Danışmanlık" },
      { value: "hr", label: "İnsan Kaynakları" },
      { value: "finance", label: "Finans & Muhasebe" },
      { value: "operations", label: "Operasyon Yönetimi" },
      { value: "strategy", label: "İş Stratejisi" },
      { value: "entrepreneurship", label: "Girişimcilik" },
    ],
  },
  {
    value: "cybersecurity",
    label: "Siber Güvenlik",
    subcategories: [
      { value: "network_security", label: "Ağ Güvenliği" },
      { value: "penetration_testing", label: "Sızma Testi" },
      { value: "security_analysis", label: "Güvenlik Analizi" },
      { value: "cryptography", label: "Kriptografi" },
      { value: "incident_response", label: "Olay Müdahalesi" },
      { value: "compliance", label: "Uyumluluk & Denetim" },
    ],
  },
  {
    value: "cloud",
    label: "Bulut & Altyapı",
    subcategories: [
      { value: "aws", label: "AWS" },
      { value: "azure", label: "Microsoft Azure" },
      { value: "gcp", label: "Google Cloud" },
      { value: "docker", label: "Docker & Kubernetes" },
      { value: "linux_admin", label: "Linux Yönetimi" },
      { value: "network_admin", label: "Ağ Yönetimi" },
      { value: "database_admin", label: "Veritabanı Yönetimi" },
    ],
  },
  {
    value: "education",
    label: "Eğitim & Araştırma",
    subcategories: [
      { value: "tutoring", label: "Özel Ders / Mentorluk" },
      { value: "curriculum", label: "Müfredat Geliştirme" },
      { value: "academic_research", label: "Akademik Araştırma" },
      { value: "elearning", label: "E-öğrenme İçeriği" },
      { value: "workshop", label: "Atölye / Workshop" },
    ],
  },
  {
    value: "engineering",
    label: "Mühendislik",
    subcategories: [
      { value: "mechanical", label: "Makine Mühendisliği" },
      { value: "electrical", label: "Elektrik-Elektronik" },
      { value: "civil", label: "İnşaat Mühendisliği" },
      { value: "industrial", label: "Endüstri Mühendisliği" },
      { value: "biomedical", label: "Biyomedikal Mühendisliği" },
      { value: "environmental", label: "Çevre Mühendisliği" },
      { value: "cad_cam", label: "CAD/CAM Tasarım" },
    ],
  },
  {
    value: "other",
    label: "Diğer",
    subcategories: [
      { value: "other_general", label: "Genel" },
      { value: "other_volunteer", label: "Gönüllü Çalışma" },
      { value: "other_event", label: "Etkinlik Organizasyonu" },
    ],
  },
];

/**
 * Get subcategories for a given category value
 */
export function getSubcategories(categoryValue: string): SubCategory[] {
  const category = TASK_CATEGORIES.find((c) => c.value === categoryValue);
  return category?.subcategories ?? [];
}

/**
 * Get category label by value
 */
export function getCategoryLabel(categoryValue: string): string {
  return TASK_CATEGORIES.find((c) => c.value === categoryValue)?.label ?? categoryValue;
}

/**
 * Get subcategory label by category and subcategory values
 */
export function getSubcategoryLabel(categoryValue: string, subcategoryValue: string): string {
  const subs = getSubcategories(categoryValue);
  return subs.find((s) => s.value === subcategoryValue)?.label ?? subcategoryValue;
}
