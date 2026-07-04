import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting the database...');
  
  // Clear the database tables
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

  console.log('Seeding realistic data...');

  const defaultPassword = await bcrypt.hash('pass123', 10);

  // 1. Create Users (Companies)
  const userCompany1 = await prisma.user.create({
    data: { email: 'contact@technova.com', password_hash: defaultPassword, role: 'company' },
  });
  const userCompany2 = await prisma.user.create({
    data: { email: 'hello@creativestudio.com', password_hash: defaultPassword, role: 'company' },
  });
  const userCompany3 = await prisma.user.create({
    data: { email: 'hr@globalreach.com', password_hash: defaultPassword, role: 'company' },
  });

  // 2. Create Company Profiles
  const company1 = await prisma.companyProfile.create({
    data: {
      user_id: userCompany1.id,
      company_name: 'TechNova Solutions',
      industry: 'Yazılım & Teknoloji',
      location: 'İstanbul, Türkiye',
      description: 'Yenilikçi yazılım çözümleri ve bulut teknolojileri üreten lider teknoloji firması.',
      website_url: 'https://technova.example.com',
      logo_url: '/avatars/company_technova.png'
    }
  });

  const company2 = await prisma.companyProfile.create({
    data: {
      user_id: userCompany2.id,
      company_name: 'Creative Studio Istanbul',
      industry: 'Tasarım & Medya',
      location: 'İzmir, Türkiye',
      description: 'Ödüllü dijital tasarım, marka kimliği ve UI/UX ajansı.',
      website_url: 'https://creative.example.com',
      logo_url: '/avatars/company_creative.png'
    }
  });

  const company3 = await prisma.companyProfile.create({
    data: {
      user_id: userCompany3.id,
      company_name: 'Global Reach Media',
      industry: 'Pazarlama & Çeviri',
      location: 'Ankara, Türkiye',
      description: 'Küresel markalar için içerik yerelleştirme ve dijital pazarlama hizmetleri.',
      logo_url: 'https://ui-avatars.com/api/?name=Global+Reach&background=0D8ABC&color=fff' // fallback
    }
  });

  // 3. Create Users (Students)
  const userStudent1 = await prisma.user.create({
    data: { email: 'ahmet.yilmaz@edu.tr', password_hash: defaultPassword, role: 'student' },
  });
  const userStudent2 = await prisma.user.create({
    data: { email: 'zeynep.kaya@edu.tr', password_hash: defaultPassword, role: 'student' },
  });
  const userStudent3 = await prisma.user.create({
    data: { email: 'caner.demir@edu.tr', password_hash: defaultPassword, role: 'student' },
  });

  // 4. Create Student Profiles
  const student1 = await prisma.studentProfile.create({
    data: {
      user_id: userStudent1.id,
      full_name: 'Ahmet Yılmaz',
      university: 'Boğaziçi Üniversitesi',
      major: 'Bilgisayar Mühendisliği',
      graduation_year: 2025,
      bio: 'Full-stack web geliştiricisi. React ve Node.js teknolojilerine tutkulu.',
      github_url: 'https://github.com/ahmety',
      profile_image_url: '/avatars/student_ahmet.png',
      is_verified: true,
      categories_of_interest: 'Yazılım, Veri Bilimi'
    }
  });

  const student2 = await prisma.studentProfile.create({
    data: {
      user_id: userStudent2.id,
      full_name: 'Zeynep Kaya',
      university: 'Mimar Sinan Güzel Sanatlar Üniversitesi',
      major: 'Görsel İletişim Tasarımı',
      graduation_year: 2026,
      bio: 'UI/UX tasarımcısı ve illüstratör. Kullanıcı odaklı tasarımlar yapıyorum.',
      linkedin_url: 'https://linkedin.com/in/zeynepkaya',
      profile_image_url: '/avatars/student_zeynep.png',
      is_verified: true,
      categories_of_interest: 'Tasarım, UI/UX'
    }
  });

  const student3 = await prisma.studentProfile.create({
    data: {
      user_id: userStudent3.id,
      full_name: 'Caner Demir',
      university: 'Hacettepe Üniversitesi',
      major: 'İngiliz Dili ve Edebiyatı',
      graduation_year: 2024,
      bio: 'İngilizce-Türkçe yeminli çevirmen adayı. Teknik ve akademik metin çevirisi.',
      profile_image_url: 'https://i.pravatar.cc/150?img=11',
      is_verified: true,
      categories_of_interest: 'Çeviri, İçerik Yazarlığı'
    }
  });

  // 5. Create Skills
  const sReact = await prisma.skill.create({ data: { name: 'React.js' } });
  const sNode = await prisma.skill.create({ data: { name: 'Node.js' } });
  const sPostgres = await prisma.skill.create({ data: { name: 'PostgreSQL' } });
  const sFigma = await prisma.skill.create({ data: { name: 'Figma' } });
  const sIllustrator = await prisma.skill.create({ data: { name: 'Adobe Illustrator' } });
  const sTranslation = await prisma.skill.create({ data: { name: 'İngilizce Çeviri' } });
  const sSEO = await prisma.skill.create({ data: { name: 'SEO Copywriting' } });

  // 6. Assign Skills to Students
  await prisma.studentSkill.createMany({
    data: [
      { student_user_id: student1.user_id, skill_id: sReact.id, level: 4, category: 'Yazılım' },
      { student_user_id: student1.user_id, skill_id: sNode.id, level: 3, category: 'Yazılım' },
      { student_user_id: student1.user_id, skill_id: sPostgres.id, level: 4, category: 'Veritabanı' },
      
      { student_user_id: student2.user_id, skill_id: sFigma.id, level: 5, category: 'Tasarım' },
      { student_user_id: student2.user_id, skill_id: sIllustrator.id, level: 4, category: 'Tasarım' },
      
      { student_user_id: student3.user_id, skill_id: sTranslation.id, level: 5, category: 'Dil' },
      { student_user_id: student3.user_id, skill_id: sSEO.id, level: 3, category: 'Pazarlama' },
    ]
  });

  // 7. Create Diverse Tasks
  const task1 = await prisma.task.create({
    data: {
      company_user_id: company1.user_id,
      title: 'E-Ticaret Platformu Backend Geliştirme',
      description: 'Yeni projemiz için Node.js ve PostgreSQL kullanarak güvenli ve ölçeklenebilir bir backend API geliştirilecek.',
      detail_title: 'Sinerji E-Ticaret Modülü',
      detail_body: 'Projede sepet yönetimi, ödeme entegrasyonu (Iyzico) ve ürün varyantları olacak. Deneyimli bir öğrenci arıyoruz.',
      reward_type: 'money',
      reward_amount: '15000',
      currency: 'TRY',
      budget: '15000',
      category: 'Yazılım',
      work_type: 'Uzaktan',
      status: 'open',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  const task2 = await prisma.task.create({
    data: {
      company_user_id: company2.user_id,
      title: 'Mobil Uygulama Arayüz Tasarımı (UI/UX)',
      description: 'Sağlık ve fitness mobil uygulamamız için modern, kullanıcı dostu ekran tasarımları.',
      detail_title: 'FitLife Uygulama Tasarımı',
      detail_body: 'Figma üzerinde wireframe, prototip ve final ekran tasarımları isteniyor. Renk paleti marka rehberine uygun olmalı.',
      reward_type: 'money',
      reward_amount: '8000',
      currency: 'TRY',
      budget: '8000',
      category: 'Tasarım',
      work_type: 'Uzaktan',
      status: 'open',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }
  });

  const task3 = await prisma.task.create({
    data: {
      company_user_id: company3.user_id,
      title: 'Teknik Doküman Çevirisi (EN-TR)',
      description: 'Yazılım ürünümüze ait 20 sayfalık teknik kullanım kılavuzunun İngilizceden Türkçeye profesyonel çevirisi.',
      detail_title: 'Kullanım Kılavuzu Yerelleştirme',
      detail_body: 'Teknik terimlere hakimiyet önemlidir. Çeviri sonrası formatlama da beklenmektedir.',
      reward_type: 'money',
      reward_amount: '3000',
      currency: 'TRY',
      budget: '3000',
      category: 'Çeviri',
      work_type: 'Uzaktan',
      status: 'open',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  });

  const task4 = await prisma.task.create({
    data: {
      company_user_id: company1.user_id,
      title: 'React ile Frontend Komponent Geliştirme',
      description: 'Mevcut projemiz için tekrar kullanılabilir, responsive React UI komponentleri geliştirilecek.',
      detail_title: 'Sinerji UI Kütüphanesi',
      detail_body: 'TailwindCSS ve React kullanılacaktır. Kod kalitesi ve dokümantasyon önemlidir.',
      reward_type: 'badge',
      reward_amount: 'Sertifika & Rozet',
      category: 'Yazılım',
      work_type: 'Uzaktan',
      status: 'open',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // 8. Assign Skills to Tasks
  await prisma.taskSkill.createMany({
    data: [
      { task_id: task1.id, skill_id: sNode.id, is_required: true },
      { task_id: task1.id, skill_id: sPostgres.id, is_required: true },
      { task_id: task2.id, skill_id: sFigma.id, is_required: true },
      { task_id: task3.id, skill_id: sTranslation.id, is_required: true },
      { task_id: task4.id, skill_id: sReact.id, is_required: true },
    ]
  });

  // 9. Create Badges
  const bHizli = await prisma.badge.create({ data: { name: 'Hızlı Teslimat', icon_url: '/badges/speed.svg' } });
  const bKalite = await prisma.badge.create({ data: { name: 'Yüksek Kalite', icon_url: '/badges/quality.svg' } });
  const bIletisim = await prisma.badge.create({ data: { name: 'İyi İletişim', icon_url: '/badges/comm.svg' } });

  console.log('Realistic data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
