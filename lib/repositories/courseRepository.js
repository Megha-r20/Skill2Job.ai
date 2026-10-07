import { prisma } from '../prisma';

const mockCourses = [
    {
        id: 'crs_python',
        title: 'Python for Placement & Core Development',
        description: 'Comprehensive Python programming from fundamentals to object-oriented programming and standard libraries.',
        instructor: 'Dr. Jane Chen',
        durationHours: 24,
        duration: '24 Hours',
        level: 'Beginner to Intermediate',
        rating: 4.9,
        category: 'Programming',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        tags: ['Python', 'Backend', 'Foundations'],
        targetSkills: ['Python', 'OOP', 'Data Structures', 'Backend'],
        lessons: [
            { id: 'les_1', title: 'Python Syntax & Memory Model', durationMinutes: 45 },
            { id: 'les_2', title: 'Data Structures: Lists, Dictionaries, Sets', durationMinutes: 60 }
        ]
    },
    {
        id: 'crs_dsa',
        title: 'Data Structures & Algorithms Masterclass',
        description: 'Crack technical placement interviews with high-yield algorithms, trees, graphs, and dynamic programming.',
        instructor: 'Prof. Marcus Vance',
        durationHours: 36,
        duration: '36 Hours',
        level: 'Intermediate',
        rating: 4.9,
        category: 'Data Structures',
        thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc13c7a3607?w=800&auto=format&fit=crop&q=80',
        tags: ['DSA', 'Algorithms', 'Placement'],
        targetSkills: ['DSA', 'Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
        lessons: [
            { id: 'les_3', title: 'Arrays, Two-Pointers & Sliding Window', durationMinutes: 50 },
            { id: 'les_4', title: 'Trees & Graph Traversal', durationMinutes: 75 }
        ]
    },
    {
        id: 'crs_fullstack',
        title: 'Modern Full-Stack Web Development',
        description: 'Build production-ready web applications with React, Next.js, Node.js, and SQL databases.',
        instructor: 'Sarah Jenkins',
        durationHours: 40,
        duration: '40 Hours',
        level: 'Intermediate',
        rating: 4.8,
        category: 'Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        tags: ['React', 'Next.js', 'Full Stack'],
        targetSkills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Full Stack'],
        lessons: [
            { id: 'les_5', title: 'Component Architecture & State Management', durationMinutes: 55 }
        ]
    },
    {
        id: 'crs_sql',
        title: 'SQL & Relational Database Architecture',
        description: 'Design robust schemas, complex analytical queries, index structures, and high-performance relational storage.',
        instructor: 'David Miller',
        durationHours: 20,
        duration: '20 Hours',
        level: 'Beginner to Intermediate',
        rating: 4.9,
        category: 'Databases',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        tags: ['SQL', 'PostgreSQL', 'Databases'],
        targetSkills: ['SQL', 'PostgreSQL', 'Database Design', 'Indexing'],
        lessons: [
            { id: 'les_6', title: 'Relational Schemas & Foreign Keys', durationMinutes: 45 },
            { id: 'les_7', title: 'Joins, Aggregations & Window Functions', durationMinutes: 60 }
        ]
    },
    {
        id: 'crs_cloud',
        title: 'Cloud Fundamentals (AWS & Cloud Architecture)',
        description: 'Master core cloud computing concepts, virtualization, Amazon Web Services (EC2, S3, IAM), and scalable infrastructure.',
        instructor: 'Alexandria Reed',
        durationHours: 28,
        duration: '28 Hours',
        level: 'Intermediate',
        rating: 4.8,
        category: 'Cloud',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        tags: ['AWS', 'Cloud', 'DevOps'],
        targetSkills: ['AWS', 'EC2', 'S3', 'Cloud Architecture'],
        lessons: [
            { id: 'les_8', title: 'Cloud Models: IaaS, PaaS, SaaS & AWS Overview', durationMinutes: 40 },
            { id: 'les_9', title: 'Virtual Private Cloud (VPC) & Security', durationMinutes: 55 }
        ]
    },
    {
        id: 'crs_cpp',
        title: 'C++ Systems & Memory Mastery',
        description: 'Low-level pointer mechanics, stack vs heap allocation, RAII, STL containers, and high-performance algorithmic execution.',
        instructor: 'Prof. Viktor Hoffman',
        durationHours: 32,
        duration: '32 Hours',
        level: 'Advanced',
        rating: 4.8,
        category: 'Programming',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        tags: ['C++', 'Systems', 'Memory'],
        targetSkills: ['C++', 'Pointers', 'STL', 'Systems Programming'],
        lessons: [
            { id: 'les_10', title: 'Pointers, References & Heap Allocation', durationMinutes: 50 },
            { id: 'les_11', title: 'STL Vector, Map & Algorithmic Patterns', durationMinutes: 65 }
        ]
    }
];

function formatCourse(course) {
    if (!course) return null;
    return {
        ...course,
        level: course.level || 'Intermediate',
        rating: course.rating || 4.9,
        duration: course.duration || (course.durationHours ? `${course.durationHours} Hours` : '24 Hours'),
        thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c7a3607?w=800&auto=format&fit=crop&q=80',
        targetSkills: course.targetSkills || course.tags || [course.category || 'Tech']
    };
}

export const courseRepository = {
    async findAll() {
        try {
            const courses = await prisma.course.findMany({ include: { lessons: true } });
            if (courses && courses.length > 0) {
                return courses.map(formatCourse);
            }
            return mockCourses.map(formatCourse);
        } catch (e) {
            console.warn('[courseRepository] DB offline, using mock courses:', e.message);
            return mockCourses.map(formatCourse);
        }
    },
    async findById(id) {
        try {
            const course = await prisma.course.findUnique({ where: { id }, include: { lessons: true } });
            if (course) return formatCourse(course);
            const found = mockCourses.find(c => c.id === id) || mockCourses[0];
            return formatCourse(found);
        } catch (e) {
            const found = mockCourses.find(c => c.id === id) || mockCourses[0];
            return formatCourse(found);
        }
    }
};
