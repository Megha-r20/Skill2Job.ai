import { prisma } from '../prisma.js';

// Pre-seeded authentic mock placement drives
const mockPlacementDrives = [
    {
        id: 'drive_1',
        collegeId: 'col_1',
        companyName: 'Google Cloud Platform',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
        title: 'Cloud Systems Engineer & Distributed Architecture',
        departments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
        minCgpa: 8.0,
        batchYear: '2026',
        packageCtc: '₹18,00,000 - ₹24,00,000 / year',
        openings: 15,
        mode: 'Hybrid',
        location: 'Bangalore / On-Campus Lab 3',
        registrationDeadline: '2026-10-20',
        assessmentDate: '2026-10-22',
        driveDate: '2026-10-25',
        status: 'Registration Open',
        eligibleStudentsCount: 142,
        registeredStudentsCount: 118,
        shortlistedCount: 45,
        selectedCount: 0,
        contactPerson: 'Sarah Jenkins (University Relations)',
        notes: 'Pre-placement talk on distributed systems scheduled for Oct 21.',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
        id: 'drive_2',
        collegeId: 'col_1',
        companyName: 'Microsoft India',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        title: 'Software Development Engineer - Core Platform',
        departments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Electronics & Communication'],
        minCgpa: 8.0,
        batchYear: '2026',
        packageCtc: '₹16,00,000 - ₹22,00,000 / year',
        openings: 20,
        mode: 'On-Campus Lab',
        location: 'Main Auditorium & Turing Computing Center',
        registrationDeadline: '2026-10-14',
        assessmentDate: '2026-10-16',
        driveDate: '2026-10-18',
        status: 'Assessment Ongoing',
        eligibleStudentsCount: 180,
        registeredStudentsCount: 165,
        shortlistedCount: 62,
        selectedCount: 0,
        contactPerson: 'David Raman (Lead Campus Recruiter)',
        notes: 'Online proctored coding assessment via Skill2Job compiler environment.',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
        id: 'drive_3',
        collegeId: 'col_1',
        companyName: 'TechNova Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80',
        title: 'Full Stack Engineer & Microservices Developer',
        departments: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science', 'Electronics & Communication', 'Mechanical Engineering'],
        minCgpa: 7.0,
        batchYear: '2026',
        packageCtc: '₹10,50,000 - ₹14,00,000 / year',
        openings: 35,
        mode: 'Virtual',
        location: 'Virtual Interview Rooms (Google Meet)',
        registrationDeadline: '2026-10-06',
        assessmentDate: '2026-10-08',
        driveDate: '2026-10-12',
        status: 'Interviews',
        eligibleStudentsCount: 230,
        registeredStudentsCount: 198,
        shortlistedCount: 54,
        selectedCount: 18,
        contactPerson: 'Priya Nambiar (Talent Partner)',
        notes: 'Round 2 technical interviews in progress.',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
        id: 'drive_4',
        collegeId: 'col_1',
        companyName: 'CognitiveScale AI',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        title: 'Machine Learning Associate & LLM Operations',
        departments: ['Computer Science & Engineering', 'Artificial Intelligence & Data Science'],
        minCgpa: 7.5,
        batchYear: '2026',
        packageCtc: '₹14,00,000 - ₹19,00,000 / year',
        openings: 12,
        mode: 'On-Campus Lab',
        location: 'Ada Lovelace AI Center',
        registrationDeadline: '2026-10-24',
        assessmentDate: '2026-10-26',
        driveDate: '2026-10-28',
        status: 'Registration Open',
        eligibleStudentsCount: 95,
        registeredStudentsCount: 78,
        shortlistedCount: 28,
        selectedCount: 0,
        contactPerson: 'Karan Mehra (AI Talent Acquisition)',
        notes: 'Prioritized candidates with verified Python & ML credentials.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
        id: 'drive_5',
        collegeId: 'col_1',
        companyName: 'Apex Cloud Digital',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
        title: 'Platform Frontend & Cloud Infrastructure Specialist',
        departments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        minCgpa: 6.5,
        batchYear: '2026',
        packageCtc: '₹8,50,000 - ₹12,00,000 / year',
        openings: 45,
        mode: 'Virtual',
        location: 'Virtual Platform',
        registrationDeadline: '2026-09-20',
        assessmentDate: '2026-09-22',
        driveDate: '2026-09-28',
        status: 'Completed',
        eligibleStudentsCount: 260,
        registeredStudentsCount: 215,
        shortlistedCount: 80,
        selectedCount: 42,
        contactPerson: 'Ananya Roy (Head of Campus Recruitment)',
        notes: 'Final offer letters dispatched. 42 students placed.',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    }
];

// Department telemetry metrics
const mockDepartmentStats = [
    {
        department: 'Computer Science & Engineering',
        code: 'CSE',
        totalStudents: 120,
        eligibleStudents: 110,
        registeredStudents: 105,
        placedStudents: 78,
        placementRate: 74.3,
        averageCtcLpa: 13.8,
        highestCtcLpa: 24.0,
        verifiedReadinessPercent: 88,
        topRecruiters: ['Google Cloud', 'Microsoft', 'TechNova Solutions'],
        skillStrengths: ['Data Structures & Algorithms', 'Python 3', 'React.js', 'System Architecture']
    },
    {
        department: 'Information Technology',
        code: 'IT',
        totalStudents: 80,
        eligibleStudents: 72,
        registeredStudents: 68,
        placedStudents: 48,
        placementRate: 70.6,
        averageCtcLpa: 11.5,
        highestCtcLpa: 18.0,
        verifiedReadinessPercent: 82,
        topRecruiters: ['TechNova Solutions', 'Apex Cloud Digital', 'Amazon'],
        skillStrengths: ['Full Stack Web Development', 'SQL & Databases', 'Docker & DevOps']
    },
    {
        department: 'Artificial Intelligence & Data Science',
        code: 'AI&DS',
        totalStudents: 60,
        eligibleStudents: 56,
        registeredStudents: 54,
        placedStudents: 40,
        placementRate: 74.1,
        averageCtcLpa: 14.2,
        highestCtcLpa: 22.0,
        verifiedReadinessPercent: 91,
        topRecruiters: ['CognitiveScale AI', 'Google Cloud', 'Microsoft'],
        skillStrengths: ['Machine Learning', 'Python 3', 'NLP & Vector DBs', 'Statistical Analysis']
    },
    {
        department: 'Electronics & Communication',
        code: 'ECE',
        totalStudents: 90,
        eligibleStudents: 78,
        registeredStudents: 70,
        placedStudents: 42,
        placementRate: 60.0,
        averageCtcLpa: 9.4,
        highestCtcLpa: 16.0,
        verifiedReadinessPercent: 72,
        topRecruiters: ['TechNova Solutions', 'Apex Cloud Digital', 'Intel'],
        skillStrengths: ['Embedded C', 'IoT Systems', 'Core Python', 'Digital Logic']
    },
    {
        department: 'Mechanical Engineering',
        code: 'MECH',
        totalStudents: 50,
        eligibleStudents: 38,
        registeredStudents: 32,
        placedStudents: 16,
        placementRate: 50.0,
        averageCtcLpa: 7.2,
        highestCtcLpa: 10.5,
        verifiedReadinessPercent: 64,
        topRecruiters: ['Tata Motors', 'TechNova Solutions', 'L&T Technology'],
        skillStrengths: ['CAD/CAM', 'Automation Systems', 'Python Scripting', 'Engineering Mechanics']
    }
];

export const placementDriveRepository = {
    /**
     * Retrieves placement drives matching search and status filters.
     */
    async findAll(params = {}) {
        let drives = [...mockPlacementDrives];

        if (params.collegeId) {
            drives = drives.filter(d => d.collegeId === params.collegeId);
        }
        if (params.status && params.status !== 'All') {
            drives = drives.filter(d => d.status.toLowerCase() === params.status.toLowerCase());
        }
        if (params.department && params.department !== 'All') {
            drives = drives.filter(d => d.departments.includes(params.department));
        }
        if (params.search && params.search.trim()) {
            const q = params.search.toLowerCase().trim();
            drives = drives.filter(d =>
                d.companyName.toLowerCase().includes(q) ||
                d.title.toLowerCase().includes(q)
            );
        }

        return drives;
    },

    /**
     * Finds single drive by ID.
     */
    async findById(id) {
        return mockPlacementDrives.find(d => d.id === id) || null;
    },

    /**
     * Creates a new on-campus or virtual placement drive.
     */
    async create(data) {
        const newDrive = {
            id: `drive_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            collegeId: data.collegeId || 'col_1',
            companyName: data.companyName || 'Hiring Partner',
            companyLogo: data.companyLogo || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
            title: data.title || 'Campus Placement Drive',
            departments: Array.isArray(data.departments) ? data.departments : ['Computer Science & Engineering', 'Information Technology'],
            minCgpa: Number(data.minCgpa) || 7.0,
            batchYear: data.batchYear || '2026',
            packageCtc: data.packageCtc || '₹10,00,000 - ₹15,00,000 / year',
            openings: Number(data.openings) || 10,
            mode: data.mode || 'On-Campus Lab',
            location: data.location || 'Campus Tech Lab',
            registrationDeadline: data.registrationDeadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            assessmentDate: data.assessmentDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
            driveDate: data.driveDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: data.status || 'Registration Open',
            eligibleStudentsCount: Number(data.eligibleStudentsCount) || 120,
            registeredStudentsCount: Number(data.registeredStudentsCount) || 0,
            shortlistedCount: 0,
            selectedCount: 0,
            contactPerson: data.contactPerson || 'Campus Recruitment Lead',
            notes: data.notes || '',
            createdAt: new Date().toISOString()
        };

        mockPlacementDrives.unshift(newDrive);
        return newDrive;
    },

    /**
     * Updates placement drive details and stage progression.
     */
    async update(id, updateData) {
        const idx = mockPlacementDrives.findIndex(d => d.id === id);
        if (idx === -1) return null;

        mockPlacementDrives[idx] = {
            ...mockPlacementDrives[idx],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        return { ...mockPlacementDrives[idx] };
    },

    /**
     * Deletes / archives a placement drive.
     */
    async delete(id) {
        const idx = mockPlacementDrives.findIndex(d => d.id === id);
        if (idx === -1) return false;
        mockPlacementDrives.splice(idx, 1);
        return true;
    },

    /**
     * Returns departmental statistics and telemetry.
     */
    async getDepartmentStats(collegeId = 'col_1', batchYear = '2026') {
        const totalBatchStudents = mockDepartmentStats.reduce((sum, d) => sum + d.totalStudents, 0);
        const totalPlaced = mockDepartmentStats.reduce((sum, d) => sum + d.placedStudents, 0);
        const overallPlacementRate = Math.round((totalPlaced / totalBatchStudents) * 100);
        const avgInstitutionalCtc = (mockDepartmentStats.reduce((sum, d) => sum + d.averageCtcLpa, 0) / mockDepartmentStats.length).toFixed(1);
        const highestOverallCtc = Math.max(...mockDepartmentStats.map(d => d.highestCtcLpa));

        return {
            collegeId,
            batchYear,
            summary: {
                totalStudents: totalBatchStudents,
                totalPlaced,
                overallPlacementRate,
                avgInstitutionalCtcLpa: `${avgInstitutionalCtc} LPA`,
                highestOverallCtcLpa: `${highestOverallCtc.toFixed(1)} LPA`,
                activePlacementDrives: mockPlacementDrives.length
            },
            departments: mockDepartmentStats
        };
    },

    /**
     * Formats datasets for CSV / PDF export.
     */
    async getExportData(type = 'drives', collegeId = 'col_1', batchYear = '2026') {
        if (type === 'drives') {
            const drives = await this.findAll({ collegeId });
            const headers = [
                'Drive ID',
                'Company Name',
                'Role / Title',
                'Batch Year',
                'Min CGPA',
                'Eligible Departments',
                'Package (CTC)',
                'Mode',
                'Registration Deadline',
                'Drive Date',
                'Eligible',
                'Registered',
                'Shortlisted',
                'Selected Offers',
                'Status'
            ];
            const rows = drives.map(d => [
                d.id,
                d.companyName,
                d.title,
                d.batchYear,
                d.minCgpa,
                d.departments.join('; '),
                d.packageCtc,
                d.mode,
                d.registrationDeadline,
                d.driveDate,
                d.eligibleStudentsCount,
                d.registeredStudentsCount,
                d.shortlistedCount,
                d.selectedCount,
                d.status
            ]);
            return { headers, rows, count: rows.length };
        }

        if (type === 'departments') {
            const { departments } = await this.getDepartmentStats(collegeId, batchYear);
            const headers = [
                'Department Name',
                'Code',
                'Total Students',
                'Eligible Candidates',
                'Registered for Drives',
                'Placed Students',
                'Placement Rate (%)',
                'Average CTC (LPA)',
                'Highest CTC (LPA)',
                'Verified Skill Readiness (%)',
                'Top Corporate Recruiters'
            ];
            const rows = departments.map(d => [
                d.department,
                d.code,
                d.totalStudents,
                d.eligibleStudents,
                d.registeredStudents,
                d.placedStudents,
                `${d.placementRate}%`,
                `${d.averageCtcLpa} LPA`,
                `${d.highestCtcLpa} LPA`,
                `${d.verifiedReadinessPercent}%`,
                d.topRecruiters.join('; ')
            ]);
            return { headers, rows, count: rows.length };
        }

        // Student Roster Export
        const headers = [
            'Roll Number',
            'Student Name',
            'Department',
            'CGPA',
            'Placement Readiness',
            'Verified Skills',
            'Placement Status',
            'Placed Company',
            'Package CTC'
        ];
        const rows = [
            ['APEX-2026-CSE-001', 'Alex Rivera', 'Computer Science & Engineering', '8.85', '88%', 'Python 3; React.js; DSA; SQL', 'Placed', 'TechNova Solutions', '₹12,00,000 / year'],
            ['APEX-2026-AIDS-014', 'Samantha Chen', 'Artificial Intelligence & Data Science', '9.30', '94%', 'Python 3; ML; DSA; SQL', 'Placed', 'CognitiveScale AI', '₹18,00,000 / year'],
            ['APEX-2026-IT-028', 'Priya Sharma', 'Information Technology', '8.60', '85%', 'React.js; Node.js; TypeScript', 'Placed', 'Apex Cloud Digital', '₹11,00,000 / year'],
            ['APEX-2026-ECE-042', 'Devon Miller', 'Electronics & Communication', '7.90', '76%', 'Embedded C; Python 3; IoT', 'In Process', 'TechNova Solutions', 'Pending Round 2'],
            ['APEX-2026-MECH-019', 'Rohan Verma', 'Mechanical Engineering', '7.80', '70%', 'CAD/CAM; Python; Automation', 'Placed', 'Tata Motors', '₹9,50,000 / year'],
            ['APEX-2026-IT-055', 'Marcus Vance', 'Information Technology', '7.20', '62%', 'JavaScript; HTML/CSS', 'In Training', 'Unplaced', '-']
        ];
        return { headers, rows, count: rows.length };
    }
};
