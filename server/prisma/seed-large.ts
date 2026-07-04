import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const maleFirstNames = ['Ahmet', 'Mehmet', 'Ali', 'Can', 'Burak', 'Cem', 'Deniz', 'Emre', 'Hakan', 'Kaan', 'Onur', 'Ozan', 'Tolga', 'Umut', 'Volkan', 'Berk', 'Doruk', 'Ege', 'Furkan', 'Görkem', 'Alp', 'Batu', 'Engin', 'Gökhan', 'İlker', 'Bora', 'Oğuz', 'Turan', 'Yasin', 'Mert', 'Murat'];
const femaleFirstNames = ['Ayşe', 'Fatma', 'Zeynep', 'Ece', 'Gizem', 'Irem', 'Merve', 'Selin', 'Yagmur', 'Ceren', 'Aylin', 'Büşra', 'Ceyda', 'Defne', 'Elif', 'Hazal', 'Bahar', 'Sena', 'Sinem'];
const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Güneş', 'Bulut', 'Turan', 'Yavuz', 'Erdoğan', 'Aksoy', 'Tekin', 'Çakır', 'Köse', 'Aktaş', 'Gül', 'Polat', 'Sarı', 'Korkmaz', 'Şen', 'Yalçın', 'Uysal', 'Bozkurt', 'Keser', 'Taş', 'Karaca'];
const universities = ['Boğaziçi Üniversitesi', 'ODTÜ', 'İTÜ', 'Bilkent Üniversitesi', 'Koç Üniversitesi', 'Sabancı Üniversitesi', 'Yıldız Teknik Üniversitesi', 'Hacettepe Üniversitesi', 'Ankara Üniversitesi', 'Marmara Üniversitesi', 'Ege Üniversitesi', 'Dokuz Eylül Üniversitesi', 'Galatasaray Üniversitesi', 'Gazi Üniversitesi', 'Anadolu Üniversitesi'];

const categories = {
  YazilimGelistirme: {
    majors: ['Bilgisayar Mühendisliği', 'Yazılım Mühendisliği', 'Bilişim Sistemleri', 'Matematik Mühendisliği'],
    skills: ['React.js', 'Node.js', 'Vue.js', 'Angular', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'GraphQL', 'REST API', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Azure'],
    taskTitles: ['Kurumsal E-Ticaret Platformu Backend Geliştirme', 'Mobil Sipariş Uygulaması Geliştirme (Flutter)', 'Yüksek Trafikli Web Uygulaması Optimizasyonu', 'Mikroservis Mimarisinde API Geliştirme', 'Legacy Kod Refactoring ve Test Yazımı'],
    studentBios: [
      "Üniversite eğitimim boyunca full-stack web geliştirme üzerine yoğunlaştım. Özellikle modern JavaScript frameworkleri (React, Node.js) ile karmaşık ve ölçeklenebilir uygulamalar geliştirme konusunda tecrübe kazandım. Temiz kod (clean code) prensiplerine ve çevik (agile) proje yönetimi süreçlerine hakimim. Sürekli öğrenmeye ve yeni teknolojileri denemeye hevesli bir mühendisim.",
      "Mobil uygulama geliştirme ve backend entegrasyonları üzerine uzmanlaşıyorum. Çeşitli hackathonlarda ödüller kazandım ve açık kaynak projelere katkıda bulunuyorum. Algoritma tasarımı ve veritabanı optimizasyonu konularında iddialıyım. Amacım, milyonlarca kullanıcının hayatını kolaylaştıracak yazılımlar üretmek."
    ],
    companyDescs: [
      "Firmamız, finans ve e-ticaret sektörlerine yönelik yenilikçi yazılım çözümleri sunmaktadır. Bulut bilişim ve modern web teknolojilerini kullanarak, müşterilerimizin dijital dönüşüm süreçlerini hızlandırıyoruz. Çevik (Agile) yöntemlerle çalışan, teknolojiye tutkulu ve inovasyonu merkezine alan bir ekibiz. Yeni yetenekleri bünyemize katarak sektördeki liderliğimizi sürdürmeyi hedefliyoruz.",
      "Mobil ve web tabanlı kurumsal uygulamalar geliştiren, ödüllü bir teknoloji şirketiyiz. Microservices mimarisi ve yüksek erişilebilirlik (high availability) konularında derin uzmanlığa sahibiz. Vizyonumuz, kullanıcı deneyimini mükemmelleştiren ve iş süreçlerini optimize eden yazılımlar üretmektir."
    ],
    industries: ['Yazılım', 'Bilişim Teknolojileri', 'SaaS', 'Mobil Uygulama']
  },
  VeriVeYapayZeka: {
    majors: ['Yapay Zeka Mühendisliği', 'İstatistik', 'Endüstri Mühendisliği', 'Bilgisayar Mühendisliği'],
    skills: ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Python', 'R', 'TensorFlow', 'PyTorch', 'SQL', 'Data Visualization', 'NLP', 'Computer Vision', 'Pandas', 'Apache Spark', 'Hadoop'],
    taskTitles: ['Müşteri Kayıp Tahmini (Churn) Modeli Geliştirme', 'Doğal Dil İşleme ile Duygu Analizi', 'Görüntü İşleme Tabanlı Ürün Tanıma Sistemi', 'Büyük Veri (Big Data) Analizi ve Görselleştirme', 'Satış Tahminleme Algoritması Tasarımı'],
    studentBios: [
      "Veri bilimi ve makine öğrenmesi algoritmaları üzerine tutkulu bir öğrenciyim. Veriden anlamlı içgörüler (insights) çıkarma ve tahmine dayalı modeller kurma konusunda projeler geliştirdim. Python veri bilimi ekosistemine (Pandas, Scikit-learn, TensorFlow) ileri seviyede hakimim. Karmaşık problemleri veri odaklı yaklaşımlarla çözmeyi seviyorum.",
      "Doğal dil işleme (NLP) ve derin öğrenme alanlarına odaklanıyorum. Akademik araştırmalarımda transformer modelleri ve büyük dil modelleri (LLM) üzerine çalışmalar yaptım. Amacım, yapay zekanın gücünü kullanarak gerçek dünya problemlerine inovatif ve ölçeklenebilir çözümler üretmek."
    ],
    companyDescs: [
      "Veri odaklı karar alma süreçlerini devrimleştiren bir yapay zeka girişimiyiz. Kurumların devasa veri setlerini analiz ederek, makine öğrenmesi algoritmalarıyla geleceğe yönelik stratejik öngörüler sunuyoruz. İleri düzey analitik çözümlerimiz, perakendeden sağlığa birçok farklı sektörde kullanılmaktadır.",
      "Doğal dil işleme ve görüntü işleme teknolojileri geliştiren öncü bir Ar-Ge laboratuvarıyız. Akademik bilgi birikimini endüstriyel uygulamalara dönüştürerek, yapay zeka tabanlı otonom sistemler ve akıllı asistanlar inşa ediyoruz. Verinin gücüne inanan vizyonerlerle çalışmak istiyoruz."
    ],
    industries: ['Yapay Zeka', 'Veri Bilimi', 'Araştırma Geliştirme', 'Analitik']
  },
  TasarimVeMedya: {
    majors: ['Görsel İletişim Tasarımı', 'Grafik Tasarımı', 'Endüstriyel Tasarım', 'Mimarlık', 'Radyo, Televizyon ve Sinema'],
    skills: ['UI/UX Tasarımı', 'Grafik Tasarımı', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'After Effects', '3D Modelleme', 'Blender', 'Video Kurgu', 'Animasyon', 'Kullanıcı Deneyimi', 'Tipografi'],
    taskTitles: ['Kapsamlı Kurumsal Kimlik ve Marka Kılavuzu Tasarımı', 'Mobil Uygulama için İleri Düzey UI/UX Tasarımı', '3D Ürün Modellemesi ve Animasyon Hazırlanması', 'Reklam Kampanyası için Video Kurgu ve Montaj', 'Web Sitesi Yeniden Tasarımı (Redesign)'],
    studentBios: [
      "Kullanıcı deneyimini merkeze alan (user-centric) tasarımlar üreten yaratıcı bir UI/UX tasarımcısıyım. Tasarım düşüncesi (design thinking) metodolojisini uygulayarak, estetik ve işlevselliği birleştiren arayüzler tasarlıyorum. Figma ve Adobe Creative Cloud programlarını ileri düzeyde kullanıyorum. İnsanların hayatına dokunan, sezgisel dijital deneyimler yaratmak en büyük tutkum.",
      "Görsel sanatlar ve dijital medya kurgusu üzerine eğitim alıyorum. Video prodüksiyonu, hareketli grafikler (motion graphics) ve marka kimliği oluşturma konularında güçlü bir portfolyoya sahibim. Görsel hikaye anlatıcılığı (visual storytelling) yoluyla markaların mesajlarını en etkili şekilde hedef kitleye ulaştırmayı hedefliyorum."
    ],
    companyDescs: [
      "Uluslararası markalara yaratıcı tasarım, marka stratejisi ve dijital deneyim hizmetleri sunan ödüllü bir yaratıcı ajansız. Estetiği, işlevselliği ve kullanıcı psikolojisini harmanlayarak, markaların dijital dünyada öne çıkmasını sağlıyoruz. Tasarımın dönüştürücü gücüne inanan yetenekli zihinlerle harika işler çıkarıyoruz.",
      "Video prodüksiyon, 3D animasyon ve interaktif medya içerikleri üreten yenilikçi bir stüdyoyuz. Gelişmiş görsel teknolojileri kullanarak reklam kampanyalarından dijital oyunlara kadar geniş bir yelpazede içerik üretiyoruz. Yaratıcılığın sınırlarını zorlamayı seven, vizyoner tasarımcılar arıyoruz."
    ],
    industries: ['Medya', 'Tasarım', 'Reklamcılık', 'Prodüksiyon']
  },
  IcerikVePazarlama: {
    majors: ['İşletme', 'Halkla İlişkiler ve Tanıtım', 'İletişim Bilimleri', 'İngiliz Dili ve Edebiyatı', 'Çeviribilim'],
    skills: ['Dijital Pazarlama', 'SEO Optimizasyonu', 'İçerik Stratejisi', 'Sosyal Medya Yönetimi', 'Metin Yazarlığı', 'İngilizce Çeviri', 'Almanca Çeviri', 'Google Ads', 'Google Analytics', 'E-Posta Pazarlama', 'Marka Yönetimi', 'B2B Pazarlama'],
    taskTitles: ['Kapsamlı SEO Optimizasyonu ve İçerik Stratejisi Oluşturma', 'Küresel Pazar için Teknik Doküman İngilizce Çevirisi', 'Sosyal Medya Hesapları Büyütme ve Kampanya Yönetimi', 'Dönüşüm Odaklı (Conversion) Reklam Metinleri Yazımı', 'E-Ticaret Sitesi İçin Ürün Açıklamaları ve Blog Yazarlığı'],
    studentBios: [
      "Dijital pazarlama stratejileri ve arama motoru optimizasyonu (SEO) konularında uzmanlaşan bir iletişim öğrencisiyim. Veri analitiği ve yaratıcı içerik üretimini harmanlayarak markaların dijital görünürlüğünü artırmayı hedefliyorum. Tüketici davranışlarını analiz etmeyi ve organik büyüme stratejileri kurgulamayı seviyorum.",
      "İki dilli (Bilingual) çevirmen ve içerik yazarı adayıyım. Akademik, teknik ve edebi metinlerin çevirisinde son derece titiz çalışırım. Aynı zamanda SEO uyumlu içerik üretimi ve blog yazarlığı konularında deneyimim var. Kelimelerin gücüyle markaların doğru kitleyle iletişim kurmasını sağlıyorum."
    ],
    companyDescs: [
      "Markaların dijital büyüme stratejilerini inşa eden, veri odaklı (data-driven) bir performans pazarlama ve SEO ajansıyız. Organik trafik artışı, dönüşüm optimizasyonu (CRO) ve kapsamlı içerik stratejileri ile müşterilerimizin satışlarını katlamalarını sağlıyoruz. Sürekli analiz eden ve optimize eden bir kültürümüz var.",
      "Küresel pazarlara açılmak isteyen firmalara yerelleştirme (localization), profesyonel çeviri ve çok dilli içerik üretimi hizmetleri sunan kurumsal bir dil hizmetleri şirketiyiz. Kalite ve kültürel uygunluk standartlarımızla, markaların dünya çapında doğru sesi bulmasına yardımcı oluyoruz."
    ],
    industries: ['Pazarlama', 'Çeviri', 'Dijital Ajans', 'Halkla İlişkiler']
  },
  MuhendislikVeElektronik: {
    majors: ['Makine Mühendisliği', 'Elektrik Elektronik Mühendisliği', 'Mekatronik Mühendisliği', 'İnşaat Mühendisliği'],
    skills: ['AutoCAD', 'SolidWorks', 'MATLAB', 'Gömülü Sistemler (Embedded Systems)', 'C/C++', 'PCB Tasarımı', 'PLC Programlama', 'IoT Geliştirme', 'Termodinamik Analizi', 'Statik/Dinamik Analiz', 'Robotik'],
    taskTitles: ['Akıllı Ev (IoT) Cihazı İçin Gömülü Yazılım Geliştirme', 'Makine Parçası 3D CAD Tasarımı ve Stres Analizi', 'Elektronik Devre (PCB) Şeması Tasarımı ve Simülasyonu', 'Endüstriyel Robot Kol Kinematik Modellenmesi', 'Enerji Verimliliği ve Termal Yönetim Analizi Raporu'],
    studentBios: [
      "Makine ve mekatronik sistemler üzerine yoğunlaşan, CAD programlarına (SolidWorks, AutoCAD) ve simülasyon araçlarına ileri düzeyde hakim bir mühendis adayıyım. Endüstriyel otomasyon, robotik ve akıllı üretim sistemleri konularında projeler geliştirdim. Teorik mühendislik bilgilerini pratik, yenilikçi çözümlere dönüştürmeyi amaçlıyorum.",
      "Gömülü sistemler (embedded systems), mikrodenetleyici programlama ve Nesnelerin İnterneti (IoT) üzerine tutkulu bir elektrik-elektronik mühendisliği öğrencisiyim. Donanım tasarımı (PCB) ve düşük seviyeli (C/C++) yazılım geliştirme yeteneklerine sahibim. Amacım, donanım ve yazılımın mükemmel uyumuyla çalışan akıllı cihazlar üretmek."
    ],
    companyDescs: [
      "Endüstri 4.0, endüstriyel otomasyon ve robotik çözümler sunan öncü bir teknoloji ve mühendislik şirketiyiz. Üretim süreçlerini otonomlaştıran akıllı sistemler ve gömülü yazılımlar tasarlıyoruz. AR-GE faaliyetlerimizle endüstrinin geleceğini şekillendiriyor, zorlu mühendislik problemlerine inovatif çözümler buluyoruz.",
      "İleri teknoloji IoT (Nesnelerin İnterneti) cihazları, akıllı enerji yönetim sistemleri ve donanım mimarileri geliştiren bir Ar-Ge firmasıyız. Hem donanım tasarımı hem de gömülü yazılım alanında uçtan uca çözümler sunuyoruz. Sınırları zorlayan projelerde yer almak isteyen tutkulu mühendislerle çalışıyoruz."
    ],
    industries: ['Üretim', 'Otomasyon', 'Donanım', 'Elektronik']
  },
  FinansVeYonetim: {
    majors: ['İşletme', 'Ekonomi', 'Finans', 'Uluslararası İlişkiler', 'Yönetim Bilişim Sistemleri'],
    skills: ['Finansal Analiz', 'Muhasebe (Logo/SAP)', 'Excel (İleri Düzey)', 'Veri Analizi', 'Bütçe Planlama', 'Risk Yönetimi', 'Pazar Araştırması', 'Stratejik Planlama', 'İş Geliştirme (Business Development)', 'Agile/Scrum'],
    taskTitles: ['Startup İçin Finansal Model ve Projeksiyon Hazırlanması', 'Pazar Araştırması ve Rakip Analizi Raporu', 'Kurumsal Verimlilik ve Süreç İyileştirme Stratejisi', 'Yatırımcı Sunumu (Pitch Deck) İçerik ve Analiz Desteği', 'Kapsamlı Sektörel Risk Analizi Raporu'],
    studentBios: [
      "Finansal piyasalar, veri odaklı yatırım stratejileri ve kurumsal finansman konularında derinlemesine bilgi sahibi bir ekonomi öğrencisiyim. İleri düzey Excel, finansal modelleme ve risk analizi konularında yetenekliyim. Şirketlerin büyüme hedeflerini rakamların gücüyle desteklemek ve stratejik değer yaratmak vizyonumdur.",
      "İşletme yönetimi ve stratejik planlama alanında eğitim alan, Agile proje yönetimi prensiplerine hakim bir adayım. Veri odaklı iş geliştirme (business development) ve süreç optimizasyonu konularında çeşitli vaka analizleri (case studies) tamamladım. Kurumsal hedefleri eyleme dönüştüren stratejiler kurgulamayı seviyorum."
    ],
    companyDescs: [
      "Küresel ölçekte faaliyet gösteren, şirketlere stratejik büyüme, finansal yapılanma ve dijital dönüşüm danışmanlığı sunan saygın bir danışmanlık firmasıyız. Derin sektörel analizlerimiz ve veri odaklı yaklaşımlarımızla müşterilerimizin sürdürülebilir rekabet avantajı elde etmelerini sağlıyoruz. Vizyoner liderlerle geleceği tasarlıyoruz.",
      "Finans teknolojileri (FinTech) alanında devrim yaratan ödeme sistemleri ve yatırım araçları geliştiren bir şirketiz. Finansal süreçleri dijitalleştiriyor, güvenli ve kullanıcı dostu arayüzlerle finansal kapsayıcılığı artırıyoruz. Hem finansal analitik hem de teknoloji uzmanlığını bünyesinde barındıran dinamik bir ekibiz."
    ],
    industries: ['Finans', 'Yönetim Danışmanlığı', 'FinTech', 'Eğitim']
  }
};

const companyNamePrefixes = ['Global', 'Inno', 'NextGen', 'Cloud', 'Pixel', 'Kuantum', 'Bosphorus', 'Anadolu', 'Gelecek', 'Zirve', 'Vadi', 'Pusula', 'Nova', 'Atlas', 'Merkez', 'Lider', 'Mavi', 'Tech', 'Smart', 'Giga', 'Meta', 'Prime', 'Apex', 'Zenith', 'Core'];
const companyNameSuffixes = ['Yazılım', 'Medya', 'Design', 'Tech', 'AI', 'Sys', 'Studio', 'Lojistik', 'Finans', 'E-Ticaret', 'Bilişim', 'Danışmanlık', 'Medikal', 'Otomotiv', 'Yapı', 'Gıda', 'Enerji', 'Solutions', 'Labs', 'Dynamics', 'Ventures', 'Group', 'Networks', 'Industries'];

async function main() {
  console.log('Resetting database...');
  await prisma.transaction.deleteMany();
  await prisma.awardedBadge.deleteMany();
  await prisma.review.deleteMany();
  await prisma.companyReview.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskSkill.deleteMany();
  await prisma.savedTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('pass123', 10);
  
  // Create all skills grouped
  const skillDbMap = new Map<string, any>();
  for (const cat of Object.values(categories)) {
    for (const s of cat.skills) {
      if (!skillDbMap.has(s)) {
        const sk = await prisma.skill.create({ data: { name: s } });
        skillDbMap.set(s, sk);
      }
    }
  }

  console.log('Generating 50 companies with rich profiles...');
  const companies = [];
  const catKeys = Object.keys(categories);
  
  for (let i = 0; i < 50; i++) {
    const pref = companyNamePrefixes[Math.floor(Math.random() * companyNamePrefixes.length)];
    const suff = companyNameSuffixes[Math.floor(Math.random() * companyNameSuffixes.length)];
    const cName = `${pref} ${suff}`;
    
    const emailPrefix = cName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const user = await prisma.user.create({
      data: { email: `contact@${emailPrefix}${i}.com`, password_hash: defaultPassword, role: 'company' },
    });
    
    const randomCatKey = catKeys[Math.floor(Math.random() * catKeys.length)];
    const catData = categories[randomCatKey as keyof typeof categories];
    
    const profile = await prisma.companyProfile.create({
      data: {
        user_id: user.id,
        company_name: cName,
        industry: catData.industries[Math.floor(Math.random() * catData.industries.length)],
        location: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][Math.floor(Math.random() * 5)] + ', Türkiye',
        description: catData.companyDescs[Math.floor(Math.random() * catData.companyDescs.length)],
        website_url: `https://www.${emailPrefix}.com`,
        linkedin_url: `https://linkedin.com/company/${emailPrefix}`,
        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(pref+'+'+suff)}&background=random&color=fff&size=250`
      }
    });
    companies.push({ profile, categoryKey: randomCatKey });
  }

  console.log('Generating 100 students with specialized hyper-realistic profiles...');
  const students = [];
  for (let i = 1; i <= 100; i++) {
    const isMale = Math.random() > 0.5;
    const fName = isMale 
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)] 
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const user = await prisma.user.create({
      data: { email: `student${i}@edu.tr`, password_hash: defaultPassword, role: 'student' },
    });

    const randomCatKey = catKeys[Math.floor(Math.random() * catKeys.length)];
    const catData = categories[randomCatKey as keyof typeof categories];

    const emailPrefix = fName.toLowerCase().replace(/[^a-z0-9]/g, '') + lName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Determine Tier: 1 (Beginner), 2 (Intermediate), 3 (Expert)
    const tier = Math.floor(Math.random() * 3) + 1;
    let bioText = "";
    if (tier === 1) {
      bioText = `Merhaba, ben ${fName}. ${catData.majors[0]} bölümünde yeniyim ve öğrenmeye hevesliyim.`;
    } else if (tier === 2) {
      bioText = catData.studentBios[Math.floor(Math.random() * catData.studentBios.length)];
    } else {
      bioText = `${catData.studentBios[Math.floor(Math.random() * catData.studentBios.length)]} Aynı zamanda liderlik yeteneklerim güçlüdür ve ekipleri yönetebilirim. Bugüne kadar 5'ten fazla büyük çaplı projede aktif görev aldım ve mükemmel sonuçlar elde ettim. Yenilikçi ve çözüm odaklıyım.`;
    }

    const randomImageIndex = Math.floor(Math.random() * 90) + 1; // 1 to 90
    const profileImageUrl = isMale 
      ? `https://randomuser.me/api/portraits/men/${randomImageIndex}.jpg`
      : `https://randomuser.me/api/portraits/women/${randomImageIndex}.jpg`;

    const profile = await prisma.studentProfile.create({
      data: {
        user_id: user.id,
        full_name: `${fName} ${lName}`,
        university: universities[Math.floor(Math.random() * universities.length)],
        major: catData.majors[Math.floor(Math.random() * catData.majors.length)],
        graduation_year: 2024 + Math.floor(Math.random() * 4),
        bio: bioText,
        profile_image_url: profileImageUrl,
        github_url: `https://github.com/${emailPrefix}`,
        linkedin_url: `https://linkedin.com/in/${emailPrefix}`,
        phone: `+905${Math.floor(10000000 + Math.random() * 90000000)}`,
        website_url: `https://${emailPrefix}.me`,
        cv_url: `https://${emailPrefix}.me/cv-resume.pdf`,
        is_verified: true,
        categories_of_interest: randomCatKey
      }
    });
    students.push(profile);

    // Assign 6 to 12 matching skills!
    const numSkills = 6 + Math.floor(Math.random() * 7);
    const shuffledSkills = [...catData.skills].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, numSkills);
    
    for (const skName of selectedSkills) {
      const skObj = skillDbMap.get(skName);
      if (skObj) {
        await prisma.studentSkill.create({
          data: {
            student_user_id: profile.user_id,
            skill_id: skObj.id,
            level: 3 + Math.floor(Math.random() * 3), // 3 to 5
            category: randomCatKey
          }
        });
      }
    }
  }

  console.log('Creating 150 diverse tasks with rich descriptions...');
  for (let i = 0; i < 150; i++) {
    const compData = companies[Math.floor(Math.random() * companies.length)];
    const catData = categories[compData.categoryKey as keyof typeof categories];
    const title = catData.taskTitles[Math.floor(Math.random() * catData.taskTitles.length)];
    
    const task = await prisma.task.create({
      data: {
        company_user_id: compData.profile.user_id,
        title: `${title} - Part ${i+1}`,
        description: `${compData.profile.company_name} olarak, yenilikçi projelerimizde görev alacak, sorumluluk sahibi ve ${compData.categoryKey} alanında teknik yetkinliğe sahip takım arkadaşları arıyoruz. Proje kapsamında yüksek standartlarda teslimatlar beklenmektedir.`,
        detail_title: `Proje Beklentileri ve Kapsam`,
        detail_body: `Adayın belirtilen yeteneklerde en az orta düzey tecrübe sahibi olması, verilen görevleri bağımsız araştırma yaparak çözebilmesi ve proje takvimine sıkı sıkıya uyması gerekmektedir. Görev süresince haftalık ilerleme toplantıları yapılacaktır. Kullanılacak teknolojilere ve araçlara tam hakimiyet beklenmektedir.`,
        reward_type: 'money',
        reward_amount: (3000 + Math.floor(Math.random() * 25000)).toString(),
        budget: (3000 + Math.floor(Math.random() * 25000)).toString(),
        currency: 'TRY',
        category: compData.categoryKey,
        work_type: ['Uzaktan', 'Hibrit', 'Ofis'][Math.floor(Math.random() * 3)],
        status: 'open',
        deadline: new Date(Date.now() + (5 + Math.floor(Math.random() * 45)) * 24 * 60 * 60 * 1000)
      }
    });

    // Assign 4 to 8 required skills
    const numSkills = 4 + Math.floor(Math.random() * 5);
    const shuffledSkills = [...catData.skills].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, numSkills);
    
    for (const skName of selectedSkills) {
      const skObj = skillDbMap.get(skName);
      if (skObj) {
        await prisma.taskSkill.create({
          data: {
            task_id: task.id,
            skill_id: skObj.id,
            is_required: true,
            level: 3 + Math.floor(Math.random() * 2)
          }
        });
      }
    }
  }

  await prisma.badge.createMany({
    data: [
      { name: 'Hızlı Teslimat', icon_url: '/badges/speed.svg' },
      { name: 'Yaratıcı Çözüm', icon_url: '/badges/creative.svg' },
      { name: 'Kod Ustası', icon_url: '/badges/code.svg' },
      { name: 'İyi İletişim', icon_url: '/badges/comm.svg' },
      { name: 'Mükemmeliyet', icon_url: '/badges/quality.svg' },
      { name: 'Veri Büyücüsü', icon_url: '/badges/data.svg' },
      { name: 'Tasarım Gurusu', icon_url: '/badges/design.svg' },
    ]
  });

  console.log('Massive hyper-realistic DB (100 students, 50 companies, 150 tasks) seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
