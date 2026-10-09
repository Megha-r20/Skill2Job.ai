'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Users, Search, CheckCircle2, XCircle, Calendar, Clock, Video,
    Sparkles, ArrowRight, ShieldCheck, Mail, Check, AlertCircle,
    UserCheck, ChevronDown, ExternalLink, RefreshCw, Layers, Award
} from 'lucide-react';

export default function RecruiterApplicationsPage() {
    const { profile } = useAuth();
    const companyId = profile?.id || 'comp_1';

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAppIds, setSelectedAppIds] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Toast message state
    const [toast, setToast] = useState(null);

    // Interview Scheduling Modal state
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleTargetApp, setScheduleTargetApp] = useState(null); // null if bulk
    const [scheduleFormData, setScheduleFormData] = useState({
        roundType: 'Round 1: Technical Coding & DSA',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        time: '14:30',
        timezone: 'IST (UTC+5:30)',
        format: 'Google Meet',
        meetingLink: 'https://meet.google.com/s2h-tech-interview',
        interviewers: 'Technical Interview Panel',
        notes: 'Live technical problem solving and architecture review.'
    });

    const showToast = (text, type = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 5000);
    };

    const loadApplications = async () => {
        setLoading(true);
        try {
            let url = `/api/recruiter/applications?companyId=${companyId}`;
            if (statusFilter !== 'All') url += `&status=${statusFilter}`;
            if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.applications) {
                setApplications(data.applications);
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to load candidate applications.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApplications();
    }, [companyId, statusFilter]);

    // Handle single status update
    const handleUpdateStatus = async (appId, newStatus, customNotes) => {
        setUpdatingId(appId);
        try {
            const targetApp = applications.find(a => a.id === appId);
            const notes = customNotes || `Candidate progressed to ${newStatus} based on verified skills evaluation.`;

            const res = await fetch('/api/recruiter/applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId,
                    applicationId: appId,
                    status: newStatus,
                    notes
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`🎉 ${targetApp?.studentName || 'Candidate'} moved to ${newStatus}. Notification email sent to ${targetApp?.studentEmail || 'candidate'}.`, 'success');
                await loadApplications();
            } else {
                showToast(data.error || 'Failed to update application status.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Network error while updating status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedAppIds.length === filteredApplications.length) {
            setSelectedAppIds([]);
        } else {
            setSelectedAppIds(filteredApplications.map(a => a.id));
        }
    };

    const toggleSelectApp = (appId) => {
        setSelectedAppIds(prev =>
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        );
    };

    // Bulk status update action
    const handleBulkStatusChange = async (targetStatus) => {
        if (selectedAppIds.length === 0) return;
        setIsBulkProcessing(true);

        try {
            const res = await fetch('/api/recruiter/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bulk_status',
                    companyId,
                    applicationIds: selectedAppIds,
                    status: targetStatus,
                    notes: `Bulk progression to ${targetStatus} via Recruiter Pipeline Manager.`
                })
            });

            const data = await res.json();
            if (data.success) {
                showToast(`⚡ ${data.count} candidates moved to ${targetStatus}. Dispatched ${data.emailsDispatched} notification emails.`, 'success');
                setSelectedAppIds([]);
                await loadApplications();
            } else {
                showToast(data.error || 'Failed to execute bulk action.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Network error executing bulk action.', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Open Interview Scheduling Modal
    const openScheduleModal = (app = null) => {
        setScheduleTargetApp(app);
        if (app && app.interviewSchedule) {
            setScheduleFormData({
                roundType: app.interviewSchedule.roundType || 'Round 1: Technical Coding & DSA',
                date: app.interviewSchedule.date || new Date().toISOString().split('T')[0],
                time: app.interviewSchedule.time || '14:30',
                timezone: app.interviewSchedule.timezone || 'IST (UTC+5:30)',
                format: app.interviewSchedule.format || 'Google Meet',
                meetingLink: app.interviewSchedule.meetingLink || 'https://meet.google.com/s2h-interview',
                interviewers: app.interviewSchedule.interviewers || 'Technical Hiring Panel',
                notes: app.interviewSchedule.notes || 'Technical interview round.'
            });
        } else {
            setScheduleFormData({
                roundType: 'Round 1: Technical Coding & DSA',
                date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                time: '14:30',
                timezone: 'IST (UTC+5:30)',
                format: 'Google Meet',
                meetingLink: `https://meet.google.com/s2h-${Math.random().toString(36).substring(2, 6)}-meet`,
                interviewers: 'Technical Interview Panel',
                notes: 'Live coding and problem solving on verified core skills.'
            });
        }
        setIsScheduleModalOpen(true);
    };

    // Submit Interview Scheduling
    const handleSubmitSchedule = async (e) => {
        e.preventDefault();
        setIsBulkProcessing(true);

        try {
            if (scheduleTargetApp) {
                // Single candidate interview schedule
                const res = await fetch('/api/recruiter/interviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        companyId,
                        applicationId: scheduleTargetApp.id,
                        ...scheduleFormData
                    })
                });

                const data = await res.json();
                if (data.success) {
                    showToast(`📅 Interview scheduled for ${scheduleTargetApp.studentName}. Invitation email dispatched to ${scheduleTargetApp.studentEmail}.`, 'success');
                    setIsScheduleModalOpen(false);
                    await loadApplications();
                } else {
                    showToast(data.error || 'Failed to schedule interview.', 'error');
                }
            } else {
                // Bulk interview schedule
                const res = await fetch('/api/recruiter/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'bulk_status',
                        companyId,
                        applicationIds: selectedAppIds,
                        status: 'Interview',
                        notes: `Interview scheduled: ${scheduleFormData.roundType}`,
                        interviewSchedule: scheduleFormData
                    })
                });

                const data = await res.json();
                if (data.success) {
                    showToast(`📅 Interviews scheduled for ${data.count} candidates. Calendar invites emailed.`, 'success');
                    setIsScheduleModalOpen(false);
                    setSelectedAppIds([]);
                    await loadApplications();
                } else {
                    showToast(data.error || 'Failed to schedule interviews in bulk.', 'error');
                }
            }
        } catch (e) {
            console.error(e);
            showToast('Network error while scheduling interview.', 'error');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Filter applications locally by search query
    const filteredApplications = useMemo(() => {
        if (!searchQuery.trim()) return applications;
        const q = searchQuery.toLowerCase().trim();
        return applications.filter(app =>
            (app.studentName && app.studentName.toLowerCase().includes(q)) ||
            (app.jobTitle && app.jobTitle.toLowerCase().includes(q)) ||
            (app.studentCollege && app.studentCollege.toLowerCase().includes(q))
        );
    }, [applications, searchQuery]);

    const stages = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected'];

    return (
        <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Toast Notification Banner */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
                        toast.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                        {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        <span className="text-xs sm:text-sm font-bold">{toast.text}</span>
                        <button onClick={() => setToast(null)} className="ml-2 text-xs font-bold opacity-60 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Navigation Breadcrumb */}
                <div className="flex items-center justify-between">
                    <Link href="/recruiter/dashboard" className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1">
                        ← Back to Recruiter Hub
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Real-Time Candidate Pipeline Active</span>
                    </div>
                </div>

                {/* Header & Search / Filter Hub */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-primary-600" />
                                Candidate Pipeline & Hiring Actions
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Review, Shortlist & Schedule Applicants
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Evaluate candidates backed by verified skill assessments. Perform instant individual & bulk actions with automated email notifications.
                            </p>
                        </div>

                        {/* Search Input Bar */}
                        <div className="relative min-w-[280px] sm:min-w-[340px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search candidate, role, or college..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Quick Stage Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                                statusFilter === 'All' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All ({applications.length})
                        </button>
                        {stages.map((st) => {
                            const count = applications.filter(a => a.status.toLowerCase() === st.toLowerCase()).length;
                            return (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        statusFilter === st
                                            ? 'bg-primary-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    <span>{st}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                        statusFilter === st ? 'bg-primary-700 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bulk Actions Floating Bar */}
                {selectedAppIds.length > 0 && (
                    <div className="sticky top-4 z-40 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm">
                                {selectedAppIds.length}
                            </span>
                            <div>
                                <h4 className="text-sm font-extrabold text-white">Candidates Selected for Bulk Actions</h4>
                                <p className="text-[11px] text-slate-300">
                                    Changes will automatically trigger candidate email notifications.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                disabled={isBulkProcessing}
                                onClick={() => handleBulkStatusChange('Shortlisted')}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Bulk Shortlist</span>
                            </button>

                            <button
                                disabled={isBulkProcessing}
                                onClick={() => openScheduleModal(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Bulk Schedule Interview</span>
                            </button>

                            <button
                                disabled={isBulkProcessing}
                                onClick={() => handleBulkStatusChange('Rejected')}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors"
                            >
                                Bulk Reject
                            </button>

                            <button
                                onClick={() => setSelectedAppIds([])}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}

                {/* Candidate Selection Summary Bar */}
                <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={filteredApplications.length > 0 && selectedAppIds.length === filteredApplications.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
                        />
                        <span>
                            Select All ({filteredApplications.length} candidates)
                        </span>
                    </div>

                    <button
                        onClick={loadApplications}
                        className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh List</span>
                    </button>
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-600">Loading candidate applications & verified skills...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                        <Users className="w-12 h-12 text-slate-300 mx-auto" />
                        <h2 className="text-base font-bold text-slate-800">No Applicants Found</h2>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No candidate matches the current stage or search filters. Clear filters to view all applicants in your pipeline.
                        </p>
                        <button
                            onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-primary-600 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredApplications.map((app) => {
                            const isSelected = selectedAppIds.includes(app.id);
                            const hasInterview = Boolean(app.interviewSchedule);

                            return (
                                <div
                                    key={app.id}
                                    className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all shadow-sm space-y-6 ${
                                        isSelected ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/10' : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Top Card Bar: Selection Checkbox & Main Candidate Profile */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectApp(app.id)}
                                                className="w-4 h-4 mt-1.5 rounded text-primary-600 border-slate-300 focus:ring-primary-500 cursor-pointer"
                                            />

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                                        {app.studentName}
                                                    </h2>
                                                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3 text-emerald-600" />
                                                        {app.matchPercentage}% Job Compatibility
                                                    </span>
                                                    {app.student?.cgpa && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                                                            CGPA: {app.student.cgpa}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500">
                                                    {app.studentCollege} • Applied for <strong className="text-slate-800">{app.jobTitle}</strong> on {new Date(app.appliedAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-slate-400 font-mono">
                                                    Candidate Email: {app.studentEmail}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stage Selector Dropdown */}
                                        <div className="flex items-center gap-2 self-start md:self-auto">
                                            <span className="text-xs font-bold text-slate-500">Hiring Stage:</span>
                                            <select
                                                value={app.status}
                                                disabled={updatingId === app.id}
                                                onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
                                                    app.status === 'Shortlisted' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' :
                                                    app.status === 'Interview' ? 'bg-blue-50 border-blue-300 text-blue-900' :
                                                    app.status === 'Selected' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                                                    app.status === 'Rejected' ? 'bg-rose-50 border-rose-300 text-rose-900' :
                                                    'bg-slate-50 border-slate-300 text-slate-800'
                                                }`}
                                            >
                                                {stages.map((st) => (
                                                    <option key={st} value={st}>{st}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Candidate Verified Skills Strip */}
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                Cryptographic Verified Skills Passport:
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400">
                                                Audited by Proctored Engine
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {app.verifiedSkills?.length > 0 ? (
                                                app.verifiedSkills.map((vs) => (
                                                    <span key={vs.skillName} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                                        <Check className="w-3 h-3 text-emerald-700" />
                                                        {vs.skillName} ({vs.level}) • {vs.score}%
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">
                                                    Candidate in verification queue (Python, SQL, DSA self-declared).
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scheduled Interview Banner (if interview details exist) */}
                                    {hasInterview && (
                                        <div className="p-4 sm:p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-700" />
                                                    <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                                                        Scheduled Interview: {app.interviewSchedule.roundType}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => openScheduleModal(app)}
                                                    className="text-xs font-bold text-blue-700 hover:text-blue-900 underline self-start sm:self-auto"
                                                >
                                                    Reschedule Interview
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                    <span><strong>{app.interviewSchedule.date}</strong> at {app.interviewSchedule.time} ({app.interviewSchedule.timezone || 'IST'})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Video className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Format: <strong>{app.interviewSchedule.format}</strong></span>
                                                </div>
                                                <div>
                                                    {app.interviewSchedule.meetingLink && (
                                                        <a
                                                            href={app.interviewSchedule.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-primary-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>Join Meeting Room</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {app.interviewSchedule.notes && (
                                                <p className="text-[11px] text-slate-500 italic">
                                                    Agenda: &ldquo;{app.interviewSchedule.notes}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Bottom Card Actions: Quick 1-Click Operations */}
                                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 font-semibold">Candidate ID: {app.studentId}</span>
                                            <Link
                                                href={`/college/students/${app.studentId}/report`}
                                                className="font-bold text-primary-600 hover:underline flex items-center gap-1"
                                            >
                                                <span>Official Academic Transcript →</span>
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Shortlist Action */}
                                            {app.status !== 'Shortlisted' && (
                                                <button
                                                    disabled={updatingId === app.id}
                                                    onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                                                    className="px-3.5 py-1.5 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Shortlist Candidate</span>
                                                </button>
                                            )}

                                            {/* Interview Scheduling Button */}
                                            <button
                                                onClick={() => openScheduleModal(app)}
                                                className="px-3.5 py-1.5 rounded-xl font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
                                            >
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{hasInterview ? 'Modify Interview' : 'Schedule Interview'}</span>
                                            </button>

                                            {/* Select for Hire Action */}
                                            {app.status !== 'Selected' && (
                                                <button
                                                    disabled={updatingId === app.id}
                                                    onClick={() => handleUpdateStatus(app.id, 'Selected', 'Offer extended following exceptional technical review.')}
                                                    className="px-3.5 py-1.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                                                >
                                                    <span>Select for Hire 🎉</span>
                                                </button>
                                            )}

                                            {/* Reject Action */}
                                            {app.status !== 'Rejected' && (
                                                <button
                                                    disabled={updatingId === app.id}
                                                    onClick={() => handleUpdateStatus(app.id, 'Rejected', 'Application archived for this cycle.')}
                                                    className="px-2.5 py-1.5 rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* INTERVIEW SCHEDULING MODAL */}
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                                        Interview Orchestrator
                                    </span>
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        {scheduleTargetApp
                                            ? `Schedule Interview: ${scheduleTargetApp.studentName}`
                                            : `Schedule Bulk Interview (${selectedAppIds.length} Candidates)`}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitSchedule} className="space-y-4 text-xs font-medium">
                                {/* Round Type */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Interview Round</label>
                                    <select
                                        value={scheduleFormData.roundType}
                                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, roundType: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="Round 1: Technical Coding & DSA">Round 1: Technical Coding & DSA</option>
                                        <option value="Round 2: System Architecture & Web APIs">Round 2: System Architecture & Web APIs</option>
                                        <option value="Round 3: Behavioral & Culture Fit">Round 3: Behavioral & Culture Fit</option>
                                        <option value="Final Executive / HR Discussion">Final Executive / HR Discussion</option>
                                    </select>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={scheduleFormData.date}
                                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Time (24h)</label>
                                        <input
                                            type="time"
                                            required
                                            value={scheduleFormData.time}
                                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>

                                {/* Format & Platform */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Format</label>
                                    <select
                                        value={scheduleFormData.format}
                                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, format: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="Google Meet">Google Meet</option>
                                        <option value="Zoom Meeting">Zoom Meeting</option>
                                        <option value="Microsoft Teams">Microsoft Teams</option>
                                        <option value="On-Campus Lab">On-Campus Lab / In-Person</option>
                                        <option value="Phone Call">Phone Screening</option>
                                    </select>
                                </div>

                                {/* Meeting Link */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Meeting Link / Room URL</label>
                                    <input
                                        type="url"
                                        value={scheduleFormData.meetingLink}
                                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Interviewers */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Interviewer(s)</label>
                                    <input
                                        type="text"
                                        value={scheduleFormData.interviewers}
                                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, interviewers: e.target.value })}
                                        placeholder="Dr. Aris Thorne (Staff Engineer)"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                {/* Agenda & Notes */}
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Preparation & Agenda Notes</label>
                                    <textarea
                                        rows={2}
                                        value={scheduleFormData.notes}
                                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                                        placeholder="Specific instructions, technical stack to prepare, or expectations..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsScheduleModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isBulkProcessing}
                                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-md shadow-primary-600/20"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>Dispatch Calendar Invite & Update Stage</span>
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
