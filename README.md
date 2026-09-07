# Skill2Hire

Skill2Hire is an AI-powered platform connecting students, colleges, and companies for smarter career and recruitment opportunities. It provides AI resume analysis, skill-gap detection, personalized learning, verified assessments, and intelligent job-candidate matching.

## Architecture

Skill2Hire is a role-based full-stack web application. The primary web application is built with Next.js App Router and React. It contains the user interface, server-rendered pages, API routes, authentication flows, middleware authorization, and shared product services. A separate Express/TypeScript backend and Prisma schema are also included for service-oriented deployments and database integration.

### High-level request flow

```text
Browser
	|
	v
Next.js App Router
	|
	+--> middleware.ts              Route and role protection
	+--> app/**/page.tsx            Page and dashboard UI
	+--> app/api/**/route.ts        Backend-for-frontend API routes
	+--> components/**              Shared shell and feature components
	+--> context/AuthContext.tsx    Client session and persona state
	|
	+--> lib/db.ts                  Local/data access abstraction
	+--> lib/ai.ts                  AI and recommendation helpers
	+--> lib/types.ts               Shared domain types
	|
	+--> Supabase / Prisma / JSON seed data / external services

Optional service deployment:
Browser or Next.js API routes --> backend/src/server.ts --> controllers --> services --> Prisma/database
```

### Repository map

```text
.
├── app/                              Next.js App Router application
│   ├── layout.tsx                    Root HTML, metadata, AuthProvider, AppShell
│   ├── page.tsx                      Public landing/home page
│   ├── globals.css                   Global Tailwind and base styles
│   ├── admin/dashboard/page.tsx      Platform administration dashboard
│   ├── assessments/[id]/page.tsx     Assessment taking and submission UI
│   ├── brand/page.tsx                Brand and identity page
│   ├── college/                      College portal pages
│   │   ├── dashboard/                College overview
│   │   ├── students/                 Student roster and reports
│   │   ├── training/                 Training programs and analytics
│   │   ├── skill-heatmap/            Cohort skill visualization
│   │   ├── curriculum-gap/           Curriculum gap analysis
│   │   ├── industry-demand/           Industry skill demand
│   │   ├── demand-signals/            Employer demand signals
│   │   └── placement-readiness/       Batch placement readiness
│   ├── courses/                      Course catalogue and course details
│   │   └── [id]/learn/                Lesson learning experience
│   ├── differentiation/page.tsx      Platform differentiation and philosophy
│   ├── forgot-password/page.tsx      Password recovery and OTP flow
│   ├── jobs/                         Job discovery and job details
│   ├── learn/                        Skill learning and skill details
│   ├── login/page.tsx                Email, OTP, Google, and demo login
│   ├── recruiter/                    Company/recruiter portal pages
│   │   ├── dashboard/                Recruiter overview
│   │   ├── jobs/                     Job creation
│   │   ├── candidates/               Candidate discovery
│   │   ├── applications/             Application pipeline
│   │   ├── campus-pipeline/           Campus hiring pipeline
│   │   └── skill-search/              Skill-first talent search
│   ├── search/page.tsx               Global search results
│   ├── security-audit/page.tsx       Security and access-control checks
│   ├── signup/page.tsx               Account registration and profile setup
│   ├── student/                      Student portal pages
│   │   ├── dashboard/                Personalized student dashboard
│   │   ├── skills/                   Skill profile and gap analysis
│   │   ├── become-ready/             Job-readiness roadmap
│   │   ├── career-guide/             Career recommendations
│   │   ├── academic-report/          Academic and readiness report
│   │   ├── applications/             Student job applications
│   │   ├── certificates/             Certificates and achievements
│   │   ├── coding-practice/          Coding challenge experience
│   │   ├── compiler/                 Browser-based compiler/IDE
│   │   ├── interview-coach/           Interview practice and evaluation
│   │   ├── projects/                 Projects and recommendations
│   │   └── resume-matcher/            Resume-to-job matching
│   ├── verify/[id]/page.tsx           Public certificate verification
│   └── api/                          Next.js server API routes
│       ├── admin/                    Admin statistics
│       ├── ai/                       AI extraction and demand analysis
│       ├── assessments/               Assessment retrieval and submission
│       ├── auth/                     Login, registration, logout, OTP, reset
│       ├── certificates/              Certificate verification data
│       ├── coding/                   Coding problems and code submission
│       ├── colleges/                 College analytics and training data
│       ├── courses/                  Course and lesson data
│       ├── demo/                     Demo workflow/reset operations
│       ├── interview/                Interview questions and evaluation
│       ├── jobs/                     Job search, details, and applications
│       ├── learn/                    Skill learning data
│       ├── notifications/            User notifications
│       ├── projects/                 Project recommendations and submission
│       ├── recruiter/                Recruiter candidates, applications, demand
│       ├── search/                   Global search endpoint
│       └── students/                 Student profiles, skills, reports, roadmap
├── components/                       Shared React UI and application shell
│   ├── AppShell.tsx                  Sidebar, header, content frame, footer
│   ├── Sidebar.tsx                   Role-aware navigation and persona actions
│   ├── TopHeader.tsx                 Breadcrumbs, search, notifications, persona menu
│   ├── Footer.tsx                    Shared footer navigation
│   ├── ProtectedRoute.tsx             Client role authorization boundary
│   ├── AiAdvisorWidget.tsx            Floating AI career advisor
│   ├── GlobalSearchBar.tsx            Search input and navigation suggestions
│   ├── ReadinessGauge.tsx             Readiness score visualization
│   ├── SkillBadge.tsx                Skill status badge
│   ├── Skill2HireLogo.tsx             Shared logo/role branding
│   ├── DemoWorkflowBanner.tsx         Demo workflow controls
│   ├── SecuritySettingsModal.tsx      Verified contact/security settings
│   ├── GoogleSignInModal.tsx          Google sign-in UI
│   ├── LiveOtpNotificationBanner.tsx  OTP status notifications
│   └── SmsNotificationBanner.tsx      SMS status notifications
├── context/
│   └── AuthContext.tsx                Session, role, profile, login, logout, persona state
├── lib/                              Shared client/server domain services
│   ├── ai.ts                          AI helper functions
│   ├── authMiddleware.ts               Session token signing and security events
│   ├── courseMaterials.ts              Course content data
│   ├── db.ts                          Data access and domain operations
│   ├── detailedLessonNotes.ts          Extended lesson notes
│   ├── firebaseAuth.ts                Firebase authentication integration
│   ├── otpService.ts                  OTP creation and delivery helpers
│   ├── seedData.ts                    Application seed/reference data
│   ├── supabase.ts                    Supabase client setup
│   ├── types.ts                       Shared TypeScript domain types
│   └── ...                            Additional shared utilities as added
├── backend/                          Optional standalone backend service
│   ├── package.json                   Backend dependencies and scripts
│   ├── tsconfig.json                  Backend TypeScript configuration
│   ├── prisma/schema.prisma           Relational data model
│   ├── prisma/seed.ts                 Prisma database seed
│   └── src/
│       ├── server.ts                  Express/server entry point
│       ├── config/                    Runtime and service configuration
│       ├── controllers/               HTTP request controllers
│       ├── middleware/                Backend middleware and authorization
│       ├── routes/                    Backend route declarations
│       ├── services/                  Business logic and integrations
│       ├── utils/                     Backend helpers
│       └── validators/                Request validation
├── data/                             Local development data
│   ├── db.json                        Main local data store
│   └── live_dispatches.json           Live notification/dispatch data
├── public/                           Static assets served from the site root
│   └── models/                        Face-landmark model files for browser features
├── scripts/
│   ├── seed.mjs                       Local application data seeding
│   └── seed-supabase.ts               Supabase data seeding
├── supabase/
│   └── schema_and_rls.sql             Supabase schema and row-level security policies
├── middleware.ts                     Next.js Edge middleware for session/role routes
├── next.config.mjs                   Next.js configuration
├── tailwind.config.ts                Tailwind content paths and design tokens
├── postcss.config.mjs                PostCSS/Tailwind processing
├── tsconfig.json                     Frontend TypeScript configuration
├── next-env.d.ts                     Next.js generated TypeScript declarations
├── package.json                      Frontend scripts and dependencies
└── .env.example                      Environment variable template
```

### Application layers

#### Presentation layer

Pages under `app/**/page.tsx` provide role-specific workflows. Shared shell components in `components/` keep navigation, responsive layout, authentication affordances, notifications, search, and the AI advisor consistent across all portals.

#### Navigation and authorization

`AppShell` mounts the global sidebar and header. `Sidebar` generates navigation from the active role. `middleware.ts` performs early cookie/JWT checks for protected URL prefixes. `ProtectedRoute` performs the client-side role check after the auth context is initialized. This gives both fast route rejection and a UI-level authorization boundary.

#### Authentication and session state

`AuthContext` owns the current user, role, profile, loading state, login methods, OTP/Google flows, persona switching, logout, and profile refresh. The auth API sets the `s2h_session` HTTP-only cookie. Browser-local persona identifiers are used to restore the demo/session profile through `/api/auth/login`.

#### API and business logic

The `app/api/` routes act as the Next.js backend-for-frontend. They validate requests, call shared services/data helpers, and return JSON to the client pages. The standalone `backend/` directory provides a conventional Express-style separation into routes, controllers, services, middleware, validators, and utilities for deployments that need a separate API process.

#### Data and integrations

The application supports local JSON/reference data through `data/` and `lib/db.ts`, Supabase through `lib/supabase.ts` and `supabase/schema_and_rls.sql`, and Prisma through `backend/prisma/schema.prisma`. AI, OTP, Firebase, and course/lesson integrations are isolated in `lib/` service modules.

### Main roles and capabilities

| Role | Main areas |
| --- | --- |
| Student | Dashboard, jobs, courses, learning, skills, readiness, assessments, coding, interviews, projects, resume matching, applications, certificates |
| College | Student roster, skill heatmap, curriculum gaps, training, industry demand, placement readiness, analytics |
| Company | Job creation, candidate search, skill search, applications, campus pipeline, hiring analytics |
| Admin | Platform statistics, ecosystem administration, audits, and cross-role oversight |

### Local development

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`. Use `npm run build` for a production build and `npm run start` to serve that build. Do not run `npm run build` and `npm run dev` against the same workspace at the same time because both write generated files to `.next`.

Backend setup is independent:

```bash
cd backend
npm install
npm run dev
```

Configure local secrets and service URLs from `.env.example` before enabling external services. Seed local or Supabase data with the scripts in `scripts/` as appropriate for the selected data layer.
