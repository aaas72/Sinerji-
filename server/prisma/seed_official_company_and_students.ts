import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // بيانات الشركة
  const companyEmail = 'resmi.sirket@example.com';
  const companyPassword = 'Company123!';
  const companyName = 'Resmi Teknoloji A.Ş.';
  const companyProfile = {
    company_name: companyName,
    description: 'Yenilikçi yazılım çözümleri sunan lider teknoloji şirketi.',
    website_url: 'https://www.resmiteknoloji.com',
    industry: 'Teknoloji',
    location: 'İstanbul, Türkiye',
    logo_url: 'https://randomuser.me/api/portraits/men/1.jpg',
  };

  // إنشاء مستخدم الشركة
  const companyUser = await prisma.user.create({
    data: {
      email: companyEmail,
      password_hash: await bcrypt.hash(companyPassword, 12),
      role: 'COMPANY',
      companyProfile: {
        create: companyProfile,
      },
    },
    include: { companyProfile: true },
  });

  // بيانات الطلاب
  const universities = [
    'Boğaziçi Üniversitesi', 'İstanbul Teknik Üniversitesi', 'ODTÜ',
    'Hacettepe Üniversitesi', 'Ege Üniversitesi', 'Dokuz Eylül Üniversitesi',
    'Marmara Üniversitesi', 'Yıldız Teknik Üniversitesi', 'Ankara Üniversitesi',
    'İzmir Yüksek Teknoloji Enstitüsü', 'Sakarya Üniversitesi', 'Uludağ Üniversitesi',
    'Çukurova Üniversitesi', 'Selçuk Üniversitesi', 'Atatürk Üniversitesi',
    'Karadeniz Teknik Üniversitesi', 'Akdeniz Üniversitesi', 'Pamukkale Üniversitesi',
    'Kocaeli Üniversitesi', 'Erciyes Üniversitesi'
  ];
  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'C#', 'Java', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'C++', 'Docker', 'AWS', 'Linux', 'Figma'
  ];

  // تخصصات متنوعة
  const majors = [
    'Bilgisayar Mühendisliği',
    'Elektrik-Elektronik Mühendisliği',
    'Makine Mühendisliği',
    'Endüstri Mühendisliği',
    'İnşaat Mühendisliği',
    'Yazılım Mühendisliği',
    'Biyomedikal Mühendisliği',
    'Kimya Mühendisliği',
    'Mekatronik Mühendisliği',
    'Çevre Mühendisliği',
    'Fizik',
    'Matematik',
    'İstatistik',
    'Ekonomi',
    'İşletme',
    'Psikoloji',
    'Moleküler Biyoloji',
    'Tıp',
    'Diş Hekimliği',
    'Hukuk'
  ];

  for (let i = 1; i <= 50; i++) {
    const fullName = `Öğrenci ${i} Soyad${i}`;
    const email = `ogrenci${i}@example.com`;
    const password = 'Ogrenci123!';
    const university = universities[i % universities.length];
    const bio = 'Gelişime açık, takım çalışmasına yatkın ve teknolojiye ilgi duyan bir öğrenciyim.';
    const phone = `05${Math.floor(100000000 + Math.random() * 899999999)}`;
    const linkedin_url = `https://linkedin.com/in/ogrenci${i}`;
    const github_url = `https://github.com/ogrenci${i}`;
    const twitter_url = `https://twitter.com/ogrenci${i}`;
    const website_url = `https://ogrenci${i}.com`;
    const major = majors[i % majors.length];
    const graduation_year = 2026 + (i % 3);
    const availability_status = 'Uygun';
    const categories_of_interest = 'Yazılım, Web Geliştirme, Mobil Uygulama';

    // مهارات فريدة لكل طالب
    const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
    const studentSkills = shuffledSkills.slice(0, 3).map((skill) => ({
      skill: {
        connectOrCreate: {
          where: { name: skill },
          create: { name: skill },
        },
      },
      level: Math.floor(Math.random() * 5) + 1,
      category: 'Teknoloji',
    }));

    await prisma.user.create({
      data: {
        email,
        password_hash: await bcrypt.hash(password, 12),
        role: 'STUDENT',
        studentProfile: {
          create: {
            full_name: fullName,
            university,
            bio,
            phone,
            linkedin_url,
            github_url,
            twitter_url,
            website_url,
            major,
            graduation_year,
            availability_status,
            categories_of_interest,
            skills: {
              create: studentSkills,
            },
          },
        },
      },
    });
  }

  console.log('✅ 1 şirket ve 50 öğrenci başarıyla eklendi!');
  console.log('Şirket hesabı:');
  console.log('E-posta:', companyEmail);
  console.log('Şifre:', companyPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
