import { prisma } from '../prisma';

const mockCourses = [
    {
        id: 'crs_python',
        title: 'Python for Placement & Core Development',
        description: 'Comprehensive Python programming from fundamentals to object-oriented programming and standard libraries.',
        instructor: 'Dr. Jane Chen',
        durationHours: 24,
        category: 'Programming',
        tags: ['Python', 'Backend', 'Foundations'],
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
        category: 'Algorithms',
        tags: ['DSA', 'Algorithms', 'Placement'],
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
        category: 'Web Development',
        tags: ['React', 'Next.js', 'Full Stack'],
        lessons: [
            { id: 'les_5', title: 'Component Architecture & State Management', durationMinutes: 55 }
        ]
    }
];

export const courseRepository = {
    async findAll() {
        try {
            return await prisma.course.findMany({ include: { lessons: true } });
        } catch (e) {
            console.warn('[courseRepository] DB offline, using mock courses:', e.message);
            return mockCourses;
        }
    },
    async findById(id) {
        try {
            return await prisma.course.findUnique({ where: { id }, include: { lessons: true } });
        } catch (e) {
            return mockCourses.find(c => c.id === id) || mockCourses[0];
        }
    }
};
