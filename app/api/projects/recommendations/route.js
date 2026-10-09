import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const ALL_CATALOG_PROJECTS = [
  {
    id: 'prec_1',
    title: 'High-Throughput Distributed Task Queue & Cache',
    targetRole: 'Software Developer',
    technologies: ['Python', 'SQL', 'Redis', 'Docker'],
    difficulty: 'Intermediate',
    description: 'Build an asynchronous job processing system with Redis-backed queueing, retry policies, worker concurrency, and PostgreSQL execution telemetry.',
    features: [
      'Worker thread pool for concurrent asynchronous job processing.',
      'Exponential backoff retry policy for failed jobs with Dead Letter Queue (DLQ).',
      'RESTful API dashboard displaying real-time throughput telemetry and worker health.'
    ],
    learningOutcomes: ['Distributed systems architecture', 'Concurrency controls', 'Database connection pooling'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/distributed-task-queue'
  },
  {
    id: 'prec_2',
    title: 'E-Commerce Predictive Customer Churn & Analytics',
    targetRole: 'Data Analyst',
    technologies: ['Python', 'SQL', 'Pandas & NumPy', 'AI/ML'],
    difficulty: 'Intermediate',
    description: 'Analyze consumer transaction history to predict customer churn, perform cohort retention analysis, and build an interactive reporting dashboard.',
    features: [
      'ETL pipeline parsing 500k+ mock transaction rows using SQL & Pandas.',
      'Random Forest and Logistic Regression classification models for churn likelihood.',
      'Interactive analytics dashboard showcasing cohort churn drivers.'
    ],
    learningOutcomes: ['Data wrangling at scale', 'Feature engineering', 'Business intelligence reporting'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/customer-churn-analytics'
  },
  {
    id: 'prec_3',
    title: 'Cloud-Native Container Orchestration & CI/CD Pipeline',
    targetRole: 'Cloud DevOps Associate',
    technologies: ['AWS', 'Docker', 'Linux CLI', 'Git'],
    difficulty: 'Intermediate',
    description: 'Deploy a multi-service microservice application to AWS ECS/EKS with automated GitHub Actions testing and Infrastructure as Code.',
    features: [
      'Dockerized backend and frontend services with multi-stage builds.',
      'Automated CI/CD workflow triggering automated unit tests and Docker image publishing.',
      'AWS infrastructure provisioning with IAM least-privilege security policies.'
    ],
    learningOutcomes: ['Container security', 'Cloud infrastructure automation', 'DevOps best practices'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/cloud-native-devops'
  },
  {
    id: 'prec_4',
    title: 'AI Conversational Agent with Retrieval-Augmented Generation (RAG)',
    targetRole: 'Software Developer',
    technologies: ['Python', 'AI/ML', 'SQL', 'Git'],
    difficulty: 'Advanced',
    description: 'Build an intelligent chatbot utilizing PDF document indexing, text embedding vectors database, and OpenAI API with context-augmented chat history.',
    features: [
      'PDF parser and document text splitter pipelines.',
      'Vector similarity search using pgvector or pinecone database indexes.',
      'Conversational agent stream interface retaining chat session memory.'
    ],
    learningOutcomes: ['Retrieval-Augmented Generation concepts', 'Vector databases schema', 'Large language model prompting'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/ai-rag-chatbot'
  },
  {
    id: 'prec_5',
    title: 'Kubernetes Microservices Deploy & GitOps Reconciliation',
    targetRole: 'Cloud DevOps Associate',
    technologies: ['Docker', 'Linux CLI', 'Git', 'AWS'],
    difficulty: 'Advanced',
    description: 'Build a containerized deployment workflow utilizing Kubernetes manifests and automated GitOps sync tracking using mock ArgoCD agents.',
    features: [
      'Kubernetes pod liveness and readiness probe configurations.',
      'Automated cluster health telemetry logging.',
      'Declarative state reconciliation loop matching active environment to Git repo changes.'
    ],
    learningOutcomes: ['Cluster deployment controls', 'Infrastructure GitOps concepts', 'System health automation'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/gitops-kubernetes'
  },
  {
    id: 'prec_6',
    title: 'Financial Portfolio Analytics Dashboard & Forecasting',
    targetRole: 'Data Analyst',
    technologies: ['Python', 'Pandas & NumPy', 'SQL', 'AI/ML'],
    difficulty: 'Advanced',
    description: 'Collect mock public stock ticks history, analyze rolling moving averages covariance matrix, and forecast market performance using statistical regression models.',
    features: [
      'Pandas vectorization calculating Sharpe ratio and portfolio risk allocations.',
      'Time-series stock price forecasting using linear regression classifiers.',
      'Interactive charts rendering historical analytics and expected returns forecasts.'
    ],
    learningOutcomes: ['Time-series math', 'Financial data structures', 'Exploratory metrics visualization'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/financial-analytics'
  },
  {
    id: 'prec_7',
    title: 'E-Commerce React Component Hub with Stripe Checkout',
    targetRole: 'Software Developer',
    technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
    difficulty: 'Beginner',
    description: 'Build an interactive storefront frontend utilizing custom React context state containers, filters, search catalogs, and simulated checkout flows.',
    features: [
      'Cart state manager handling item quantities and subtotals across pages.',
      'CSS Flexbox/Grid layouts rendering responsive product cards catalogs.',
      'Simulated Stripe payment checkout flow validating card fields and showing confirmation.'
    ],
    learningOutcomes: ['Client state handling', 'Responsive CSS templates', 'Simulated API processing'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/react-storefront'
  },
  {
    id: 'prec_8',
    title: 'Secure OTP Verification API Gateways',
    targetRole: 'Software Developer',
    technologies: ['Python', 'Redis', 'SQL', 'Git'],
    difficulty: 'Intermediate',
    description: 'Build a rate-limited secure OTP verification endpoint utilizing local Redis caching for dynamic verification codes and expiry timelines.',
    features: [
      'Redis-backed TTL code storage expiring records after 2 minutes.',
      'IP rate-limiter blocking users after 3 incorrect verification attempts.',
      'Automated telemetry logging for successful and blocked validation audits.'
    ],
    learningOutcomes: ['API security structures', 'Redis cache key management', 'System rate limiting design'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/secure-otp-gateway'
  },
  {
    id: 'prec_9',
    title: 'Auto-Scaling RESTful API Express Server',
    targetRole: 'Software Developer',
    technologies: ['JavaScript', 'Docker', 'AWS', 'Linux CLI'],
    difficulty: 'Intermediate',
    description: 'Build a Node.js Express server packaged inside multi-stage Docker container builds, configured for cluster worker threading and scaling.',
    features: [
      'Node.js clusters spawning workers based on logical CPU core counts.',
      'Express endpoints returning server load stats and processing health.',
      'Dockerized orchestration mapping ports and environment variables cleanly.'
    ],
    learningOutcomes: ['Multi-threaded node engines', 'Docker image builds optimization', 'Cloud runtime scaling'],
    githubTemplateUrl: 'https://github.com/skill2hire-templates/scaling-express-server'
  }
];

export async function GET(request) {
  try {
    const rateLimit = await applyRateLimit(request, 'ai');
    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'Software Developer';
    const studentId = searchParams.get('studentId') || 'std_1';

    let student = null;
    let verifiedSkills = [];

    // Safely attempt DB read with fallback
    try {
      student = await prisma.student.findUnique({ where: { id: studentId } });
      verifiedSkills = await prisma.studentSkill.findMany({
        where: { studentId, status: 'VERIFIED' }
      });
    } catch (dbErr) {
      // Database is offline or unreachable - use robust defaults
      console.warn('Prisma DB unavailable in project recommendations; using offline mock student profile.');
      student = {
        id: studentId,
        placementReadiness: 78,
        placementStatus: 'Placement Ready'
      };
      verifiedSkills = [
        { skillName: 'Python' },
        { skillName: 'SQL' },
        { skillName: 'React' },
        { skillName: 'Git' }
      ];
    }

    const verifiedSkillsNames = (verifiedSkills || []).map(v => (v.skillName || '').toLowerCase());

    // Map and score recommendations dynamically
    const scoredRecommendations = ALL_CATALOG_PROJECTS.map(proj => {
      let score = 0;
      let matchReasons = [];

      // 1. Role match: prioritize projects targeting active query role
      const matchesTargetRole =
        proj.targetRole.toLowerCase().includes(role.toLowerCase()) ||
        role.toLowerCase().includes(proj.targetRole.toLowerCase());

      if (matchesTargetRole) {
        score += 50;
        matchReasons.push(`Matches target career role: ${proj.targetRole}`);
      }

      // 2. Skill match: check if student has verified skills in technologies required
      const matchingTech = proj.technologies.filter(tech =>
        verifiedSkillsNames.includes(tech.toLowerCase())
      );

      if (matchingTech.length > 0) {
        score += matchingTech.length * 15;
        matchReasons.push(`Leverages verified skills: ${matchingTech.join(', ')}`);
      } else {
        matchReasons.push(`Calibrated to bridge skills gaps in: ${proj.technologies.slice(0, 2).join(' & ')}`);
      }

      // 3. Readiness check: if student has higher readiness, match harder projects
      const studentReadiness = student?.placementReadiness || 75;
      if (studentReadiness > 70 && proj.difficulty === 'Advanced') {
        score += 20;
        matchReasons.push('Aligned with your advanced placement readiness tier');
      } else if (studentReadiness <= 70 && proj.difficulty === 'Beginner') {
        score += 20;
        matchReasons.push('Foundational project for skill reinforcement');
      }

      return {
        ...proj,
        matchScore: score,
        matchReasons
      };
    });

    // If role filter is given, prioritize matched role, otherwise sort by matchScore
    const roleFiltered = scoredRecommendations.filter(p =>
      !role ||
      p.targetRole.toLowerCase().includes(role.toLowerCase()) ||
      role.toLowerCase().includes(p.targetRole.toLowerCase())
    );

    const finalRecommendations = (roleFiltered.length > 0 ? roleFiltered : scoredRecommendations)
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      role,
      recommendations: finalRecommendations
    });
  } catch (error) {
    console.error('Error fetching project recommendations:', error);
    return NextResponse.json({
      success: true,
      role: 'Software Developer',
      recommendations: ALL_CATALOG_PROJECTS
    });
  }
}
