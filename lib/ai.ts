import { aiService } from './services/aiService';

export function calculateJobMatch(studentId: any, targetJobId?: any): any {
  return {
    matchPercentage: 88,
    strengths: ["Strong frontend foundation in React & TypeScript", "Full-stack Node.js project experience", "Active problem-solving profile"],
    recommendations: ["Complete Advanced Next.js Architecture course", "Practice system design interview prep"],
    skillGap: ["GraphQL", "Docker"],
    readinessScore: 85,
    actionableFeedback: [
      "Great skill alignment with current industry tech stack.",
      "Focus on containerization (Docker) to boost placement score."
    ]
  };
}

export async function analyzeResume(resumeText: string, studentId?: any): Promise<any> {
  return await aiService.analyzeResume(resumeText);
}

export function generateSkillGapAnalysis(studentId: any, targetJobId?: any): any {
  return {
    studentId,
    targetJobId,
    analyzedAt: new Date().toISOString(),
    matchPercentage: 84,
    currentSkills: [
      { name: "JavaScript", proficiency: "Advanced", verified: true },
      { name: "React", proficiency: "Intermediate", verified: true },
      { name: "Node.js", proficiency: "Intermediate", verified: false }
    ],
    missingSkills: [
      { name: "Docker", priority: "High", estimatedHours: 12, recommendedCourse: "Container Fundamentals" },
      { name: "PostgreSQL Optimization", priority: "Medium", estimatedHours: 8, recommendedCourse: "Database Mastery" }
    ],
    overallReadiness: 82,
    radarChartData: [
      { subject: 'Frontend', A: 90, B: 85, fullMark: 100 },
      { subject: 'Backend', A: 80, B: 90, fullMark: 100 },
      { subject: 'Database', A: 75, B: 80, fullMark: 100 },
      { subject: 'DevOps', A: 60, B: 75, fullMark: 100 },
      { subject: 'Problem Solving', A: 88, B: 85, fullMark: 100 }
    ]
  };
}

export function calculatePlacementProbability(studentId: any): any {
  return {
    probability: 86,
    tier: "High Placement Likelihood",
    factors: [
      { factor: "CGPA (>8.0)", impact: "+15%", status: "Strong" },
      { factor: "Verified Skill Badges", impact: "+25%", status: "Strong" },
      { factor: "Resume Score (88/100)", impact: "+20%", status: "Good" },
      { factor: "Assessment Performance", impact: "+18%", status: "Good" },
      { factor: "Mock Interview Score", impact: "+8%", status: "Needs Improvement" }
    ],
    growthSuggestions: [
      "Participate in 2 mock AI interviews this week",
      "Upload verified project certificates to increase recruiter visibility"
    ]
  };
}

export function analyzeCollegeCurriculum(collegeId: any): any {
  return {
    collegeId,
    industryAlignmentScore: 82,
    syllabusMatchRate: "78%",
    topEmergingSkillGaps: ["Cloud Native DevOps", "Generative AI API Integration", "System Architecture Design"],
    recommendations: [
      "Introduce 4-week Cloud Native elective in 6th semester",
      "Integrate practical hands-on capstone project review with enterprise mentors"
    ]
  };
}

export function calculateIndustrySkillDemand(): any[] {
  return [
    { skillName: "Full-Stack Development (React/Next.js)", demandPercent: 94, demandLevel: "Critical", category: "Web Development", growthYearOverYear: "+28%" },
    { skillName: "Generative AI & LLM Engineering", demandPercent: 91, demandLevel: "Critical", category: "Artificial Intelligence", growthYearOverYear: "+45%" },
    { skillName: "Backend & Microservices (Node/Go/Python)", demandPercent: 88, demandLevel: "High", category: "Backend Engineering", growthYearOverYear: "+20%" },
    { skillName: "Cloud & DevOps (Docker, Kubernetes, AWS)", demandPercent: 85, demandLevel: "High", category: "DevOps & Cloud", growthYearOverYear: "+24%" },
    { skillName: "Data Engineering & PostgreSQL", demandPercent: 79, demandLevel: "Medium", category: "Data Science", growthYearOverYear: "+15%" }
  ];
}

export function generateCareerPathRecommendations(studentId: any): any[] {
  return [
    { title: "Full-Stack AI Developer", suitabilityScore: 92, avgSalary: "$85,000 - $120,000", matchReason: "Strong React, TypeScript, and Node.js foundation with AI interest" },
    { title: "Frontend Engineering Specialist", suitabilityScore: 88, avgSalary: "$75,000 - $110,000", matchReason: "Excellent UI component mastery and CSS design skills" },
    { title: "Cloud Backend Engineer", suitabilityScore: 81, avgSalary: "$80,000 - $115,000", matchReason: "Good Node.js and API knowledge; needs Docker / AWS expansion" }
  ];
}

export function analyzeCourseEngagement(studentId: any): any {
  return {
    studentId,
    completionRate: 85,
    weeklyStudyHours: 12.5,
    activeStreakDays: 14,
    learningPace: "Optimal",
    quizAverageScore: 88.5
  };
}

export function generateAssessmentFeedback(assessmentId: any, score: number, answers?: any): any {
  return {
    assessmentId,
    score,
    passed: score >= 70,
    performanceTier: score >= 85 ? "Exemplary" : score >= 70 ? "Competent" : "Needs Review",
    strengths: ["Strong understanding of core language fundamentals", "Efficient algorithmic approach"],
    areasToImprove: score < 70 ? ["Review edge cases and memory optimization"] : ["Master advanced asynchronous patterns"],
    recommendedNextStep: "Proceed to next level assessment"
  };
}

export function evaluateInterviewResponse(questionText: string, answerText: string, category: string = 'Technical'): any {
  const answerLength = (answerText || '').trim().length;
  const score = answerLength > 150 ? 88 : answerLength > 50 ? 75 : 60;

  return {
    score,
    feedback: score >= 80 
      ? "Clear, structured, and articulates core technical principles effectively."
      : "Good foundational answer. Consider adding concrete code examples or STAR format.",
    clarityScore: score >= 80 ? 90 : 70,
    relevanceScore: 85,
    technicalAccuracy: score,
    keyTakeaways: [
      "Clear explanation of key concept",
      "Include a real-world scenario to strengthen response"
    ]
  };
}

export function matchTalentBySkillsQuery(query: string, options?: any): any {
  return [
    { candidateId: "std_1", name: "Alex Rivera", matchScore: 94, skills: ["React", "TypeScript", "Node.js"], college: "Apex University" },
    { candidateId: "std_2", name: "Samantha Chen", matchScore: 89, skills: ["Python", "Machine Learning", "SQL"], college: "Stanford University" },
    { candidateId: "std_3", name: "Marcus Vance", matchScore: 82, skills: ["React", "Node.js", "PostgreSQL"], college: "MIT" }
  ];
}

export function getNextBestAction(studentId: any): any {
  return {
    studentId,
    actionTitle: "Complete Next.js Architecture Assessment",
    actionType: "ASSESSMENT",
    estimatedMinutes: 20,
    impact: "+5% Placement Readiness Score",
    targetUrl: "/assessments/nextjs-advanced"
  };
}

export function calculateComprehensiveJobReadiness(studentId: any, jobId?: any): any {
  return {
    studentId,
    overallReadinessScore: 86,
    readinessTier: "Placement Ready",
    skillReadiness: 88,
    academicReadiness: 85,
    interviewReadiness: 80,
    projectPortfolioScore: 90,
    breakdown: [
      { category: "Technical Skills", score: 88, weight: "40%" },
      { category: "Academic CGPA", score: 85, weight: "20%" },
      { category: "Project Quality", score: 90, weight: "25%" },
      { category: "Interview Mock Score", score: 80, weight: "15%" }
    ]
  };
}

export function getCareerRecommendations(studentId: any): any {
  return {
    recommendedRoles: generateCareerPathRecommendations(studentId),
    topSkillsToLearn: ["Docker", "GraphQL", "System Design"],
    nextMilestone: "Complete Senior Developer Mock Assessment"
  };
}

export function generatePersonalizedRoadmap(studentId: any, jobId?: any, targetRole?: any): any {
  return {
    studentId,
    targetRole: targetRole || "Full-Stack Software Engineer",
    totalWeeks: 6,
    currentWeek: 2,
    progressPercent: 33,
    milestones: [
      { week: 1, title: "TypeScript Deep Dive & Design Patterns", status: "COMPLETED" },
      { week: 2, title: "Next.js App Router & Server Components", status: "IN_PROGRESS" },
      { week: 3, title: "PostgreSQL & Prisma ORM Optimization", status: "UPCOMING" },
      { week: 4, title: "Containerization with Docker", status: "UPCOMING" },
      { week: 5, title: "System Design & Microservices", status: "UPCOMING" },
      { week: 6, title: "Mock Technical Interview & Resume Polish", status: "UPCOMING" }
    ]
  };
}

export function explainWhyNotEligible(studentId: any, jobId?: any): any {
  return {
    eligible: false,
    reasons: [
      "Target job requires minimum CGPA of 8.5 (Current CGPA: 8.2)",
      "Missing verified skill badge: Docker Containerization"
    ],
    recommendedActions: [
      "Complete 10-hour Docker Certification Course on Skill2Job.ai",
      "Request CGPA eligibility waiver from campus placement office"
    ]
  };
}

export async function extractSkillsFromJobDescription(text: string): Promise<any> {
  return await aiService.analyzeJobDescription(text);
}
