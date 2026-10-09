'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    FileText, Sparkles, CheckCircle2, XCircle, AlertCircle, Copy, Check,
    Plus, Trash2, Download, RefreshCw, ArrowRight, ShieldCheck, Award, Zap, Edit3, Layout
} from 'lucide-react';

export default function ResumeStudioPage() {
    const { profile } = useAuth();
    const studentId = profile?.id || 'std_1';

    // Active Studio Tab: 'builder' | 'ats' | 'rewriter'
    const [activeTab, setActiveTab] = useState('builder');

    // ==========================================
    // 1. RESUME BUILDER STATE
    // ==========================================
    const [resumeData, setResumeData] = useState({
        personalInfo: {
            fullName: 'Alex Rivera',
            email: 'alex.rivera@student.skill2job.ai',
            phone: '+91 98765 43210',
            location: 'Bangalore, India',
            linkedin: 'https://linkedin.com/in/alex-rivera',
            github: 'https://github.com/alex-rivera',
            portfolio: 'https://alexrivera.dev'
        },
        summary: 'Computer Science student with verified proficiency in full-stack architecture, algorithm design, and cloud services. Proven track record building robust applications with high placement readiness.',
        education: [
            {
                institution: 'Apex University of Engineering',
                degree: 'B.Tech in Computer Science & Engineering',
                graduationYear: '2026',
                cgpa: '8.85 / 10.0',
                location: 'Bangalore, India'
            }
        ],
        skills: {
            verified: ['Python 3', 'React.js', 'Data Structures & Algorithms', 'SQL & Database Design'],
            additional: ['Docker', 'Git', 'Linux CLI', 'Tailwind CSS']
        },
        experience: [
            {
                role: 'Software Engineering Intern',
                company: 'TechNova Cloud Labs',
                location: 'Remote',
                startDate: 'May 2025',
                endDate: 'Aug 2025',
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
                title: 'Campus Food Delivery Logistics Engine',
                technologies: 'React, Next.js, Graph Algorithms, Tailwind CSS',
                link: 'https://github.com/alex-rivera/campus-logistics',
                bullets: [
                    'Built interactive routing and delivery dispatch algorithm, reducing delivery time across campus by 22%.'
                ]
            }
        ],
        certifications: [
            {
                certificateNumber: 'CERT-PY-8821',
                skillName: 'Python 3',
                level: 'Advanced',
                score: '92%'
            },
            {
                certificateNumber: 'CERT-DSA-4912',
                skillName: 'Data Structures & Algorithms',
                level: 'Advanced',
                score: '89%'
            }
        ]
    });

    const [builderLoading, setBuilderLoading] = useState(false);
    const [copiedResume, setCopiedResume] = useState(false);

    // Load initial prefilled data
    useEffect(() => {
        fetch(`/api/resume/builder?studentId=${studentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.resumeData) {
                    setResumeData(data.resumeData);
                }
            })
            .catch(e => console.warn('Could not load builder data:', e));
    }, [studentId]);

    // ==========================================
    // 2. ATS SCANNER STATE
    // ==========================================
    const [atsResumeText, setAtsResumeText] = useState('');
    const [atsJobDescription, setAtsJobDescription] = useState('');
    const [atsTargetRole, setAtsTargetRole] = useState('Full Stack Software Engineer');
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsResults, setAtsResults] = useState(null);

    // Sync plain text from builder
    useEffect(() => {
        const textRepresentation = `
${resumeData.personalInfo.fullName}
${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
GitHub: ${resumeData.personalInfo.github} | LinkedIn: ${resumeData.personalInfo.linkedin}

PROFESSIONAL SUMMARY:
${resumeData.summary}

TECHNICAL SKILLS:
Verified Skills: ${resumeData.skills.verified.join(', ')}
Additional Tools: ${resumeData.skills.additional.join(', ')}

EDUCATION:
${resumeData.education.map(e => `${e.degree} — ${e.institution} (CGPA: ${e.cgpa}, Graduating ${e.graduationYear})`).join('\n')}

EXPERIENCE:
${resumeData.experience.map(exp => `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.bullets.map(b => `• ${b}`).join('\n')}`).join('\n\n')}

KEY PROJECTS:
${resumeData.projects.map(p => `${p.title} (${p.technologies})\n${p.bullets.map(b => `• ${b}`).join('\n')}`).join('\n\n')}

VERIFIED CREDENTIALS:
${resumeData.certifications.map(c => `• ${c.skillName} (${c.level} — ${c.score}) [${c.certificateNumber}]`).join('\n')}
        `.trim();
        setAtsResumeText(textRepresentation);
    }, [resumeData]);

    const handleRunAtsScan = async (e) => {
        if (e) e.preventDefault();
        setAtsLoading(true);
        try {
            const res = await fetch('/api/resume/ats-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: atsResumeText,
                    jobDescription: atsJobDescription,
                    targetRole: atsTargetRole
                })
            });
            const data = await res.json();
            if (data.success) {
                setAtsResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAtsLoading(false);
        }
    };

    // ==========================================
    // 3. BULLET REWRITER STATE
    // ==========================================
    const [rawBullet, setRawBullet] = useState('Worked on the student web app and helped fix slow database queries.');
    const [rewriterRole, setRewriterRole] = useState('Full Stack Software Engineer');
    const [rewriterTech, setRewriterTech] = useState('PostgreSQL, Redis, Next.js');
    const [rewriting, setRewriting] = useState(false);
    const [rewriterResults, setRewriterResults] = useState(null);
    const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

    const handleRewrite = async (e) => {
        if (e) e.preventDefault();
        setRewriting(true);
        try {
            const res = await fetch('/api/resume/rewrite-bullet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bulletText: rawBullet,
                    role: rewriterRole,
                    technologies: rewriterTech
                })
            });
            const data = await res.json();
            if (data.success) {
                setRewriterResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRewriting(false);
        }
    };

    const handleCopyFormattedResume = () => {
        navigator.clipboard.writeText(atsResumeText);
        setCopiedResume(true);
        setTimeout(() => setCopiedResume(false), 2000);
    };

    const handleInsertBulletIntoExperience = (bulletText) => {
        setResumeData(prev => {
            const exp = [...prev.experience];
            if (exp.length > 0) {
                exp[0].bullets.push(bulletText);
            }
            return { ...prev, experience: exp };
        });
        alert('Bullet added to your latest Experience entry!');
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                                <span>Skill2Job.ai Career Studio</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                ATS Resume Builder & Optimizer
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                                Build an ATS-compliant technical resume pre-filled with your verified credentials, audit keyword compatibility, and transform weak bullets into high-impact Google XYZ achievements.
                            </p>
                        </div>

                        {/* Tab Switcher Pills */}
                        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
                            <button
                                onClick={() => setActiveTab('builder')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'builder' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Layout className="w-3.5 h-3.5" />
                                <span>1. Resume Builder</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('ats'); if (!atsResults) handleRunAtsScan(); }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'ats' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>2. ATS Scanner</span>
                            </button>
                            <button
                                onClick={() => { setActiveTab('rewriter'); if (!rewriterResults) handleRewrite(); }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'rewriter' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>3. Bullet Rewriter</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: INTERACTIVE RESUME BUILDER & LIVE ATS PREVIEW                      */}
                {/* ========================================================================= */}
                {activeTab === 'builder' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Editor Form (Left 6 Cols) */}
                        <div className="lg:col-span-6 space-y-6">
                            
                            {/* Personal Details */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary-500" />
                                    <span>Personal & Contact Info</span>
                                </h2>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={resumeData.personalInfo.fullName}
                                            onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, fullName: e.target.value } })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={resumeData.personalInfo.email}
                                            onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, email: e.target.value } })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={resumeData.personalInfo.phone}
                                            onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, phone: e.target.value } })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={resumeData.personalInfo.location}
                                            onChange={(e) => setResumeData({ ...resumeData, personalInfo: { ...resumeData.personalInfo, location: e.target.value } })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Professional Summary */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary-500" />
                                    <span>Professional Summary</span>
                                </h2>
                                <textarea
                                    rows={3}
                                    value={resumeData.summary}
                                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 leading-relaxed font-medium"
                                />
                            </div>

                            {/* Verified Skills Strip */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Verified Technical Skills</span>
                                    </h2>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                                        Skill2Job.ai Passport Synced ✓
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {resumeData.skills.verified.map((sk, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>{sk}</span>
                                        </span>
                                    ))}
                                    {resumeData.skills.additional.map((sk, idx) => (
                                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                            {sk}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Projects & Work Experience */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-primary-500" />
                                        <span>Key Engineering Projects</span>
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('rewriter')}
                                        className="text-[11px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>Rewrite Bullets with AI</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {resumeData.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{proj.title}</div>
                                                <span className="text-[10px] text-slate-500 font-mono">{proj.technologies}</span>
                                            </div>
                                            <ul className="space-y-1.5 pl-3 list-disc text-xs text-slate-600 dark:text-slate-300">
                                                {proj.bullets.map((b, bIdx) => (
                                                    <li key={bIdx} className="leading-relaxed">{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Live ATS Printable Preview (Right 6 Cols) */}
                        <div className="lg:col-span-6 space-y-4 sticky top-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live ATS-Compliant Document Preview</h3>
                                    <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-800">Standard 1-Column ATS</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopyFormattedResume}
                                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                                    >
                                        {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedResume ? 'Copied Text' : 'Copy Plain Text'}</span>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Print / PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* The Document Sheet */}
                            <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 space-y-5 font-sans min-h-[700px] text-[11px] leading-relaxed">
                                {/* Header */}
                                <div className="text-center border-b border-slate-300 pb-4 space-y-1">
                                    <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">{resumeData.personalInfo.fullName}</h1>
                                    <p className="text-slate-600 font-medium">
                                        {resumeData.personalInfo.email} | {resumeData.personalInfo.phone} | {resumeData.personalInfo.location}
                                    </p>
                                    <p className="text-slate-500 font-mono text-[10px]">
                                        GitHub: {resumeData.personalInfo.github} | LinkedIn: {resumeData.personalInfo.linkedin}
                                    </p>
                                </div>

                                {/* Summary */}
                                <div className="space-y-1">
                                    <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Professional Summary</h4>
                                    <p className="text-slate-700">{resumeData.summary}</p>
                                </div>

                                {/* Technical Skills */}
                                <div className="space-y-1">
                                    <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Technical Skills</h4>
                                    <p><strong className="text-slate-900">Verified Competencies:</strong> {resumeData.skills.verified.join(', ')}</p>
                                    <p><strong className="text-slate-900">Tools & Frameworks:</strong> {resumeData.skills.additional.join(', ')}</p>
                                </div>

                                {/* Education */}
                                <div className="space-y-1">
                                    <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Education</h4>
                                    {resumeData.education.map((e, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <div>
                                                <span className="font-bold text-slate-900">{e.degree}</span> — {e.institution}
                                            </div>
                                            <div className="font-medium text-slate-600">CGPA: {e.cgpa} ({e.graduationYear})</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Experience */}
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Work & Internship Experience</h4>
                                    {resumeData.experience.map((exp, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between font-bold text-slate-900">
                                                <span>{exp.role} — {exp.company}</span>
                                                <span className="text-slate-600 font-normal">{exp.startDate} - {exp.endDate}</span>
                                            </div>
                                            <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                                                {exp.bullets.map((b, bIdx) => (
                                                    <li key={bIdx}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Projects */}
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Technical Projects</h4>
                                    {resumeData.projects.map((p, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between font-bold text-slate-900">
                                                <span>{p.title} <span className="font-normal text-slate-600">({p.technologies})</span></span>
                                            </div>
                                            <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                                                {p.bullets.map((b, bIdx) => (
                                                    <li key={bIdx}>{b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Verified Certifications */}
                                {resumeData.certifications.length > 0 && (
                                    <div className="space-y-1">
                                        <h4 className="font-black uppercase tracking-wider text-[11px] border-b border-slate-200 pb-0.5 text-slate-900">Verified Certifications</h4>
                                        <div className="space-y-0.5">
                                            {resumeData.certifications.map((c, idx) => (
                                                <p key={idx} className="text-slate-700">
                                                    • <strong className="text-slate-900">{c.skillName}</strong> ({c.level} — {c.score}) — <span className="font-mono text-[10px] text-slate-500">Credential ID: {c.certificateNumber}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: ATS RESUME COMPATIBILITY SCANNER & DIAGNOSTICS                      */}
                {/* ========================================================================= */}
                {activeTab === 'ats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Input Box (Left 5 Cols) */}
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary-500" />
                                <span>ATS Keyword & Format Auditor</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Evaluate your resume against corporate applicant tracking systems to ensure parsing accuracy and high recruiter shortlisting rates.
                            </p>

                            <form onSubmit={handleRunAtsScan} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Position / Role</label>
                                    <input
                                        type="text"
                                        value={atsTargetRole}
                                        onChange={(e) => setAtsTargetRole(e.target.value)}
                                        className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl font-bold"
                                        placeholder="e.g. Full Stack Engineer, AI Engineer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Job Description (Optional for Keyword Matching)</label>
                                    <textarea
                                        rows={3}
                                        value={atsJobDescription}
                                        onChange={(e) => setAtsJobDescription(e.target.value)}
                                        placeholder="Paste target job requirements to benchmark missing skill keywords..."
                                        className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Resume Plain Text</label>
                                    <textarea
                                        rows={8}
                                        value={atsResumeText}
                                        onChange={(e) => setAtsResumeText(e.target.value)}
                                        className="w-full p-3 text-xs font-mono border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={atsLoading}
                                    className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 transition-all"
                                >
                                    {atsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    <span>{atsLoading ? 'Scanning Resume ATS Compliance...' : 'Audit Resume ATS Score'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Analysis Report (Right 7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            {atsResults ? (
                                <div className="space-y-6">
                                    {/* Overall Score Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall ATS Compliance</span>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{atsResults.grade}</h3>
                                            <p className="text-xs text-slate-500">Evaluated across section hierarchy, keywords, quantified impact, and verb strength.</p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center font-black shadow-lg">
                                                <span className="text-2xl">{atsResults.overallScore}</span>
                                                <span className="text-[10px] text-cyan-400 -mt-1">/ 100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-Score Bars */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">ATS Component Breakdown</h4>

                                        <div className="space-y-3 text-xs">
                                            <div>
                                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                    <span>Section Structure & Headers</span>
                                                    <span>{atsResults.breakdown.sections}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${atsResults.breakdown.sections}%` }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                    <span>Technical Keyword Relevance</span>
                                                    <span>{atsResults.breakdown.keywords}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${atsResults.breakdown.keywords}%` }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                    <span>Measurable Metric Quantification</span>
                                                    <span>{atsResults.breakdown.metrics}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${atsResults.breakdown.metrics}%` }} />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                    <span>Proactive Action Verbs vs Passive Phrases</span>
                                                    <span>{atsResults.breakdown.actionVerbs}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${atsResults.breakdown.actionVerbs}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strengths & Improvements */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                                            <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                <span>ATS Strengths Identified</span>
                                            </h5>
                                            <ul className="space-y-1.5 text-xs text-emerald-800 dark:text-emerald-400 pl-2">
                                                {atsResults.strengths.map((s, i) => (
                                                    <li key={i}>• {s}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-amber-50/60 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200 dark:border-amber-800 space-y-2">
                                            <h5 className="font-bold text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                                <span>Actionable Improvement Checklist</span>
                                            </h5>
                                            <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-400 pl-2">
                                                {atsResults.improvements.map((imp, i) => (
                                                    <li key={i}>• {imp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ready for ATS Audit</h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Click "Audit Resume ATS Score" to parse section hierarchy, keyword density, and bullet metrics.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: AI BULLET REWRITER (Google XYZ / STAR FORMULA)                     */}
                {/* ========================================================================= */}
                {activeTab === 'rewriter' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Input (Left 5 Cols) */}
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <span>AI Action Verb & Metric Enhancer</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Transforms weak or passive bullet points into high-impact Google XYZ achievements: <em>"Accomplished [X] measured by [Y] by doing [Z]"</em>.
                            </p>

                            <form onSubmit={handleRewrite} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Draft Bullet Point</label>
                                    <textarea
                                        rows={4}
                                        value={rawBullet}
                                        onChange={(e) => setRawBullet(e.target.value)}
                                        placeholder="e.g. Worked on the frontend using React and fixed slow load times."
                                        className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl leading-relaxed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role Context</label>
                                        <input
                                            type="text"
                                            value={rewriterRole}
                                            onChange={(e) => setRewriterRole(e.target.value)}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tech Stack</label>
                                        <input
                                            type="text"
                                            value={rewriterTech}
                                            onChange={(e) => setRewriterTech(e.target.value)}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={rewriting}
                                    className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
                                >
                                    {rewriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    <span>{rewriting ? 'Optimizing with Google XYZ Formula...' : 'Rewrite Bullet Point'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Rewritten Variations (Right 7 Cols) */}
                        <div className="lg:col-span-7 space-y-4">
                            {rewriterResults ? (
                                <div className="space-y-4">
                                    <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-amber-400">Original Bullet</span>
                                        <p className="text-xs text-slate-300 font-mono italic">"{rewriterResults.original}"</p>
                                    </div>

                                    {/* Variations Cards */}
                                    <div className="space-y-3">
                                        {rewriterResults.rewrittenBullets.map((v, idx) => (
                                            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 group hover:border-primary-500 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                                                        {v.type}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-400 font-mono">{v.formula}</span>
                                                </div>

                                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                                    {v.bullet}
                                                </p>

                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(v.bullet);
                                                            setCopiedBulletIdx(idx);
                                                            setTimeout(() => setCopiedBulletIdx(null), 2000);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                                                    >
                                                        {copiedBulletIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        <span>{copiedBulletIdx === idx ? 'Copied' : 'Copy'}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleInsertBulletIntoExperience(v.bullet)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-primary-600 hover:bg-primary-600 text-white font-bold flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>Insert into Resume</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Improvement Analysis */}
                                    <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-300 space-y-1">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                                            <span>Why This Boosts ATS & Recruiter Scoring:</span>
                                        </div>
                                        <p className="leading-relaxed text-[11px] text-cyan-800 dark:text-cyan-400">
                                            {rewriterResults.improvementAnalysis}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                                    <Zap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ready to Upgrade Bullets</h4>
                                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                        Type any draft accomplishment and click "Rewrite Bullet Point" to generate quantitative metrics and action verbs.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
