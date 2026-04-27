import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the server directory
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database clear process...');

  try {
    // Truncate tables and restart identity to clear all data
    const tables = [
      'awarded_badges',
      'reviews',
      'submissions',
      'task_skills',
      'tasks',
      'student_skills',
      'recommendations',
      'student_profiles',
      'company_profiles',
      'badges',
      'skills',
      'users'
    ];

    console.log('Clearing tables...');
    
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    }

    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error during database clear:', error);
    throw error;
  }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
