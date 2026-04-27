import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // حذف جميع البيانات مع مراعاة العلاقات
  await prisma.review.deleteMany();
  await prisma.awardedBadge.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.taskSkill.deleteMany();
  await prisma.task.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ تم حذف جميع المستخدمين والبيانات المرتبطة بنجاح');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
