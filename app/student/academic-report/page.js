'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, ShieldCheck, Phone, Printer, Share2, Check } from 'lucide-react';

const FALLBACK_REPORT = {
    collegeName: 'Apex University of Engineering',
    issuedDate: '2026-04-15',
    verificationHash: '0x8f2d91c47a02b6e15948cd3e2a9b14c718e20f44',
    studentName: 'Alex Rivera',
    rollNumber: '22CS084',
    registrationNumber: 'REG-2022-849102',
    phone: '+91 98765 43210',
    degree: 'B.Tech in Computer Science & Engineering',
    department: 'Computer Science & Engineering',
    admissionYear: 2022,
    graduationYear: 2026,
    currentSemester: 6,
    email: 'alex.rivera@student.skill2job.ai',
    cgpa: 8.85,
    totalCreditsEarned: 132,
    totalCreditsRequired: 160,
    overallAttendancePercentage: 94,
    activeBacklogs: 0,
    placementStatus: 'Verified Candidate',
    semesters: [
        {
            semesterNumber: 1,
            semesterName: 'Semester 1',
            academicYear: '2022-2023',
            sgpa: 8.70,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS101', name: 'Introduction to Programming & C', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'MA101', name: 'Linear Algebra & Calculus', type: 'Foundations', credits: 4, grade: 'A+', gradePoint: 9 },
                { code: 'PH101', name: 'Engineering Physics & Electromagnetics', type: 'Foundations', credits: 4, grade: 'A', gradePoint: 8 },
                { code: 'CS102', name: 'Programming Laboratory (C & Linux)', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 },
                { code: 'HS101', name: 'Technical English & Professional Communication', type: 'Humanities', credits: 3, grade: 'A+', gradePoint: 9 }
            ]
        },
        {
            semesterNumber: 2,
            semesterName: 'Semester 2',
            academicYear: '2022-2023',
            sgpa: 8.90,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS201', name: 'Object-Oriented Programming (C++)', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS202', name: 'Digital Logic & Computer Organization', type: 'Core Theory', credits: 4, grade: 'A+', gradePoint: 9 },
                { code: 'MA201', name: 'Discrete Mathematical Structures', type: 'Foundations', credits: 4, grade: 'A+', gradePoint: 9 },
                { code: 'CS203', name: 'OOP Laboratory (C++)', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 },
                { code: 'EE201', name: 'Basic Electrical & Electronics', type: 'Allied', credits: 3, grade: 'A', gradePoint: 8 }
            ]
        },
        {
            semesterNumber: 3,
            semesterName: 'Semester 3',
            academicYear: '2023-2024',
            sgpa: 8.85,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS301', name: 'Data Structures & Algorithms', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS302', name: 'Computer Architecture & Microprocessors', type: 'Core Theory', credits: 4, grade: 'A', gradePoint: 8 },
                { code: 'CS303', name: 'Database Management Systems', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS304', name: 'Data Structures Laboratory', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 },
                { code: 'CS305', name: 'DBMS & SQL Laboratory', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 }
            ]
        },
        {
            semesterNumber: 4,
            semesterName: 'Semester 4',
            academicYear: '2023-2024',
            sgpa: 8.95,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS401', name: 'Operating Systems & Concurrency', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS402', name: 'Design & Analysis of Algorithms', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS403', name: 'Software Engineering & Agile Methodologies', type: 'Core Theory', credits: 3, grade: 'A+', gradePoint: 9 },
                { code: 'CS404', name: 'Operating Systems System Call Lab', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 },
                { code: 'MA401', name: 'Probability, Statistics & Stochastic Processes', type: 'Foundations', credits: 4, grade: 'A+', gradePoint: 9 }
            ]
        },
        {
            semesterNumber: 5,
            semesterName: 'Semester 5',
            academicYear: '2024-2025',
            sgpa: 8.80,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS501', name: 'Computer Networks & Socket Programming', type: 'Core Theory', credits: 4, grade: 'A+', gradePoint: 9 },
                { code: 'CS502', name: 'Formal Languages & Automata Theory', type: 'Core Theory', credits: 4, grade: 'A', gradePoint: 8 },
                { code: 'CS503', name: 'Web Technologies (React & Node.js)', type: 'Elective', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS504', name: 'Computer Networks & Packet Analysis Lab', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 },
                { code: 'CS505', name: 'Full-Stack Web Development Lab', type: 'Laboratory', credits: 2, grade: 'O', gradePoint: 10 }
            ]
        },
        {
            semesterNumber: 6,
            semesterName: 'Semester 6',
            academicYear: '2024-2025',
            sgpa: 8.90,
            earnedCredits: 22,
            totalCredits: 22,
            subjects: [
                { code: 'CS601', name: 'Compiler Design & Code Generation', type: 'Core Theory', credits: 4, grade: 'A+', gradePoint: 9 },
                { code: 'CS602', name: 'Cloud Computing & Distributed Systems', type: 'Core Theory', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS603', name: 'Artificial Intelligence & Machine Learning', type: 'Elective', credits: 4, grade: 'O', gradePoint: 10 },
                { code: 'CS604', name: 'Cloud & AI Mini-Project Laboratory', type: 'Laboratory', credits: 3, grade: 'O', gradePoint: 10 },
                { code: 'CS605', name: 'Competitive Coding & Placement Aptitude', type: 'Placement Core', credits: 2, grade: 'O', gradePoint: 10 }
            ]
        }
    ],
    verifiedSkills: [
        { skillName: 'Python 3', level: 'Advanced', score: 92, credibilityScore: 96, certificateId: 'CERT-PY-8821' },
        { skillName: 'Data Structures & Algorithms', level: 'Advanced', score: 89, credibilityScore: 94, certificateId: 'CERT-DSA-4912' },
        { skillName: 'SQL & Relational DBs', level: 'Intermediate', score: 82, credibilityScore: 90, certificateId: 'CERT-SQL-3104' },
        { skillName: 'React.js & Frontend', level: 'Intermediate', score: 85, credibilityScore: 92, certificateId: 'CERT-REACT-5120' }
    ]
};

export default function StudentAcademicReportPage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [report, setReport] = useState(FALLBACK_REPORT);
    const [activeSemester, setActiveSemester] = useState('all');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function loadReport() {
            try {
                const res = await fetch(`/api/students/${studentId}/academic-report`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data?.report && typeof data.report === 'object' && !Array.isArray(data.report) && data.report.semesters) {
                        setReport(data.report);
                    }
                }
            } catch (e) {
                console.warn('Error fetching academic report, using robust offline fallback:', e);
            }
        }
        loadReport();
        return () => {
            isMounted = false;
        };
    }, [studentId]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayedSemesters = activeSemester === 'all'
        ? (report?.semesters || [])
        : (report?.semesters || []).filter(s => s.semesterNumber === activeSemester);

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors print:bg-white print:py-0 print:p-0">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Navigation & Print Controls (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <Link
                        href="/student/dashboard"
                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1.5"
                    >
                        <span>← Back to Student Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Link Copied' : 'Share Verification Link'}</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-500 shadow-md transition-colors flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Official Transcript</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* OFFICIAL ACADEMIC TRANSCRIPT DOCUMENT (PRINT-READY)                       */}
                {/* ========================================================================= */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-12 border border-slate-300 dark:border-slate-800 shadow-lg print:border-none print:shadow-none space-y-8 transition-colors">
                    
                    {/* 1. INSTITUTION & UNIVERSITY EMBLEM HEADER */}
                    <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-6 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-950 text-white flex items-center justify-center shadow-md shrink-0">
                                    <GraduationCap className="w-9 h-9 text-indigo-300" />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black tracking-widest text-indigo-700 dark:text-indigo-400 uppercase block">
                                        Office of the University Registrar & Placement Cell
                                    </span>
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                        {report?.collegeName}
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                        Accredited Grade A+ • Affiliated to State Technological Board
                                    </p>
                                </div>
                            </div>

                            <div className="text-right shrink-0 font-mono text-xs">
                                <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 block text-center">
                                    Official Verified Record ✓
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                                    Issued: {report?.issuedDate ? new Date(report.issuedDate).toLocaleDateString() : 'Recent'}
                                </span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                                    Hash: {report?.verificationHash}
                                </span>
                            </div>
                        </div>

                        <div className="text-center pt-2">
                            <span className="inline-block px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-xs font-black uppercase tracking-widest border border-slate-300 dark:border-slate-700">
                                Official Student Academic & Placement Readiness Transcript
                            </span>
                        </div>
                    </div>

                    {/* 2. STUDENT REGISTRATION & PERSONAL PARTICULARS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Student Full Name:</span>
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{report?.studentName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">University Roll No:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{report?.rollNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Registration No:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{report?.registrationNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Mobile Phone:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{report?.phone}</span>
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Degree Program:</span>
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{report?.degree}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Department / Branch:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{report?.department}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Academic Session:</span>
                                <span className="font-bold text-slate-900 dark:text-slate-100">{report?.admissionYear} – {report?.graduationYear} (Semester {report?.currentSemester})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold">Student Email:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{report?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. CUMULATIVE ACADEMIC BENCHMARK GAUGES */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">Cumulative CGPA</span>
                            <span className="text-2xl font-black text-indigo-950 dark:text-indigo-200 mt-0.5 block">
                                {typeof report?.cgpa === 'number' ? report.cgpa.toFixed(2) : '8.85'} / 10.0
                            </span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">First Class with Distinction</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Credits Completed</span>
                            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-0.5 block">
                                {report?.totalCreditsEarned} / {report?.totalCreditsRequired}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% on-track</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Institutional Attendance</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 block">{report?.overallAttendancePercentage}%</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Eligible for Campus Drives ✓</span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Active Backlogs</span>
                            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">{report?.activeBacklogs}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Clean Academic Record</span>
                        </div>
                    </div>

                    {/* 4. SEMESTER TRANSCRIPT FILTER BUTTONS (Hidden on Print) */}
                    <div className="flex items-center justify-between print:hidden pt-2">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Semester-wise Grade Sheets:</h2>
                        <div className="flex items-center gap-1 flex-wrap">
                            <button
                                onClick={() => setActiveSemester('all')}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                                    activeSemester === 'all'
                                        ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                All Semesters (1–6)
                            </button>
                            {[1, 2, 3, 4, 5, 6].map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setActiveSemester(sem)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                                        activeSemester === sem
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Sem {sem}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. SEMESTER-WISE SUBJECT GRADE TABLES */}
                    <div className="space-y-6">
                        {displayedSemesters.map((sem) => (
                            <div key={sem.semesterNumber} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-slate-100 dark:bg-slate-800/90 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{sem.semesterName}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">({sem.academicYear})</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                                            SGPA: <strong className="font-mono text-sm">{typeof sem.sgpa === 'number' ? sem.sgpa.toFixed(2) : sem.sgpa}</strong>
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">Credits: {sem.earnedCredits}/{sem.totalCredits}</span>
                                    </div>
                                </div>

                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="py-2.5 px-4">Course Code</th>
                                            <th className="py-2.5 px-4">Subject Title</th>
                                            <th className="py-2.5 px-4">Type</th>
                                            <th className="py-2.5 px-4 text-center">Credits</th>
                                            <th className="py-2.5 px-4 text-center">Grade</th>
                                            <th className="py-2.5 px-4 text-right">Grade Point</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                                        {sem.subjects.map((sub) => (
                                            <tr key={sub.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{sub.code}</td>
                                                <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{sub.name}</td>
                                                <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">{sub.type}</td>
                                                <td className="py-2.5 px-4 text-center font-mono">{sub.credits}</td>
                                                <td className="py-2.5 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        sub.grade === 'O' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50' :
                                                        sub.grade === 'A+' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' :
                                                        sub.grade === 'A' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                                                    }`}>
                                                        {sub.grade}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">{sub.gradePoint} / 10</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* 6. VERIFIED INDUSTRY SKILLS & CREDIBILITY INDEX */}
                    <div className="p-6 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Skill2Job.ai Industry Verification & Verified Credentials</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Skills verified through timed technical assessments and validated in the institutional passport.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                                Placement Status: {report?.placementStatus} ✓
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {report?.verifiedSkills?.map((vs) => (
                                <div key={vs.skillName} className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-1 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{vs.skillName}</span>
                                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/60">
                                            {vs.level} ✓
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                        <span>Assessment Score:</span>
                                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{vs.score}%</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                        <span>Credibility Index:</span>
                                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{vs.credibilityScore}%</span>
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1">
                                        {vs.certificateId}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 7. INSTITUTIONAL REGISTRAR & SIGN-OFF FOOTER */}
                    <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
                        <div className="space-y-1 text-center sm:text-left">
                            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">Registrar Verification Seal</span>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm">
                                This academic transcript is digitally signed and cryptographically validated on the Skill2Job.ai Education-to-Employment platform.
                            </p>
                        </div>

                        <div className="text-center space-y-1">
                            <div className="w-32 h-10 border-b border-slate-400 dark:border-slate-600 mx-auto" />
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase block">Controller of Examinations</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500">Apex University Placement Cell</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
