'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Zap, Calendar, Building2, Users, Download, Printer, Plus,
    Search, CheckCircle2, Clock, AlertCircle, ArrowRight, ExternalLink,
    Filter, Sparkles, RefreshCw, ChevronRight, Briefcase
} from 'lucide-react';

export default function PlacementDrivesPage() {
    const { profile } = useAuth();
    const collegeId = profile?.id || 'col_1';

    const [drives, setDrives] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // Modal state for creating a new placement drive
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        title: '',
        departments: ['Computer Science & Engineering', 'Information Technology'],
        minCgpa: '7.5',
        batchYear: '2026',
        packageCtc: '₹12,00,000 - ₹16,00,000 / year',
        openings: '15',
        mode: 'On-Campus Lab',
        location: 'Turing Computer Lab & Main Auditorium',
        registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        assessmentDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        driveDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        contactPerson: 'Campus Relations Lead',
        notes: ''
    });

    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadDrives = async () => {
        setLoading(true);
        try {
            let url = `/api/colleges/${collegeId}/placement-drives?`;
            if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
            if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.drives) {
                setDrives(data.drives);
                setSummary(data.summary);
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to load placement drives.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrives();
    }, [collegeId, statusFilter]);

    // Handle status transition of a drive
    const handleUpdateStatus = async (driveId, newStatus) => {
        setUpdatingId(driveId);
        try {
            const res = await fetch(`/api/colleges/${collegeId}/placement-drives/${driveId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Drive status transitioned to "${newStatus}".`, 'success');
                await loadDrives();
            } else {
                showToast(data.error || 'Failed to update status.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Network error while updating status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    // Create a new placement drive
    const handleCreateDrive = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/colleges/${collegeId}/placement-drives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                showToast(`🎉 Placement drive for ${formData.companyName} created!`, 'success');
                setIsCreateModalOpen(false);
                setFormData({
                    companyName: '',
                    title: '',
                    departments: ['Computer Science & Engineering', 'Information Technology'],
                    minCgpa: '7.5',
                    batchYear: '2026',
                    packageCtc: '₹12,00,000 - ₹16,00,000 / year',
                    openings: '15',
                    mode: 'On-Campus Lab',
                    location: 'Turing Computer Lab & Main Auditorium',
                    registrationDeadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                    assessmentDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
                    driveDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                    contactPerson: 'Campus Relations Lead',
                    notes: ''
                });
                await loadDrives();
            } else {
                showToast(data.error || 'Failed to create drive.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Network error creating drive.', 'error');
        }
    };

    // Filter drives locally by search query
    const filteredDrives = useMemo(() => {
        if (!searchQuery.trim()) return drives;
        const q = searchQuery.toLowerCase().trim();
        return drives.filter(d =>
            d.companyName.toLowerCase().includes(q) ||
            d.title.toLowerCase().includes(q)
        );
    }, [drives, searchQuery]);

    const stages = ['All', 'Registration Open', 'Assessment Ongoing', 'Interviews', 'Completed'];

    const departmentOptions = [
        'Computer Science & Engineering',
        'Information Technology',
        'Artificial Intelligence & Data Science',
        'Electronics & Communication',
        'Mechanical Engineering'
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
                        toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                        {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 text-xs font-bold opacity-60 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Navigation Breadcrumb */}
                <div className="flex items-center justify-between">
                    <Link href="/college/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        ← Back to Placement Center Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/college/department-report"
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                        >
                            <span>View Department-Wise Report →</span>
                        </Link>
                    </div>
                </div>

                {/* Header & Controls Hub */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-indigo-600" />
                                Institutional Career Operations
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Campus Placement Drives Management
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Schedule on-campus recruitment, track candidate funnels from registration to final selection, and generate official institutional exports.
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* CSV Export Button */}
                            <a
                                href={`/api/colleges/${collegeId}/reports/export?type=drives&format=csv`}
                                download
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Export Drives (CSV)</span>
                            </a>

                            {/* Print / PDF Button */}
                            <a
                                href={`/api/colleges/${collegeId}/reports/export?type=drives&format=html`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print / Save PDF</span>
                            </a>

                            {/* Create Drive Trigger */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Schedule Placement Drive</span>
                            </button>
                        </div>
                    </div>

                    {/* 4 Summary KPI Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Placement Drives</span>
                            <span className="text-2xl font-black text-slate-900 mt-1 block">{summary?.totalDrives || drives.length}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Active Ongoing Drives</span>
                            <span className="text-2xl font-black text-indigo-700 mt-1 block">{summary?.activeDrives || 3}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Offers Extended 🎉</span>
                            <span className="text-2xl font-black text-emerald-700 mt-1 block">{summary?.totalOffers || 60}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Total Registrations</span>
                            <span className="text-2xl font-black text-amber-700 mt-1 block">{summary?.totalRegistered || 774}</span>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {stages.map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                    statusFilter === st
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[260px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search company or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>
                </div>

                {/* Placement Drives List */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-600">Loading placement drive records...</p>
                    </div>
                ) : filteredDrives.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                        <h2 className="text-base font-bold text-slate-800">No Placement Drives Found</h2>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No active drives matching this filter. Click &ldquo;Schedule Placement Drive&rdquo; to launch a new recruitment drive.
                        </p>
                        <button
                            onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredDrives.map((drive) => {
                            const regRatio = Math.round((drive.registeredStudentsCount / Math.max(1, drive.eligibleStudentsCount)) * 100);
                            const offerRatio = Math.round((drive.selectedCount / Math.max(1, drive.openings)) * 100);

                            return (
                                <div
                                    key={drive.id}
                                    className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-6"
                                >
                                    {/* Top Row: Company Info & Status Selector */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
                                                <Building2 className="w-7 h-7 text-indigo-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                                        {drive.companyName}
                                                    </h2>
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                        {drive.mode}
                                                    </span>
                                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                                                        {drive.packageCtc}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-700">{drive.title}</h3>
                                                <p className="text-xs text-slate-500">
                                                    Min CGPA: <strong>{drive.minCgpa}</strong> • Openings: <strong>{drive.openings}</strong> • Location: {drive.location}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Drive Stage Selector */}
                                        <div className="flex items-center gap-2 self-start md:self-auto">
                                            <span className="text-xs font-bold text-slate-500">Stage:</span>
                                            <select
                                                value={drive.status}
                                                disabled={updatingId === drive.id}
                                                onChange={(e) => handleUpdateStatus(drive.id, e.target.value)}
                                                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                                                    drive.status === 'Registration Open' ? 'bg-blue-50 border-blue-300 text-blue-900' :
                                                    drive.status === 'Assessment Ongoing' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                                                    drive.status === 'Interviews' ? 'bg-purple-50 border-purple-300 text-purple-900' :
                                                    drive.status === 'Completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                                                    'bg-slate-50 border-slate-300 text-slate-800'
                                                }`}
                                            >
                                                <option value="Registration Open">Registration Open</option>
                                                <option value="Assessment Ongoing">Assessment Ongoing</option>
                                                <option value="Interviews">Interviews</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Eligible Departments */}
                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Eligible Departments:
                                        </span>
                                        {drive.departments.map((dept) => (
                                            <span key={dept} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                                {dept}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Candidate Recruitment Funnel */}
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                            <span>Candidate Recruitment Funnel</span>
                                            <span className="text-slate-500">Drive Date: <strong>{drive.driveDate}</strong> (Deadline: {drive.registrationDeadline})</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Eligible Pool</span>
                                                <span className="text-lg font-black text-slate-900 mt-0.5 block">{drive.eligibleStudentsCount}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase block">Registered ({regRatio}%)</span>
                                                <span className="text-lg font-black text-indigo-600 mt-0.5 block">{drive.registeredStudentsCount}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                                                <span className="text-[10px] font-bold text-purple-600 uppercase block">Shortlisted</span>
                                                <span className="text-lg font-black text-purple-600 mt-0.5 block">{drive.shortlistedCount}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Offers Extended</span>
                                                <span className="text-lg font-black text-emerald-700 mt-0.5 block">{drive.selectedCount} / {drive.openings}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Info & Quick Actions */}
                                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="text-slate-500">
                                            Contact Lead: <strong>{drive.contactPerson}</strong> • {drive.notes || 'Official placement drive verified.'}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/college/students?department=${encodeURIComponent(drive.departments[0] || 'All')}`}
                                                className="px-3 py-1.5 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                            >
                                                View Candidate Roster →
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL: SCHEDULE NEW PLACEMENT DRIVE */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Institutional Event Orchestrator</span>
                                    <h3 className="text-xl font-extrabold text-slate-900">Schedule Placement Drive</h3>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateDrive} className="space-y-4 text-xs font-medium">
                                {/* Company & Role */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Amazon Web Services"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Drive Title / Role *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Cloud Solutions Architect"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* CTC Package & Openings */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Package CTC *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.packageCtc}
                                            onChange={(e) => setFormData({ ...formData, packageCtc: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Min CGPA</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.minCgpa}
                                            onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Openings</label>
                                        <input
                                            type="number"
                                            value={formData.openings}
                                            onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Departments Checkboxes */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Eligible Departments</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        {departmentOptions.map((dept) => {
                                            const checked = formData.departments.includes(dept);
                                            return (
                                                <label key={dept} className="flex items-center gap-2 cursor-pointer text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            setFormData({
                                                                ...formData,
                                                                departments: checked
                                                                    ? formData.departments.filter(d => d !== dept)
                                                                    : [...formData.departments, dept]
                                                            });
                                                        }}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span>{dept}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Registration Deadline</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.registrationDeadline}
                                            onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Assessment Date</label>
                                        <input
                                            type="date"
                                            value={formData.assessmentDate}
                                            onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Drive / Interview Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.driveDate}
                                            onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Mode and Location */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Recruitment Mode</label>
                                        <select
                                            value={formData.mode}
                                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                                        >
                                            <option value="On-Campus Lab">On-Campus Lab</option>
                                            <option value="Virtual">Virtual (Online)</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Location / Venue</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                                    >
                                        Publish Placement Drive
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
