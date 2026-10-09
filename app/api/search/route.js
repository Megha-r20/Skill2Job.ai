import { NextResponse } from 'next/server';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { platformSearchQuerySchema, validateQueryParams } from '@/lib/validations';

export const TECHNICAL_SKILLS = [
    {
        id: 'sk_python',
        name: 'Python',
        category: 'Programming',
        description: 'Core syntax, OOP, decorators, generators, list comprehensions, and placement coding interview patterns.',
        industryDemandPercent: 96,
        icon: '🐍'
    },
    {
        id: 'sk_dsa',
        name: 'Data Structures',
        category: 'Data Structures',
        description: 'Arrays, Binary Trees, Graphs, Dynamic Programming, Two-Pointers, and Big-O computational complexity.',
        industryDemandPercent: 98,
        icon: '🌳'
    },
    {
        id: 'sk_sql',
        name: 'SQL Databases',
        category: 'Databases',
        description: 'Complex JOINs, window functions, indexing, normalization, transaction isolation, and query optimization.',
        industryDemandPercent: 92,
        icon: '🗄️'
    },
    {
        id: 'sk_react',
        name: 'React & Frontend',
        category: 'Web Development',
        description: 'Component architecture, hooks, state management, SSR, Next.js App Router, and responsive interfaces.',
        industryDemandPercent: 94,
        icon: '⚛️'
    },
    {
        id: 'sk_java',
        name: 'Java Enterprise',
        category: 'Programming',
        description: 'Java 17/21 features, multithreading, JVM memory management, Spring Boot REST APIs, and microservices.',
        industryDemandPercent: 90,
        icon: '☕'
    },
    {
        id: 'sk_cpp',
        name: 'C++ Competitive Coding',
        category: 'Programming',
        description: 'STL containers, algorithms, memory pointers, RAII, fast I/O, and algorithmic contest challenges.',
        industryDemandPercent: 88,
        icon: '⚡'
    },
    {
        id: 'sk_aws',
        name: 'AWS Cloud Architecture',
        category: 'Cloud',
        description: 'EC2, S3, Lambda serverless, IAM role policies, DynamoDB, API Gateway, and CloudFront CDN.',
        industryDemandPercent: 91,
        icon: '☁️'
    },
    {
        id: 'sk_aiml',
        name: 'Machine Learning & AI',
        category: 'AI/ML',
        description: 'Supervised learning, deep neural networks, transformer architectures, vector embeddings, and PyTorch.',
        industryDemandPercent: 95,
        icon: '🤖'
    },
    {
        id: 'sk_node',
        name: 'Node.js & Backend',
        category: 'Web Development',
        description: 'Event-loop concurrency, Express & Fastify APIs, WebSocket real-time feeds, and database ORMs.',
        industryDemandPercent: 89,
        icon: '🟢'
    },
    {
        id: 'sk_soft',
        name: 'Aptitude & Soft Skills',
        category: 'Soft Skills',
        description: 'Quantitative aptitude, logical reasoning, data interpretation, and technical interview communication.',
        industryDemandPercent: 86,
        icon: '🎯'
    }
];

export const LEARNING_VIDEOS = [
    {
        id: 'vid_1',
        title: 'Python Memory Model, Pointers & GIL Explained',
        skill: 'Python',
        duration: '28 mins',
        instructor: 'Dr. Jane Chen',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
        url: '/courses/crs_python/learn'
    },
    {
        id: 'vid_2',
        title: 'Mastering Dynamic Programming: Knapsack & Grid Paths',
        skill: 'DSA',
        duration: '42 mins',
        instructor: 'Prof. Marcus Vance',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
        url: '/courses/crs_dsa/learn'
    },
    {
        id: 'vid_3',
        title: 'SQL Window Functions & Advanced Aggregation Masterclass',
        skill: 'SQL',
        duration: '35 mins',
        instructor: 'Sarah Jenkins',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=80',
        url: '/courses/crs_fullstack/learn'
    }
];

export const VERIFIED_COMPANIES = [
    {
        id: 'comp_1',
        name: 'TechNova Solutions',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
        industry: 'Enterprise Software & Cloud',
        location: 'Bangalore / Remote',
        openPositions: 8
    },
    {
        id: 'comp_2',
        name: 'CognitiveScale AI',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
        industry: 'Artificial Intelligence',
        location: 'Remote / US & India',
        openPositions: 5
    },
    {
        id: 'comp_3',
        name: 'Apex Cloud Digital',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
        industry: 'SaaS Platform Engineering',
        location: 'Hyderabad, India',
        openPositions: 6
    }
];

/**
 * GET /api/search
 * Platform-wide search across jobs, courses, technical skills, and companies.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const queryVal = validateQueryParams(platformSearchQuerySchema, request);
        if (!queryVal.success) return queryVal.errorResponse;
        const query = (queryVal.data.q || queryVal.data.query || '').trim();
        const category = queryVal.data.category || 'ALL';

        let jobs = await jobRepository.search({ query });
        let courses = await courseRepository.findAll();
        let skills = TECHNICAL_SKILLS;
        let videos = LEARNING_VIDEOS;
        let companies = VERIFIED_COMPANIES;

        if (query) {
            const qLower = query.toLowerCase();
            courses = courses.filter(c => 
                c.title?.toLowerCase().includes(qLower) || 
                c.description?.toLowerCase().includes(qLower) ||
                c.tags?.some(t => t.toLowerCase().includes(qLower))
            );
            skills = skills.filter(s => 
                s.name.toLowerCase().includes(qLower) || 
                s.category.toLowerCase().includes(qLower) ||
                s.description.toLowerCase().includes(qLower)
            );
            videos = videos.filter(v => 
                v.title.toLowerCase().includes(qLower) || 
                v.skill.toLowerCase().includes(qLower)
            );
            companies = companies.filter(c => 
                c.name.toLowerCase().includes(qLower) || 
                c.industry.toLowerCase().includes(qLower)
            );
        }

        return NextResponse.json({
            success: true,
            query,
            category,
            jobs: jobs.slice(0, 10),
            courses: courses.slice(0, 10),
            skills,
            videos,
            companies,
            totalResults: jobs.length + courses.length + skills.length + videos.length + companies.length
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
