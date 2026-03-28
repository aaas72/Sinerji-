import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
  
  if (!user) {
    console.log("Hata: student@example.com kullanıcısı bulunamadı. Lütfen önce bu e-posta ile kayıt olun.");
    return;
  }

  console.log(`Kullanıcı bulundu (ID: ${user.id}). Güçlü profil oluşturuluyor...`);

  // Update or Create the Profile Base Data
  await prisma.studentProfile.upsert({
    where: { user_id: user.id },
    update: {
      full_name: "Yazılım Uzmanı Öğrenci",
      university: "Orta Doğu Teknik Üniversitesi (ODTÜ)",
      major: "Bilgisayar Mühendisliği",
      graduation_year: 2024,
      bio: "Tam yığın (full-stack) yazılım geliştiricisiyim. Web teknolojileri, React, Node.js ve veritabanı mimarisi üzerine derin bir ilgi duyuyorum. Çeşitli kurumsal seviye projelerde görev aldım ve karmaşık problemleri çözmekten keyif alıyorum. Hem ön yüz (frontend) hem de arka yüz (backend) teknolojilerinde deneyimliyim.",
      github_url: "https://github.com/strongstudent",
      website_url: "https://strongstudent.dev",
      linkedin_url: "https://linkedin.com/in/strongstudent",
      phone: "+90 555 123 4567",
      availability_status: "available",
      categories_of_interest: "Software Engineering, AI, Web Development, DevOps"
    },
    create: {
      user_id: user.id,
      full_name: "Yazılım Uzmanı Öğrenci",
      university: "Orta Doğu Teknik Üniversitesi (ODTÜ)",
      major: "Bilgisayar Mühendisliği",
      graduation_year: 2024,
      bio: "Tam yığın (full-stack) yazılım geliştiricisiyim. Web teknolojileri, React, Node.js ve veritabanı mimarisi üzerine derin bir ilgi duyuyorum. Çeşitli kurumsal seviye projelerde görev aldım ve karmaşık problemleri çözmekten keyif alıyorum. Hem ön yüz (frontend) hem de arka yüz (backend) teknolojilerinde deneyimliyim.",
      github_url: "https://github.com/strongstudent",
      website_url: "https://strongstudent.dev",
      linkedin_url: "https://linkedin.com/in/strongstudent",
      phone: "+90 555 123 4567",
      availability_status: "available",
      categories_of_interest: "Software Engineering, AI, Web Development, DevOps"
    }
  });

  console.log("Temel profil bilgileri güncellendi!");

  // Ensure some high-deman skills exist in the DB
  const skillNames = [
    "React", 
    "Node.js", 
    "TypeScript", 
    "Next.js", 
    "Prisma", 
    "PostgreSQL", 
    "Tailwind CSS",
    "UI/UX Design",
    "Figma",
    "Docker",
    "AWS",
    "Python",
    "Data Analysis"
  ];
  const skillIds = [];
  
  for (const name of skillNames) {
    let skill = await prisma.skill.findUnique({ where: { name } });
    if (!skill) {
      skill = await prisma.skill.create({ data: { name } });
    }
    skillIds.push(skill.id);
  }

  // Clear existing skills to avoid duplicates
  await prisma.studentSkill.deleteMany({
    where: { student_user_id: user.id }
  });

  // Assign these strong skills to the student
  for (const skillId of skillIds) {
    await prisma.studentSkill.create({
      data: {
        student_user_id: user.id,
        skill_id: skillId,
        category: "Tech & Design" // Giving a generic category
      }
    });
  }

  console.log("Yetenekler (Skills) başarıyla eklendi! Profiliniz artık AI eşleştirmesinde çok yüksek uyum gösterecek şekilde hazırlandı.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
