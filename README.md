<div align="center">

# Skill2Job.ai

### Enterprise AI-Powered Campus Recruitment, Skill Verification & Talent Intelligence Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Google Gemini 2.0](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis_L2_Cache-00e9a3?style=for-the-badge&logo=redis)](https://upstash.com/)
[![Sentry](https://img.shields.io/badge/Sentry-Telemetry_&_Logs-362d59?style=for-the-badge&logo=sentry)](https://sentry.io/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-FCC72B?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Ready-2EAD33?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable_&_Offline-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

**Bridging Campus Talent to High-Growth Careers Through Cryptographic Verification, Dual-Engine AI Matching, and Institutional Placement Intelligence.**

[Explore Features](#-feature-matrix) • [Architecture](#-system-architecture) • [Visual Tour](#-platform-screenshots--visual-tour) • [Setup Guide](#-step-by-step-installation--setup) • [Demo Credentials](#-demo-credentials-matrix) • [Testing](#-testing--quality-assurance)

</div>

---

## 📖 Table of Contents

1. [Executive Overview & Problem Statement](#-executive-overview--problem-statement)
2. [System Architecture](#-system-architecture)
3. [Platform Screenshots & Visual Tour](#-platform-screenshots--visual-tour)
4. [Feature Matrix](#-feature-matrix)
   - [Student Portal](#1-student-portal)
   - [Recruiter Hub](#2-recruiter-hub)
   - [College Placement Cell (TPO)](#3-college-placement-cell-tpo)
   - [SuperAdmin & Security Governance](#4-superadmin--security-governance)
   - [Cross-Platform & Accessibility](#5-cross-platform--accessibility)
5. [Tech Stack](#-tech-stack)
6. [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
7. [Demo Credentials Matrix](#-demo-credentials-matrix)
8. [Testing & Quality Assurance](#-testing--quality-assurance)
9. [CI/CD & GitHub Actions](#-cicd--github-actions)
10. [Brand Identity & Naming Guidelines](#-brand-identity--naming-guidelines)
11. [License](#-license)

---

## 🎯 Executive Overview & Problem Statement

### The Campus Recruitment Divide
Campus recruitment faces structural inefficiencies that hurt candidates, universities, and corporate recruiters alike:
* **Unverified Resumes & Skill Inflation**: Traditional job boards rely on unvetted bullet points. Recruiters spend thousands of hours filtering fabricated claims and keyword-stuffed resumes.
* **Disconnected Academic Curricula**: University syllabi lag behind fast-evolving market requirements. Placement cells (TPOs) lack real-time visibility into industry skill demands.
* **High AI API Overhead**: Deploying LLMs for high-volume resume evaluations without caching or protection leads to runaway cloud costs, latency spikes, and vulnerability to prompt injection attacks.
* **Manual Placement Operations**: College placement coordinators manage multi-round placement drives through fragmented spreadsheets and disconnected email threads.

### The Skill2Job.ai Solution
**Skill2Job.ai** is an integrated, 4-sided education-to-employment SaaS ecosystem:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              Skill2Job.ai                              │
 │            Enterprise Education-to-Employment Ecosystem               │
 └───────┬─────────────────┬───────────────────┬──────────────────┬───────┘
         │                 │                   │                  │
         ▼                 ▼                   ▼                  ▼
   🎓 Students       🏢 Recruiters       🏛️ Colleges        ⚙️ SuperAdmins
   • Skill Passport  • AI Match Engine   • Drive Manager    • Audit Trail
   • Code Sandbox    • Shortlist & Notes • Dept Analytics   • Rate Limiter
   • ATS Analyzer    • Scheduler & Email • Skill Gap Radar  • Cache Monitor
   • Mock Interview  • Bulk Candidate Ops• CSV/PDF Exports  • Security Guards
```

1. **Cryptographic Proof of Skill**: Skills are proven via proctored interactive assessments, code sandbox executions, and GitHub/LeetCode synchronizations, generating tamper-proof, digitally signed certificates with SHA-256 HMAC verification.
2. **Dual-Engine AI Matching**: Candidates are evaluated using Google Gemini 2.0 Flash alongside deterministic local heuristics. If network or API limits are reached, the system gracefully falls back to instant local scoring with 100% uptime.
3. **Multi-Tier AI Caching**: An L1 In-Memory LRU + L2 Upstash Redis caching tier with canonical JSON SHA-256 hashing slashes LLM evaluation costs and cuts response latency by up to 95%.
4. **Institutional Placement Intelligence**: Universities receive actionable real-time analytics, automated placement drive management, department-wise performance breakdowns, and one-click PDF/CSV exports.

---

## 🏗️ System Architecture

Skill2Job.ai is engineered with a modular, resilient multi-tier architecture built on Next.js 14 App Router, Prisma ORM, and enterprise security layers:

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Web & Mobile PWA)"]
        Browser["Desktop & Mobile Browsers"]
        PWA["PWA Service Worker & Offline Cache"]
        i18n["Multi-Language Engine (7+ Locales)"]
    end

    subgraph Security ["Security & Gateways Layer"]
        RateLimit["Arcjet / In-Memory Token Bucket Limiter"]
        PromptGuard["Prompt Injection Shield & Input Validator"]
        AuthGuards["Role & Multi-Tenant Authorization (RBAC)"]
        PIIRedact["Sensitive Data & PII Redactor"]
    end

    subgraph AppRouter ["Next.js 14 App Router API & Controllers"]
        AuthRoute["/api/auth/* (OTP, Session, Google)"]
        AIRoute["/api/ai/* (Match, Advisor, ATS)"]
        RecruiterRoute["/api/recruiter/* (Shortlist, Schedule, Bulk)"]
        CollegeRoute["/api/college/* (Drives, Reports, Exports)"]
        StudentRoute["/api/students/* (Passport, Projects)"]
        SandboxRoute["/api/compiler/run (Isolated Runner)"]
    end

    subgraph CacheTier ["Multi-Tier AI Caching Layer"]
        L1Cache["L1: Fast In-Memory LRU Cache"]
        L2Cache["L2: Distributed Upstash Redis (REST)"]
        KeyHash["Canonical SHA-256 Request Hasher"]
    end

    subgraph Engines ["Intelligence & Compute Engines"]
        GeminiAI["Google Gemini 2.0 Flash LLM"]
        HeuristicAI["Local Deterministic Heuristic Engine"]
        CodeRunner["Node.js VM & Python Subprocess Sandbox"]
    end

    subgraph DataTier ["Persistence & Cloud Storage"]
        PrismaORM["Prisma 5 ORM Engine"]
        PostgreSQL[("PostgreSQL Database (Neon / Supabase / Local)")]
        CloudStorage["S3 / Supabase / Vercel Blob (Resumes)"]
    end

    subgraph Observability ["Telemetry & Logging"]
        SentrySDK["Sentry 11 Exception & Performance Tracing"]
        AuditLogger["Tamper-Proof Audit Trail Repository"]
        EmailGateway["Resend & SMTP Notification Engine"]
    end

    Browser --> RateLimit
    PWA --> RateLimit
    RateLimit --> PromptGuard
    PromptGuard --> AuthGuards
    AuthGuards --> AppRouter

    AIRoute --> KeyHash
    KeyHash --> L1Cache
    L1Cache -- Cache Miss --> L2Cache
    L2Cache -- Cache Miss --> GeminiAI
    GeminiAI -- Rate Limited / Fallback --> HeuristicAI
    AIRoute --> SentrySDK

    SandboxRoute --> CodeRunner
    RecruiterRoute --> EmailGateway
    AppRouter --> PrismaORM
    PrismaORM --> PostgreSQL
    AppRouter --> AuditLogger
    AuditLogger --> PostgreSQL
```

---

## 📸 Platform Screenshots & Visual Tour

| Student Career Dashboard | AI Job Opportunities & Matching Engine |
| :---: | :---: |
| ![Student Dashboard](docs/screenshots/student-dashboard.png) | ![Job Matching](docs/screenshots/job-matching.png) |
| *Unified student hub showing verified skills, readiness score, and live applications.* | *Weighted multi-factor matching scoring candidates against live requirements.* |

| AI Mock Interview & Feedback Simulator | Proctored Skill Assessment & Certification |
| :---: | :---: |
| ![AI Mock Interview](docs/screenshots/ai-mock-interview.png) | ![Proctored Assessments](docs/screenshots/proctored-assessments.png) |
| *Adaptive technical interview simulator with instant scoring & improvement tips.* | *Timed assessment engine with tab-switch detection and HMAC-signed credentials.* |

| Interactive Code Sandbox & Compiler | Student Capstone Project Portfolio |
| :---: | :---: |
| ![Code Sandbox](docs/screenshots/code-sandbox-compiler.png) | ![Student Projects](docs/screenshots/student-projects.png) |
| *Isolated execution environment supporting JavaScript, Python, HTML/CSS, and C++.* | *Showcases verified capstone projects with GitHub imports and rubric metrics.* |

| Academic Performance & Readiness Analytics | Career Readiness Diagnostic Engine |
| :---: | :---: |
| ![Academic Report](docs/screenshots/academic-report.png) | ![Career Readiness](docs/screenshots/career-readiness.png) |
| *Cryptographically verifiable transcript with GPA, skill badges, and recruiter links.* | *Radar-chart diagnosis of technical gaps, domain competencies, and milestones.* |

| Skill Ecosystems & Learning Academy | Security, Compliance & Audit Trail |
| :---: | :---: |
| ![Learning Ecosystems](docs/screenshots/learning-ecosystems.png) | ![Security Audit Trail](docs/screenshots/security-audit-trail.png) |
| *Structured video courses, interactive notes, and curated curriculum tracks.* | *Enterprise audit trail recording role elevations, logins, and status transitions.* |

| Platform Differentiation Matrix | Brand Identity & Design System Guide |
| :---: | :---: |
| ![Platform Differentiation](docs/screenshots/platform-differentiation.png) | ![Brand Guide](docs/screenshots/brand-guide.png) |
| *Comparative analysis highlighting Skill2Job.ai's edge over legacy job portals.* | *Standardized design system, typography, role color schemes, and official badges.* |

---

## ✨ Feature Matrix

### 1. Student Portal
* **Verified Skill Passport**: Cryptographically secured profile showcasing skills graded into *Self-Declared*, *Assessment Verified*, and *Industry Endorsed*.
* **ATS Resume Builder & Optimizer**: Real-time scoring against job descriptions, keyword gap identification, and instant XYZ/STAR bullet rewriting.
* **Multi-Language Code Sandbox**: Interactive in-browser compiler for Python, JavaScript, HTML, and CSS with real-time test execution.
* **Proctored Assessments**: Anti-cheat violation tracking (tab switches, full-screen exits) generating permanent HMAC-SHA256 verified certificates at `/verify/[id]`.
* **AI Mock Interview Coach**: Role-specific technical & behavioral interview simulations with real-time scoring and transcript generation.
* **GitHub & LeetCode Synchronization**: Automatic profile import that detects repositories, top languages, and algorithmic mastery tiers.

### 2. Recruiter Hub
* **Dual-Engine Talent Matching**: Evaluates candidates based on verified skills, projects, and coursework with detailed AI match explanations.
* **Candidate Pipeline & Status Tracker**: Manage candidate stages: `Applied` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Accepted` / `Rejected`.
* **Interview Scheduler**: Book interview slots with integrated calendar sync (Google/Outlook .ics generation) and automatic transactional email dispatch.
* **Candidate Evaluation Notes**: Secure internal recruiter notes and rubric grading per candidate.
* **Bulk Candidate Actions**: One-click bulk shortlisting, mass stage progression, and bulk CSV export.

### 3. College Placement Cell (TPO)
* **Placement Drive Orchestration**: Manage company campus drives, eligibility criteria, department targeting, and candidate enrollment.
* **Department-Wise Placement Reports**: Visual breakdown of placement percentages, average CTC, and readiness benchmarks by department.
* **One-Click Export Engine**: Export drive rosters and department statistics in both structured CSV and formatted PDF summaries.
* **Curriculum Skill-Gap Analysis**: Benchmarks university academic curricula against active corporate job postings to suggest syllabus enhancements.
* **Corporate Demand Radar**: Real-time intelligence tracking high-demand languages, frameworks, and engineering competencies.

### 4. SuperAdmin & Security Governance
* **Tamper-Proof Audit Trail**: Immutable logging of all sensitive administrative actions (role promotions, status overrides, logins, deletions) with IP and user-agent tagging.
* **Multi-Tier Rate Limiting**: Arcjet and token-bucket rate limiting on every AI and authentication route to prevent API exhaustion and DDoS.
* **Prompt Injection & Input Shield**: Regex-based heuristic filters protecting against adversarial jailbreaks, system-prompt extraction, and oversized payloads.
* **Multi-Tier AI Cache Manager**: L1 in-memory + L2 Upstash Redis caching with SHA-256 keying and real-time telemetry at `/api/cache/stats`.
* **Centralized Sentry Observability**: Automatic exception capture with client/server/edge configurations and strict PII redaction (sanitizes passwords, tokens, API keys, and OTPs).

### 5. Cross-Platform & Accessibility
* **Progressive Web App (PWA)**: Installable on iOS, Android, macOS, and Windows with offline fallback page (`/offline`) and background caching.
* **Multi-Language Support (i18n)**: Seamless language switcher supporting English, Hindi (हिन्दी), Spanish (Español), French (Français), German (Deutsch), Chinese (中文), and Japanese (日本語).
* **Responsive Dark / Light Themes**: Theme system with persistent storage, contrast accessibility, and system preference detection.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router) | React Server Components, server actions, client components, streaming SSR |
| **UI & Styling** | [React 18](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/) | Modern responsive design system, dark mode, Lucide icons, Canvas Confetti |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma 5.22](https://www.prisma.io/) | Relational database schema with type-safe queries, migrations, and seeder |
| **Artificial Intelligence** | [Google Gemini 2.0 Flash](https://aistudio.google.com/) | Low-latency LLM for resume ATS scoring, interview evaluations, and matching |
| **Local Heuristics** | Deterministic JS Algorithms | Zero-latency fallback matching and scoring engine when external LLMs are offline |
| **Caching Tier** | L1 In-Memory LRU + [Upstash Redis](https://upstash.com/) | Distributed L2 cache with canonical SHA-256 JSON hashing to cut AI costs |
| **Security & Rate Limiting** | [Arcjet](https://arcjet.com/) & Token Bucket | Rate limiting on AI & auth routes, prompt injection shield, PII scrubbing |
| **Authentication** | JWT, bcryptjs, Session Cookies | Role-based access control (Student, Recruiter, College, Admin), OTP verification |
| **Email & SMS Gateway** | [Resend](https://resend.com/), Nodemailer, Twilio | Transactional OTP dispatch and recruiter interview notifications |
| **Observability** | [Sentry 11](https://sentry.io/) | Full-stack error capture, breadcrumbs, performance telemetry, and structured logging |
| **Testing Suite** | [Node Test Runner](https://nodejs.org/), [Vitest 5](https://vitest.dev/), [Playwright](https://playwright.dev/) | 149+ automated unit, integration, and E2E browser tests |
| **Mobile & PWA** | Web App Manifest, Service Workers | Offline service worker cache, responsive layout, installable app banners |

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
* **Node.js**: `>= 18.18.0` (Recommended: Node.js 20 LTS or 22 LTS)
* **npm**: `>= 9.0.0`
* **PostgreSQL**: `>= 14` (Local PostgreSQL instance or cloud provider like Neon / Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/Megha-r20/Skill2Job.ai.git
cd Skill2Job.ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in the required configuration:
```env
# 1. Database Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skill2job?schema=public"

# 2. Security Secrets (Generate a 32+ char secret)
JWT_SECRET="your-super-secret-jwt-token-minimum-32-characters-long"
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 3. AI & LLM Engine (Google Gemini)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODEL="gemini-2.0-flash"

# 4. Optional: Distributed AI Cache (Upstash Redis)
# UPSTASH_REDIS_REST_URL="https://your-upstash-db.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# 5. Optional: Sentry Error Tracking
# SENTRY_DSN="https://your_sentry_dsn@sentry.io/123456"
# NEXT_PUBLIC_SENTRY_DSN="https://your_sentry_dsn@sentry.io/123456"

# 6. Transactional Email (Resend or Gmail SMTP)
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="Skill2Job.ai <notifications@skill2job.ai>"
```

> **Note**: Even if you do not have external API keys for Gemini or Redis, the platform will automatically run in **resilient mock/heuristic fallback mode**, ensuring that all UI features, sandbox executions, and matching algorithms function smoothly.

### 4. Run Prisma Database Migrations
Initialize the PostgreSQL schema using Prisma:
```bash
npx prisma migrate dev --name init
```
For production deployments:
```bash
npx prisma migrate deploy
```

### 5. Seed the Database
Populate your database with rich demo data across all four user roles, complete with colleges, placement drives, jobs, assessments, and sample applications:
```bash
npm run seed
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials Matrix

The seeder initializes fully functional test accounts for each stakeholder:

| Role | User Name | Demo Email | Password | Primary Portal Route |
| :--- | :--- | :--- | :--- | :--- |
| **🎓 Student** | Alex Rivera | `alex.rivera@student.skill2job.ai` | `password123` / `Password123!` | [`/student/dashboard`](http://localhost:3000/student/dashboard) |
| **🎓 Student (Alternate)** | Samantha Chen | `samantha.chen@student.skill2job.ai` | `password123` / `Password123!` | [`/student/dashboard`](http://localhost:3000/student/dashboard) |
| **🏢 Recruiter** | Elena Rostova (TechNova) | `recruiter@technova.com` | `password123` / `Password123!` | [`/recruiter/dashboard`](http://localhost:3000/recruiter/dashboard) |
| **🏛️ College TPO** | Dr. Aris Thorne (Apex Univ) | `placement@apexuniversity.edu` | `password123` / `Password123!` | [`/college/dashboard`](http://localhost:3000/college/dashboard) |
| **⚙️ SuperAdmin** | Chief Administrator | `admin@skill2job.ai` | `password123` / `Password123!` | [`/admin/dashboard`](http://localhost:3000/admin/dashboard) |

> **Quick Login Tip**: You can also sign in instantly using any of the one-click demo role switcher buttons on the `/login` page.

---

## 🧪 Testing & Quality Assurance

The codebase includes an extensive automated test suite covering unit logic, integration flows, rate limiting, and end-to-end security:

```bash
# Run the complete test suite (149+ automated checks)
npm run test:all

# Run the Node.js test runner suite (131 tests)
npm test

# Run the Vitest unit tests (18 tests: matching & auth guards)
npm run test:vitest

# Run Playwright End-to-End browser tests
npx playwright test

# Run code style and ESLint validations
npm run lint

# Run full Next.js production build verification
npm run build
```

### Test Coverage Highlights
* **AI Caching & Telemetry**: Validates canonical SHA-256 key hashing, in-memory LRU eviction, Upstash Redis L2 roundtrips, and Sentry PII redaction.
* **Authentication & Ownership Security**: Verifies token-bucket rate limits, multi-tenant boundaries (preventing cross-tenant data leakage), and role authorization.
* **Skill Verification Grader**: Tests proctoring violation triggers (tab switching), passing thresholds, and HMAC digital certificate verification.
* **Recruiter & College Workflows**: Tests interview scheduling, notification dispatch, placement drive life-cycles, and CSV/PDF report generators.

---

## 🔄 CI/CD & GitHub Actions

The repository includes a production-ready GitHub Actions workflow (`.github/workflows/ci.yml`) that triggers on every pull request and push to `main`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx prisma generate
      - run: npm test
      - run: npm run test:vitest
      - run: npm run build
```

---

## 🎨 Brand Identity & Naming Guidelines

To maintain brand consistency across all marketing, documentation, and user interfaces:

* **Official Brand Name**: **`Skill2Job.ai`**
* **Package Name**: `skill2job-ai`
* **Canonical Tagline**: *"Bridging Campus Talent to High-Growth Careers"*
* **App Icon**: Available at `/public/logo-app-icon.png` and `/public/icon.svg`
* **Brand Guide**: Visit [`/brand`](http://localhost:3000/brand) in the live application for color tokens, typography scales, and role badges.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ by the Skill2Job.ai Engineering Team. Designed for students, recruiters, and educational institutions worldwide.</sub>
</div>
