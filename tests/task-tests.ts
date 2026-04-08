type LoginResponse = {
  user?: Record<string, unknown>;
};

type RecommendedTask = {
  id: number;
  title: string;
  matchPercentage?: number;
  company?: {
    company_name?: string;
  };
};

const BASE_URL = (process.env.TEST_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
const STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL || '';
const STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD || '';
const TEST_TASK_ID = process.env.TEST_TASK_ID ? Number(process.env.TEST_TASK_ID) : undefined;
const TEST_SUBMISSION_TEXT = process.env.TEST_SUBMISSION_TEXT || 'This is an automated matching flow test submission. I am testing the frontend-to-backend matching scenario and want to verify the AI score path end to end.';
const TEST_SKILLS = ['React', 'Node.js', 'TypeScript', 'Next.js', 'Prisma'];

let generatedCredentials: { email: string; password: string } | null = null;

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function loginStudent() {
  const email = STUDENT_EMAIL || generatedCredentials?.email;
  const password = STUDENT_PASSWORD || generatedCredentials?.password;

  if (!email || !password) {
    throw new Error('Set TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD, or let the test auto-register a student.');
  }

  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await readJson(response)) as LoginResponse | null;

  const setCookie = response.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/token=([^;]+)/);

  if (!response.ok || !tokenMatch?.[1]) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return `token=${tokenMatch[1]}`;
}

async function registerStudent() {
  const email = `matching-test-${Date.now()}@example.com`;
  const password = 'password123';

  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      role: 'student',
      full_name: 'Matching Test Student',
      university: 'Test University',
    }),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status} ${JSON.stringify(data)}`);
  }

  generatedCredentials = { email, password };
  console.log(`Registered test student: ${email}`);
}

async function completeStudentProfile(cookie: string) {
  const response = await fetch(`${BASE_URL}/api/students/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      full_name: 'Matching Test Student',
      university: 'Test University',
      major: 'Computer Engineering',
      graduation_year: 2026,
      bio: 'Full-stack developer test profile prepared for AI matching flow validation.',
      github_url: 'https://github.com/strongstudent',
      website_url: 'https://strongstudent.dev',
      linkedin_url: 'https://linkedin.com/in/strongstudent',
      availability_status: 'available',
      categories_of_interest: 'Software Engineering, AI, Web Development',
    }),
  });

  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(`Profile update failed: ${response.status} ${JSON.stringify(data)}`);
  }

  console.log('Profile updated for matching test.');
}

async function addTestSkills(cookie: string) {
  for (const skillName of TEST_SKILLS) {
    const response = await fetch(`${BASE_URL}/api/students/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        skillName,
        category: 'Tech',
        level: 4,
      }),
    });

    const data = await readJson(response);
    if (!response.ok) {
      throw new Error(`Adding skill ${skillName} failed: ${response.status} ${JSON.stringify(data)}`);
    }
  }

  console.log(`Added ${TEST_SKILLS.length} skills for matching test.`);
}

async function fetchRecommendedTasks(cookie: string) {
  const response = await fetch(`${BASE_URL}/api/tasks/recommended`, {
    headers: {
      Cookie: cookie,
    },
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(`Recommended tasks request failed: ${response.status} ${JSON.stringify(data)}`);
  }

  const tasks = (data?.data?.tasks || []) as RecommendedTask[];

  console.log(`Recommended tasks: ${tasks.length}`);
  tasks.slice(0, 5).forEach((task, index) => {
    const companyName = task.company?.company_name || 'Unknown company';
    console.log(`${index + 1}. ${task.title} | ${companyName} | AI ${task.matchPercentage ?? 0}%`);
  });

  return tasks;
}

async function createTestSubmission(cookie: string, taskId: number) {
  const response = await fetch(`${BASE_URL}/api/submissions/task/${taskId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      submission_content: TEST_SUBMISSION_TEXT,
      proposed_budget: '150',
      estimated_delivery_days: 3,
    }),
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(`Submission request failed: ${response.status} ${JSON.stringify(data)}`);
  }

  const score = data?.data?.submission?.ai_match_score;
  console.log(`Submission created for task ${taskId}. AI score: ${typeof score === 'number' ? score : 'n/a'}`);
}

async function main() {
  console.log(`Base URL: ${BASE_URL}`);

  const healthResponse = await fetch(`${BASE_URL}/health`);
  const healthData = await readJson(healthResponse);
  console.log('Health:', healthResponse.ok ? healthData : { status: healthResponse.status, body: healthData });

  if (!STUDENT_EMAIL || !STUDENT_PASSWORD) {
    await registerStudent();
  }

  const cookie = await loginStudent();
  console.log('Login: success');

  if (!STUDENT_EMAIL || !STUDENT_PASSWORD) {
    await completeStudentProfile(cookie);
    await addTestSkills(cookie);
  }

  const recommendedTasks = await fetchRecommendedTasks(cookie);

  const submissionTargetId = Number.isFinite(TEST_TASK_ID)
    ? (TEST_TASK_ID as number)
    : recommendedTasks[0]?.id;

  if (submissionTargetId) {
    await createTestSubmission(cookie, submissionTargetId);
  } else {
    console.log('No recommended task was available, skipping submission step.');
  }
}

main().catch((error) => {
  console.error('Matching flow test failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});