import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.enum(['student', 'company'], { message: 'Role must be either student or company' }),
  // Student specific fields
  full_name: z.string().optional(),
  university: z.string().optional(),
  // Company specific fields
  company_name: z.string().optional(),
  description: z.string().optional(),
  website_url: z.string().url().optional(),
}).refine((data) => {
  if (data.role === 'student') {
    return !!data.full_name;
  }
  if (data.role === 'company') {
    return !!data.company_name;
  }
  return true;
}, {
  message: "Full name is required for students, Company name is required for companies",
  path: ["role"] // path of error
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateStudentProfileSchema = z.object({
  full_name: z.string().min(1, "Full name cannot be empty").optional(),
  university: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().optional(),
  linkedin_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  github_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  twitter_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  website_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  major: z.string().optional(),
  graduation_year: z.number().int().optional(),
  availability_status: z.string().optional(),
  categories_of_interest: z.string().optional(),
});

export const addSkillSchema = z.object({
  skillName: z.string().min(1, "Skill name cannot be empty"),
  category: z.string().min(1, "Category cannot be empty").default("General"),
  level: z.number().int().min(1, "Level must be between 1 and 10").max(10, "Level must be between 1 and 10"),
});

export const updateCompanyProfileSchema = z.object({
  company_name: z.string().min(1, "Company name cannot be empty").optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  website_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  industry: z.string().optional(),
  location: z.string().optional(),
  logo_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
});

// ─── Shared hard-skill object ─────────────────────────────────────────────────
const hardSkillSchema = z.object({
  skill: z.string().min(1, "Skill name cannot be empty"),
  level: z.number().int().min(1).max(10),
  isRequired: z.boolean(),
  yearsOfExperience: z.number().int().min(0).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const optionalDatetime = z
  .union([z.string().datetime(), z.literal(""), z.undefined()])
  .optional();

// ─── Create Task ──────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  hardSkills: z.array(hardSkillSchema).min(1, "At least one hard skill is required"),
  softSkills: z.array(z.string().min(1)).optional(),
  reward_type: z.enum(['money', 'internship', 'certificate', 'recommendation', 'mentorship']).optional(),
  budget: z.string().optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  internship_duration: z.string().optional(),
  internship_department: z.string().optional(),
  internship_is_paid: z.enum(['paid', 'unpaid']).optional(),
  certificate_name: z.string().optional(),
  certificate_issuer: z.string().optional(),
  positions: z.number().int().min(1, "Positions must be at least 1"),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  preferred_major: z.string().optional(),
  work_type: z.enum(['remote', 'hybrid', 'onsite']),
  deadline: optionalDatetime,
  // backward-compat: flat list sent alongside hardSkills
  requiredSkills: z.array(z.string()).optional(),
});

// ─── Update Task ──────────────────────────────────────────────────────────────
export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(200).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().min(1).optional(),
  hardSkills: z.array(hardSkillSchema).min(1).optional(),
  softSkills: z.array(z.string().min(1)).optional(),
  reward_type: z.enum(['money', 'internship', 'certificate', 'recommendation', 'mentorship']).optional(),
  budget: z.string().optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  internship_duration: z.string().optional(),
  internship_department: z.string().optional(),
  internship_is_paid: z.enum(['paid', 'unpaid']).optional(),
  certificate_name: z.string().optional(),
  certificate_issuer: z.string().optional(),
  positions: z.number().int().min(1).optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  preferred_major: z.string().optional(),
  work_type: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  deadline: optionalDatetime,
  status: z.enum(['Open', 'Closed', 'In_Progress']).optional(),
  requiredSkills: z.array(z.string()).optional(),
});

export const createSubmissionSchema = z.object({
  submission_content: z.string().min(1, "Submission content cannot be empty"),
  proposed_budget: z.string().optional(),
  estimated_delivery_days: z.number().int().min(1, "Bitiş süresi en az 1 gün olmalıdır").optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  feedback: z.string().optional(),
  badgeIds: z.array(z.number()).optional(),
}).refine(data => data.rating || data.feedback, {
  message: "Either rating or feedback must be provided"
});

export const createRecommendationSchema = z.object({
  studentUserId: z.number().int().min(1, "Student ID is required"),
  content: z.string().min(10, "Recommendation content must be at least 10 characters"),
});
