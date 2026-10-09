import { aiService } from './aiService.js';
import { studentRepository } from '../repositories/studentRepository.js';
import { certificateRepository } from '../repositories/certificateRepository.js';
import { aiCache } from '../cache/aiCache.js';
import { logger } from '../logger.js';

// Curated ATS Action Verbs for Software & Tech
const STRONG_ACTION_VERBS = [
    'architected', 'accelerated', 'automated', 'authored', 'built', 'benchmarked',
    'championed', 'compiled', 'configured', 'constructed', 'containerized', 'customized',
    'debugged', 'decreased', 'delivered', 'deployed', 'designed', 'developed',
    'engineered', 'enhanced', 'eliminated', 'escalated', 'established', 'executed',
    'formulated', 'founded', 'generated', 'guided', 'implemented', 'improved',
    'increased', 'initiated', 'inspected', 'instituted', 'integrated', 'invented',
    'launched', 'led', 'leveraged', 'managed', 'migrated', 'modernized',
    'negotiated', 'optimized', 'orchestrated', 'overhauled', 'pioneered', 'programmed',
    'quantified', 'redesigned', 'reduced', 'refactored', 'resolved', 'restructured',
    'scaled', 'secured', 'simplified', 'solved', 'spearheaded', 'standardized',
    'streamlined', 'strengthened', 'tested', 'transformed', 'upgraded', 'validated'
];

const WEAK_PASSIVE_PHRASES = [
    'worked on', 'helped with', 'responsible for', 'assisted in', 'handled',
    'participated in', 'tried to', 'did', 'was part of', 'involved in', 'supported'
];

const STANDARD_TECH_KEYWORDS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'Java', 'C++', 'Go', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker',
    'Kubernetes', 'AWS', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'Linux',
    'Data Structures', 'Algorithms', 'Microservices', 'Tailwind CSS', 'System Design'
];

export const resumeService = {
    /**
     * Comprehensive ATS Resume Scorer & Diagnostics Engine.
     */
    calculateAtsScore(resumeText = '', jobDescription = '', targetRole = '') {
        const text = String(resumeText || '').trim();
        if (!text || text.length < 50) {
            return {
                overallScore: 25,
                grade: 'Needs Heavy Improvement',
                breakdown: {
                    sections: 20,
                    actionVerbs: 20,
                    metrics: 15,
                    keywords: 25,
                    formatting: 35
                },
                wordCount: text.split(/\s+/).filter(Boolean).length,
                detectedSections: [],
                missingSections: ['Education', 'Experience', 'Projects', 'Skills'],
                matchedKeywords: [],
                missingKeywords: ['Python', 'SQL', 'Git', 'React'],
                quantifiedBulletsCount: 0,
                strongVerbsCount: 0,
                weakPhrasesCount: 0,
                strengths: [],
                improvements: [
                    'Resume content is too short. Provide detailed project bullet points and educational details.',
                    'Add standard sections: Education, Technical Skills, Projects, and Experience.'
                ]
            };
        }

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const lowerText = text.toLowerCase();

        // 1. SECTION DETECTION
        const requiredSections = [
            { name: 'Contact Info', patterns: [/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/] },
            { name: 'Education', patterns: [/education/i, /b\.?tech/i, /bachelor/i, /university/i, /college/i, /degree/i] },
            { name: 'Technical Skills', patterns: [/technical skills/i, /skills/i, /technologies/i, /competencies/i] },
            { name: 'Projects', patterns: [/projects/i, /key projects/i, /academic projects/i] },
            { name: 'Experience / Leadership', patterns: [/experience/i, /work history/i, /internship/i, /employment/i, /leadership/i] }
        ];

        const detectedSections = [];
        const missingSections = [];

        requiredSections.forEach(sec => {
            const isPresent = sec.patterns.some(p => p.test(text));
            if (isPresent) {
                detectedSections.push(sec.name);
            } else {
                missingSections.push(sec.name);
            }
        });

        const sectionScore = Math.round((detectedSections.length / requiredSections.length) * 100);

        // 2. QUANTIFICATION & METRICS ANALYSIS
        // Looks for %, numbers, latency ms, dollar amounts, scale metrics (e.g., 200+, 50%, 10x, 150 users)
        const metricPatterns = [
            /\b\d+\s*%(?!\w)/,
            /\b\d+\s*percent\b/i,
            /\b\d+x\b/i,
            /\$\d+/i,
            /\b\d+(?:,\d+)*(?:\+)?\s*(?:users|clients|requests|qps|ms|seconds|minutes|hours|days|queries|records|stars|commits)\b/i,
            /\b(?:reduced|increased|boosted|improved|accelerated)\s+by\s+\d+/i,
            /\b\d+\+/
        ];

        let quantifiedBulletsCount = 0;
        let totalBulletsCount = 0;

        const explicitBullets = lines.filter(l => /^[-*•–—\d\.]\s+/.test(l));
        const candidateLines = explicitBullets.length > 0 ? explicitBullets : lines.filter(l => l.length > 25);

        candidateLines.forEach(line => {
            totalBulletsCount++;
            if (metricPatterns.some(p => p.test(line))) {
                quantifiedBulletsCount++;
            }
        });

        const effectiveBullets = Math.max(1, totalBulletsCount);
        const metricRatio = quantifiedBulletsCount / effectiveBullets;
        const metricsScore = Math.min(100, Math.round(metricRatio * 140) + (quantifiedBulletsCount >= 3 ? 30 : quantifiedBulletsCount * 10));

        // 3. ACTION VERBS & PASSIVE PHRASE ANALYSIS
        let strongVerbsCount = 0;
        let weakPhrasesCount = 0;

        STRONG_ACTION_VERBS.forEach(verb => {
            const regex = new RegExp(`\\b${verb}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) strongVerbsCount += matches.length;
        });

        WEAK_PASSIVE_PHRASES.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) weakPhrasesCount += matches.length;
        });

        const actionVerbScore = Math.min(100, Math.max(20, Math.round((strongVerbsCount * 12) - (weakPhrasesCount * 8) + 20)));

        // 4. KEYWORD EXTRACTION & RELEVANCE
        const matchedKeywords = [];
        const missingKeywords = [];

        // Check standard keywords
        STANDARD_TECH_KEYWORDS.forEach(kw => {
            const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(text)) {
                matchedKeywords.push(kw);
            }
        });

        // If job description provided, extract job-specific keywords
        if (jobDescription && jobDescription.length > 20) {
            const jobWords = jobDescription.split(/[\s,.;:()]+/).filter(w => w.length > 2);
            STANDARD_TECH_KEYWORDS.forEach(kw => {
                const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                if (kwRegex.test(jobDescription) && !matchedKeywords.includes(kw)) {
                    if (!missingKeywords.includes(kw)) missingKeywords.push(kw);
                }
            });
        }

        if (missingKeywords.length === 0) {
            STANDARD_TECH_KEYWORDS.slice(0, 8).forEach(kw => {
                if (!matchedKeywords.includes(kw) && missingKeywords.length < 4) {
                    missingKeywords.push(kw);
                }
            });
        }

        const keywordRatio = matchedKeywords.length / Math.max(1, (matchedKeywords.length + missingKeywords.length));
        const keywordScore = Math.min(100, Math.round(keywordRatio * 70 + (matchedKeywords.length >= 6 ? 30 : matchedKeywords.length * 5)));

        // 5. FORMATTING & READABILITY SCORE
        let formattingScore = 90;
        if (!text.includes('@')) formattingScore -= 20;
        if (wordCount < 100) formattingScore -= 15;
        if (wordCount > 1200) formattingScore -= 10;
        if (lines.length < 8) formattingScore -= 15;
        formattingScore = Math.max(30, formattingScore);

        // 6. OVERALL COMPOSITE ATS SCORE
        // Weighting: Sections (25%) + Keywords (25%) + Metrics (25%) + Verbs (15%) + Formatting (10%)
        const overallScore = Math.min(99, Math.max(20, Math.round(
            (sectionScore * 0.25) +
            (keywordScore * 0.25) +
            (metricsScore * 0.25) +
            (actionVerbScore * 0.15) +
            (formattingScore * 0.10)
        )));

        // Determine tier
        let grade = 'Strong ATS Profile';
        if (overallScore < 60) grade = 'Needs Critical Revisions';
        else if (overallScore < 75) grade = 'Moderate ATS Compliance';
        else if (overallScore >= 88) grade = 'Exceptional ATS Compliance';

        // 7. ACTIONABLE STRENGTHS & IMPROVEMENT CHECKLIST
        const strengths = [];
        const improvements = [];

        if (sectionScore >= 80) strengths.push('Clear, standard resume section hierarchy identified.');
        if (strongVerbsCount >= 5) strengths.push(`Strong vocabulary: detected ${strongVerbsCount} proactive engineering action verbs.`);
        if (quantifiedBulletsCount >= 2) strengths.push(`Evidence of measurable impact: ${quantifiedBulletsCount} quantified metrics found.`);
        if (matchedKeywords.length >= 5) strengths.push(`Solid technical footprint with ${matchedKeywords.length} industry keywords.`);

        if (missingSections.length > 0) {
            improvements.push(`Add missing sections to ensure parseability: ${missingSections.join(', ')}.`);
        }
        if (quantifiedBulletsCount < 3) {
            improvements.push('Add quantified metrics to your project bullets (e.g. "reduced latency by 30%", "served 1,000+ requests").');
        }
        if (weakPhrasesCount > 0) {
            improvements.push(`Eliminate passive language (${weakPhrasesCount} occurrences found). Replace 'worked on' with 'architected', 'spearheaded', or 'deployed'.`);
        }
        if (missingKeywords.length > 0) {
            improvements.push(`Integrate in-demand target keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
        }

        return {
            overallScore,
            grade,
            breakdown: {
                sections: sectionScore,
                keywords: keywordScore,
                metrics: metricsScore,
                actionVerbs: actionVerbScore,
                formatting: formattingScore
            },
            wordCount,
            detectedSections,
            missingSections,
            matchedKeywords,
            missingKeywords,
            quantifiedBulletsCount,
            strongVerbsCount,
            weakPhrasesCount,
            strengths: strengths.length > 0 ? strengths : ['Basic technical candidate profile detected.'],
            improvements: improvements.length > 0 ? improvements : ['Maintain clear metric quantification across all recent experience.']
        };
    },

    /**
     * AI-Powered Action Verb & Metric Bullet Rewriter.
     * Uses the XYZ / STAR formula: "Accomplished [X] measured by [Y] by doing [Z]".
     */
    async rewriteBulletPoint(bulletText = '', options = {}) {
        const rawBullet = String(bulletText || '').trim();
        if (!rawBullet) {
            throw new Error('Please provide a bullet point to rewrite.');
        }

        const roleContext = options.role || 'Software Engineer';
        const techContext = options.technologies || '';

        const { data } = await aiCache.wrap('bullet_rewrite', { rawBullet, roleContext, techContext }, async () => {
            // Check if Gemini API is available for generative enhancements
            if (process.env.GEMINI_API_KEY) {
                try {
                    const model = aiService.getModel(options?.model);
                    const prompt = `
                    You are an expert technical resume coach and ATS optimization specialist.
                    Rewrite the following resume bullet point using Google's XYZ formula:
                    "Accomplished [X], as measured by [Y], by doing [Z]" using powerful action verbs and quantifiable metrics.

                    Context: Role = ${roleContext}, Tech Stack = ${techContext}
                    Original Bullet: "${rawBullet}"

                    Return strictly a valid JSON object without markdown blocks:
                    {
                      "metricDriven": "string (Focus on measurable impact %, speed, scale, or user volume)",
                      "technicalArchitecture": "string (Focus on system design, robust protocols, and implementation specifics)",
                      "crispExecutive": "string (Punchy, direct, under 20 words for quick scanning)",
                      "improvementAnalysis": "string (Brief explanation of what was enhanced)"
                    }
                `;
                    const result = await model.generateContent(prompt);
                    let responseText = result.response.text();
                    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(responseText);

                    return {
                        original: rawBullet,
                        rewrittenBullets: [
                            {
                                type: 'Metric-Driven & Quantified',
                                style: 'Results & Impact',
                                bullet: parsed.metricDriven,
                                formula: 'Accomplished [X] measured by [Y] by doing [Z]'
                            },
                            {
                                type: 'Technical & Architecture-Focused',
                                style: 'System Design & Engineering',
                                bullet: parsed.technicalArchitecture,
                                formula: 'Engineered [X] leveraging [Z] resulting in [Y]'
                            },
                            {
                                type: 'Crisp & Executive',
                                style: 'Concise & Action-Oriented',
                                bullet: parsed.crispExecutive,
                                formula: 'Direct Action Verb + Scope + Result'
                            }
                        ],
                        improvementAnalysis: parsed.improvementAnalysis || 'Transformed passive statement into high-impact XYZ structured achievements.'
                    };
                } catch (err) {
                    logger.warn('[resumeService] Gemini AI rewrite fallback to heuristic rule engine:', { error: err.message });
                }
            }

            // Heuristic Rule-Based XYZ / STAR Enhancer Fallback
            return this.heuristicRewrite(rawBullet, roleContext, techContext);
        }, {
            model: options?.model || 'gemini-2.0-flash',
            ttl: 86400,
            forceRefresh: options?.forceRefresh,
            skipCache: options?.skipCache
        });

        return data;
    },

    heuristicRewrite(rawBullet, role = 'Software Engineer', tech = '') {
        const cleaned = rawBullet.replace(/^[-*•–—\d\.]\s*/, '').trim();

        // Extract key verbs and nouns
        let actionSubject = 'web application services';
        if (/api|endpoint|backend|server/i.test(cleaned)) actionSubject = 'scalable RESTful microservice APIs';
        else if (/database|sql|query|postgres|mongo/i.test(cleaned)) actionSubject = 'high-throughput database queries and schemas';
        else if (/ui|frontend|react|css|component/i.test(cleaned)) actionSubject = 'responsive client-side UI components';
        else if (/auth|login|security|jwt/i.test(cleaned)) actionSubject = 'tamper-proof JWT authentication pipelines';
        else if (/test|pipeline|ci|cd|docker/i.test(cleaned)) actionSubject = 'automated CI/CD container build workflows';

        const metricVersion = `Architected and deployed ${actionSubject}, boosting execution throughput by 38% and reducing server latency from 450ms to 180ms across 1,500+ active sessions.`;
        const techVersion = `Engineered robust ${actionSubject} utilizing modern asynchronous design patterns and strict unit test coverage, eliminating slow database bottlenecks.`;
        const crispVersion = `Spearheaded deployment of ${actionSubject}, improving responsiveness by 35% and elevating system reliability.`;

        return {
            original: rawBullet,
            rewrittenBullets: [
                {
                    type: 'Metric-Driven & Quantified',
                    style: 'Results & Impact',
                    bullet: metricVersion,
                    formula: 'Accomplished [X] measured by [Y] by doing [Z]'
                },
                {
                    type: 'Technical & Architecture-Focused',
                    style: 'System Design & Engineering',
                    bullet: techVersion,
                    formula: 'Engineered [X] leveraging [Z] resulting in [Y]'
                },
                {
                    type: 'Crisp & Executive',
                    style: 'Concise & Action-Oriented',
                    bullet: crispVersion,
                    formula: 'Direct Action Verb + Scope + Result'
                }
            ],
            improvementAnalysis: 'Replaced passive phrasing with proactive technical verbs (Architected, Engineered, Spearheaded) and appended quantifiable performance benchmarks.'
        };
    },

    /**
     * Builds structured ATS resume template pre-filled with candidate's verified skills & certificates.
     */
    async buildResumeFromProfile(studentId) {
        const student = await studentRepository.findById(studentId);
        const certificates = await certificateRepository.findByStudentId(studentId);

        const verifiedSkills = (student?.skills || [])
            .filter(s => s.status === 'Verified')
            .map(s => s.skillName);

        const otherSkills = (student?.skills || [])
            .filter(s => s.status !== 'Verified')
            .map(s => s.skillName);

        return {
            personalInfo: {
                fullName: student?.fullName || 'Alex Rivera',
                email: student?.email || 'alex.rivera@student.skill2hire.com',
                phone: student?.phone || '+91 98765 43210',
                location: student?.location || 'Bangalore, India',
                linkedin: 'https://linkedin.com/in/alex-rivera',
                github: 'https://github.com/alex-rivera',
                portfolio: 'https://alexrivera.dev'
            },
            summary: student?.bio || 'Forward-thinking Software Engineering student with verified proficiency in full-stack architecture, algorithm design, and cloud services. Proven track record building robust applications with high placement readiness.',
            education: [
                {
                    institution: student?.collegeName || 'Apex University of Engineering',
                    degree: student?.degree || 'B.Tech in Computer Science & Engineering',
                    graduationYear: student?.graduationYear || 2026,
                    cgpa: student?.cgpa ? `${student.cgpa} / 10.0` : '8.85 / 10.0',
                    location: 'Bangalore, India'
                }
            ],
            skills: {
                verified: verifiedSkills.length > 0 ? verifiedSkills : ['Python 3', 'React.js', 'Data Structures & Algorithms', 'SQL & Database Design'],
                additional: otherSkills.length > 0 ? otherSkills : ['Docker', 'Git', 'Linux CLI', 'Tailwind CSS']
            },
            experience: [
                {
                    role: 'Software Engineering Intern',
                    company: 'TechNova Cloud Labs',
                    location: 'Remote',
                    startDate: 'May 2025',
                    endDate: 'August 2025',
                    bullets: [
                        'Architected asynchronous task processing service using Python and Redis, reducing queue latency by 42%.',
                        'Engineered RESTful endpoints in Next.js and PostgreSQL, supporting 5,000+ daily student platform interactions.',
                        'Integrated automated CI/CD validation workflows with GitHub Actions, eliminating integration regressions.'
                    ]
                }
            ],
            projects: [
                {
                    title: 'Distributed Task Queue & Cache Manager',
                    technologies: 'Python, Redis, PostgreSQL, Docker',
                    link: 'https://github.com/alex-rivera/distributed-task-queue',
                    bullets: [
                        'Constructed distributed job queue handling 1,200 requests/sec with exponential backoff and dead-letter fault tolerance.',
                        'Containerized service using Docker and multi-stage builds, cutting deployment artifact size by 45%.'
                    ]
                },
                {
                    title: 'Skill2Job.ai Placement Match Engine',
                    technologies: 'Next.js, Tailwind CSS, PostgreSQL, Web APIs',
                    link: 'https://github.com/alex-rivera/skill2job-matcher',
                    bullets: [
                        'Implemented cryptographic skill passport verification system with sub-50ms HMAC-SHA256 signature validation.',
                        'Developed interactive job readiness gauge and radar charts visualizing candidate skill gap diagnostics.'
                    ]
                }
            ],
            certifications: certificates.map(c => ({
                certificateNumber: c.certificateNumber,
                skillName: c.skillName,
                level: c.level,
                score: `${c.score}%`,
                issuedDate: c.issuedDate,
                verificationUrl: c.verificationUrl
            }))
        };
    }
};
