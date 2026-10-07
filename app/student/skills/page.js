'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Award, CheckCircle2, Plus, ShieldCheck, ExternalLink, Sparkles, FileCheck, Share2, Check } from 'lucide-react';

export default function StudentSkillsPage() {
    const { profile, refreshProfile } = useAuth();
    const studentId = profile?.id || 'std_1';
    const [student, setStudent] = useState(null);
    const [skills, setSkills] = useState([]);
    const [verifiedSkills, setVerifiedSkills] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Skill Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [newCategory, setNewCategory] = useState('Programming');
    const [newLevel, setNewLevel] = useState('Beginner');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const loadSkills = async () => {
        try {
            const res = await fetch(`/api/students/${studentId}`);
            const data = await res.json();
            if (data.student) {
                setStudent(data.student);
                setSkills(data.skills || []);
                setVerifiedSkills(data.verifiedSkills || []);
                setCertificates(data.certificates || []);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSkills();
    }, [studentId]);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkillName)
            return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/students/${studentId}/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skillName: newSkillName,
                    category: newCategory,
                    level: newLevel
                })
            });
            const data = await res.json();
            if (data.success) {
                setModalOpen(false);
                setNewSkillName('');
                await loadSkills();
                await refreshProfile();
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleCopyPassportLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Passport Header Banner (Section 35) */}
                <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Official Skill2Hire Verified Passport</span>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {student?.fullName || 'Alex Rivera'}’s Skill Passport
                            </h1>
                            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                                Cryptographically verifiable candidate passport displaying proven skills, assessment scores, and authenticated certifications for recruiters.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Self-Declared Skill</span>
                            </button>
                            
                            <button
                                onClick={handleCopyPassportLink}
                                className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-primary-600/30 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                                <span>{copied ? 'Copied Link!' : 'Share Passport'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Strip */}
                    <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <span className="text-2xl font-black text-white">{skills.length}</span>
                            <span className="block text-[11px] text-slate-400">Total Skills Added</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-emerald-400">{verifiedSkills.length}</span>
                            <span className="block text-[11px] text-slate-400">Verified Skills ✓</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-primary-400">{certificates.length}</span>
                            <span className="block text-[11px] text-slate-400">Issued Certificates</span>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-amber-400">{student?.placementReadiness || 62}%</span>
                            <span className="block text-[11px] text-slate-400">Readiness Score</span>
                        </div>
                    </div>
                </div>

                {/* 1. VERIFIED SKILLS SECTION (Section 25) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span>Verified Skills (Validated through Assessments)</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Skills marked with Verified ✓ have been validated through timed assessments and are weighted at 100% in job match calculations.
                            </p>
                        </div>
                    </div>

                    {verifiedSkills.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Verified Skills Yet</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                                Take a course assessment to verify your Python, DSA, SQL or C++ skills and earn your verified badge.
                            </p>
                            <Link
                                href="/assessments/asm_python"
                                className="mt-4 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500"
                            >
                                Take Python Assessment (Demo Flow)
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {verifiedSkills.map((vs) => (
                                <div
                                    key={vs.id || vs.skillName}
                                    className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{vs.skillName}</span>
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                                                {vs.level} ✓
                                            </span>
                                        </div>

                                        {/* Skill Credibility Score (Section 10) */}
                                        <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 space-y-1">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="text-slate-700 dark:text-slate-300">Skill Credibility Score:</span>
                                                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{vs.credibilityScore || 94}%</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                Based on Assessment: {vs.score}%, Projects: 90%, Course: 100%
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                                            <span>Verified On:</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(vs.verificationDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-[11px]">
                                        <span className="font-mono text-slate-400 dark:text-slate-500">{vs.certificateId || 'CERT-VERIFIED'}</span>
                                        <Link
                                            href={`/verify/${vs.certificateId || 'CERT-SQL-8821'}`}
                                            className="font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                        >
                                            <span>Certificate</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. ALL PORTFOLIO SKILLS (SELF-DECLARED & PENDING VERIFICATION) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span>All Declared Skills</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Self-declared skills receive partial match weight until verified through an assessment.
                            </p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 font-bold text-xs flex items-center gap-1.5 transition-colors border border-primary-200/60 dark:border-primary-800/60"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Skill</span>
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {skills.map((s) => {
                            const isVer = s.status === 'Verified';
                            return (
                                <div key={s.id || s.skillName} className="py-4 flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{s.skillName}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">— {s.level}</span>
                                            {isVer ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                                                    Verified ✓ {s.score ? `(${s.score}%)` : ''}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                                                    Self-Declared
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Category: {s.category || 'Programming'}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isVer ? (
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Verified
                                            </span>
                                        ) : (
                                            <Link
                                                href={`/assessments/asm_${s.skillName.toLowerCase()}`}
                                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-sm transition-all flex items-center gap-1"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Verify Skill Now</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CERTIFICATES & AWARDS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span>Verified Credentials & Certificates</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Tamper-proof digital certificates issued upon passing verification assessments and finishing courses.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id || cert.certificateNumber}
                                className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border border-indigo-200/80 dark:border-slate-800 flex flex-col justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Skill2Hire Credential</span>
                                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{cert.certificateNumber}</span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{cert.skillOrCourseName}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Issued to: <span className="font-bold text-slate-800 dark:text-slate-200">{cert.studentName}</span> on {cert.issuedDate}</p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Score: {cert.score || 88}%</span>
                                    <Link
                                        href={`/verify/${cert.certificateNumber}`}
                                        className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                                    >
                                        <span>View Public Certificate</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ADD SELF-DECLARED SKILL MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Skill to Profile</h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Note: New skills are added as <strong>Self-Declared</strong>. You must complete a Skill2Hire assessment to earn the <strong>Verified ✓</strong> status badge.
                        </p>

                        <form onSubmit={handleAddSkill} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skill Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Python, Docker, React, AWS"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Programming">Programming</option>
                                    <option value="Data Structures">Data Structures</option>
                                    <option value="Databases">Databases</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="AI/ML">AI/ML</option>
                                    <option value="Cloud">Cloud</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Soft Skills">Soft Skills</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Self-Reported Proficiency</label>
                                <select
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md transition-colors"
                                >
                                    {submitting ? 'Adding...' : 'Add Skill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
