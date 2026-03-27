# Sinerji - Next-Gen Tech Talent Ecosystem 🚀

Sinerji is an advanced AI-powered platform designed to seamlessly connect university students and junior tech talent with companies through real-world tasks, internships, and mentorship programs. 

By leveraging intelligent Skill-Vector Matching, Sinerji ensures that the right candidates are paired with the right opportunities instantly, completely bypassing legacy, manual CV-screening bottlenecks.

## 🌟 Core Features

- **🧠 AI-Powered Skill Matching Engine:** Automatically calculates an `AI Match Score` for each application by processing student tech stacks, availability, graduation year, and job requirements.
- **🛡️ Strict Quality Gates:** Students must complete a comprehensive profile (including GitHub, Portfolios, and specific skill levels) before being allowed to apply for tasks, ensuring companies only review qualified candidates.
- **🎯 Dynamic Reward Workflows:** Application forms dynamically inject specific fields (like Expected Budget or Delivery Time) only when the task is freelance/contract based, while keeping volunteer/internship flows entirely separate.
- **📊 Interactive Company Dashboard:** Companies receive beautifully organized applicants arrays, automatically ranked by highest AI match percentage.
- **🏆 Gamification & Badges:** Integrated review systems allow companies to award verifiable badges to student profiles upon successful task completion.

## 🏗️ Technical Architecture (Monorepo)

The project follows a decoupled Client-Server Monorepo structure, built with best-in-class modern tools:
- **Client (`/client`):** Built with `Next.js 14`, `React`, `TypeScript`, and `Tailwind CSS`. Uses `Zod` and `react-hook-form` for robust, generic-safe form validation.
- **Server (`/server`):** Powered by `Node.js`, `Express`, and `TypeScript`.
- **Database:** `PostgreSQL` managed by the `Prisma` ORM.

## ⚙️ Local Development Setup

To run Sinerji locally, follow these steps:

### 1. Database Setup
Ensure PostgreSQL is running locally or provide a cloud connection string.
Create a `.env` file in the `/server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sinerji_db?schema=public"
```

### 2. Backend (Server) Initialization
```bash
cd server
npm install
# Sync database schema
npx prisma db push
# Generate prisma client
npx prisma generate
# (Optional) Seed the database with sample skills and a strong admin/student profile
npx ts-node seed_strong.ts
# Run development server
npm run dev
```

### 3. Frontend (Client) Initialization
```bash
cd client
npm install
# Run Next.js hot-reloading server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📜 AI Matching Data Pipeline (V2 Ready)
Sinerji implements a multi-dimensional intersection algorithm:
1. **Mandatory Skill Weighting:** Converts boolean skill arrays into customizable distance-based vectors.
2. **Language Thresholds:** Enforces remote communication compatibility.
3. **Timezone/Geography Constraints:** Prefers temporal alignment for Daily Stand-ups.
4. **Behavioral Feedback Hooks:** The algorithm is architected to recursively learn from company acceptance/rejections.

---
*Built to empower the next generation of software engineers and builders.*
