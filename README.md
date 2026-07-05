# Sinerji - Next-Gen Tech Talent Ecosystem 🚀

Sinerji is an advanced AI-powered platform designed to seamlessly connect university students and junior tech talent with companies through real-world tasks, internships, and mentorship programs. 

By leveraging intelligent Skill-Vector Matching, Sinerji ensures that the right candidates are paired with the right opportunities instantly, completely bypassing legacy, manual CV-screening bottlenecks.

## 🌟 Core Features & Modules

- **🧠 AI-Powered Skill Matching Engine:** A hybrid algorithm calculating a Match Score based on exact requirement matching (hard score) and NLP-based semantic similarity (semantic score).
- **🛡️ e-Devlet Student Verification:** An automated Puppeteer-based microservice that verifies Turkish university student documents instantly via the e-Devlet portal.
- **💳 Escrow Payment System:** Integrated with Iyzico, the platform locks task budgets safely upon agreement and releases funds to the student only upon task completion and company approval.
- **💬 Real-Time Chat & Notifications:** Powered by Socket.io, enabling seamless, instant communication between companies and students during the task lifecycle.
- **⏳ Automated Task Lifecycle (Cron Jobs):** System automatically cancels expired pending tasks and refunds escrowed amounts if deadlines pass without action.
- **🏆 Gamification & Reviews:** Integrated 5-star review systems allow mutual feedback and verifiable badges for completed tasks.

## 🏗️ Technical Architecture (Microservices & Monorepo)

The project follows a decoupled architecture, split into client, main server, and independent microservices:
- **Client (`/client`):** Built with `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS v4`, and `Zod`.
- **Main Server (`/server`):** Powered by `Node.js`, `Express`, and `TypeScript`. Handles core logic, JWT Auth, and routing.
- **Database:** `PostgreSQL` managed by the `Prisma` ORM.
- **Microservices:**
  - **Matching Service:** Calculates match scores (running on port 8001).
  - **Payment Service:** Handles Iyzico escrow workflows (running on port 5001).
  - **Verification Service:** Puppeteer PDF parsing for e-Devlet (running on port 4000).

## ⚙️ Local Development Setup

To run Sinerji locally, follow these steps:

### 1. Environment & Database Setup
Ensure PostgreSQL is running locally. Create a `.env` file in the `/server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sinerji_db?schema=public"
JWT_SECRET="your_secret"
# See wiki for microservice .env configurations
```

### 2. Backend (Server & Microservices)
```bash
cd server
npm install
# Sync database schema & generate client
npx prisma db push
npx prisma generate

# Run main server and microservices concurrently
npm run dev
```

### 3. Frontend (Client)
```bash
cd client
npm install
# Run Next.js hot-reloading server
npm run dev
```
The application will be available at `http://localhost:3000`.

---
*Built to empower the next generation of software engineers and builders.*
