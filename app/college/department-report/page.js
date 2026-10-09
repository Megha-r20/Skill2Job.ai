'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart3, Download, Printer, Users, TrendingUp, Award,
    Building2, CheckCircle2, ChevronRight, FileSpreadsheet,
    GraduationCap, ShieldCheck, Sparkles, Zap
} from 'lucide-react';

export default function DepartmentReportPage() {
    const { profile } = useAuth();
    const collegeId = profile?.id || 'col_1';

    const [batchYear, setBatchYear] = useState('2026');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReport() {
            setLoading(true);
            try {
                const res = await fetch(`/api/colleges/${collegeId}/department-report?batchYear=${batchYear}`);
                const data = await res.json();
                if (data.report) {
                    setReportData(data.report);
                }
            } catch (err) {
                console.error('Failed to load department report:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, [collegeId, batchYear]);

    const summary = reportData?.summary || {
        totalStudents: 400,
        totalPlaced: 224,
        overallPlacementRate: 67,
        avgInstitutionalCtcLpa: '11.8 LPA',
        highestOverallCtcLpa: '24.0 LPA',
        activePlacementDrives: 5
    };

    const departments = reportData?.departments || [];

    // Find top performing department
    const topDept = departments.length > 0
        ? [...departments].sort((a, b) => b.placementRate - a.placementRate)[0]
        : null;

    return (
        <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Navigation Breadcrumb */}
                <div className="flex items-center justify-between">
                    <Link href="/college/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        ← Back to College Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/college/placement-drives"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                        >
                            <span>Manage Placement Drives →</span>
                        </Link>
                    </div>
                </div>

                {/* Header Banner & Global Actions */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                Departmental Placement Intelligence
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Department-Wise Placement & Readiness Report
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Institutional analysis cross-referencing verified coding credentials, placement rates, and corporate compensation across academic faculties.
                            </p>
                        </div>

                        {/* Batch Selector & Export Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 pl-2">Batch:</span>
                                <select
                                    value={batchYear}
                                    onChange={(e) => setBatchYear(e.target.value)}
                                    className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                >
                                    <option value="2026">Class of 2026</option>
                                    <option value="2025">Class of 2025</option>
                                    <option value="2027">Class of 2027</option>
                                </select>
                            </div>

                            {/* CSV Export Button */}
                            <a
                                href={`/api/colleges/${collegeId}/reports/export?type=departments&format=csv&batchYear=${batchYear}`}
                                download
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Export CSV</span>
                            </a>

                            {/* Print / PDF Button */}
                            <a
                                href={`/api/colleges/${collegeId}/reports/export?type=departments&format=html&batchYear=${batchYear}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print / Save PDF</span>
                            </a>
                        </div>
                    </div>

                    {/* Executive KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Overall Placement Rate</span>
                            <span className="text-3xl font-black text-indigo-700 mt-1 block">{summary.overallPlacementRate}%</span>
                            <span className="text-[10px] text-indigo-600 font-semibold">{summary.totalPlaced} of {summary.totalStudents} Placed</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Average Institutional CTC</span>
                            <span className="text-3xl font-black text-emerald-700 mt-1 block">{summary.avgInstitutionalCtcLpa}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Across all placed candidates</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Highest Package Offered</span>
                            <span className="text-3xl font-black text-purple-700 mt-1 block">{summary.highestOverallCtcLpa}</span>
                            <span className="text-[10px] text-purple-600 font-semibold">Google Cloud & Microsoft Drives</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Top Department</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">{topDept?.code || 'CSE'}</span>
                            <span className="text-[10px] text-slate-600 font-semibold">{topDept?.placementRate}% Placement Rate</span>
                        </div>
                    </div>
                </div>

                {/* Comparative Department Breakdown Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Departmental Placement Matrix & Verified Readiness
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Breakdown of batch size, verified assessment qualification, compensation benchmarks, and primary recruiters.
                            </p>
                        </div>

                        {/* Student Roster Export Link */}
                        <a
                            href={`/api/colleges/${collegeId}/reports/export?type=students&format=csv&batchYear=${batchYear}`}
                            download
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export Student Roster (CSV)</span>
                        </a>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Compiling department intelligence records...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                                        <th className="py-3.5 px-4 rounded-l-xl">Department</th>
                                        <th className="py-3.5 px-3 text-center">Batch Size</th>
                                        <th className="py-3.5 px-3 text-center">Verified Ready</th>
                                        <th className="py-3.5 px-3 text-center">Placed</th>
                                        <th className="py-3.5 px-4 min-w-[160px]">Placement Rate</th>
                                        <th className="py-3.5 px-3 text-center">Avg CTC</th>
                                        <th className="py-3.5 px-3 text-center">Highest CTC</th>
                                        <th className="py-3.5 px-4 rounded-r-xl">Top Recruiting Partners</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {departments.map((dept) => (
                                        <tr key={dept.code} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-xs">
                                                        {dept.code}
                                                    </span>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900">{dept.department}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">
                                                            Strengths: {dept.skillStrengths?.slice(0, 2).join(', ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-3 text-center font-semibold text-slate-700">
                                                {dept.totalStudents}
                                            </td>

                                            <td className="py-4 px-3 text-center">
                                                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {dept.verifiedReadinessPercent}%
                                                </span>
                                            </td>

                                            <td className="py-4 px-3 text-center font-bold text-slate-900">
                                                {dept.placedStudents} / {dept.eligibleStudents}
                                            </td>

                                            {/* Placement Rate Bar Gauge */}
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[11px] font-bold">
                                                        <span className="text-slate-800">{dept.placementRate}%</span>
                                                        <span className="text-slate-400">{dept.placedStudents} Placed</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                dept.placementRate >= 70 ? 'bg-emerald-500' :
                                                                dept.placementRate >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                                                            }`}
                                                            style={{ width: `${dept.placementRate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-3 text-center font-extrabold text-emerald-700 font-mono">
                                                {dept.averageCtcLpa} LPA
                                            </td>

                                            <td className="py-4 px-3 text-center font-extrabold text-purple-700 font-mono">
                                                {dept.highestCtcLpa} LPA
                                            </td>

                                            <td className="py-4 px-4 text-slate-600 font-medium">
                                                <div className="flex flex-wrap gap-1">
                                                    {dept.topRecruiters?.map((rec) => (
                                                        <span key={rec} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                            {rec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Visual Comparative Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Placement Rate Comparison */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                Placement Rate Comparison (% by Faculty)
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Class of {batchYear}</span>
                        </div>

                        <div className="space-y-3 pt-2">
                            {departments.map((d) => (
                                <div key={d.code} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-700">{d.department} ({d.code})</span>
                                        <span className="font-extrabold text-slate-900">{d.placementRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${d.placementRate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Average Package Comparison */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                                Average CTC Benchmarks (LPA by Faculty)
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Max: {summary.highestOverallCtcLpa}</span>
                        </div>

                        <div className="space-y-3 pt-2">
                            {departments.map((d) => {
                                const barPercent = Math.min(100, Math.round((d.averageCtcLpa / 20) * 100));
                                return (
                                    <div key={d.code} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-slate-700">{d.department} ({d.code})</span>
                                            <span className="font-mono font-extrabold text-purple-700">{d.averageCtcLpa} LPA</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                                                style={{ width: `${barPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Export & Audit Stamp */}
                <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-white">Institutional Placement Certification</h4>
                        <p className="text-xs text-slate-300">
                            Telemetry certified by Skill2Job.ai Career Center based on tamper-proof proctored assessments and verified student passports.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={`/api/colleges/${collegeId}/reports/export?type=departments&format=csv&batchYear=${batchYear}`}
                            download
                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Full CSV</span>
                        </a>
                        <a
                            href={`/api/colleges/${collegeId}/reports/export?type=departments&format=html&batchYear=${batchYear}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Report</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}
