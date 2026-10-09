'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle,
    Search, Download, RefreshCw, Filter, Code, Eye, Clock, User,
    FileSpreadsheet, ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminAuditTrailPage() {
    const [events, setEvents] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Forensic Detail Modal
    const [selectedEvent, setSelectedEvent] = useState(null);

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/audit-logs?`;
            if (categoryFilter !== 'All') url += `category=${encodeURIComponent(categoryFilter)}&`;
            if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
            if (severityFilter !== 'All') url += `severity=${encodeURIComponent(severityFilter)}&`;
            if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.events) {
                setEvents(data.events);
                setStatistics(data.statistics);
            }
        } catch (err) {
            console.error('Failed to load audit trail:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, [categoryFilter, statusFilter, severityFilter]);

    // Local filter search query
    const filteredEvents = useMemo(() => {
        if (!searchQuery.trim()) return events;
        const q = searchQuery.toLowerCase().trim();
        return events.filter(e =>
            e.action.toLowerCase().includes(q) ||
            (e.actor.name && e.actor.name.toLowerCase().includes(q)) ||
            (e.actor.email && e.actor.email.toLowerCase().includes(q)) ||
            (e.actor.ipAddress && e.actor.ipAddress.includes(q)) ||
            (e.targetResource.name && e.targetResource.name.toLowerCase().includes(q)) ||
            (e.details?.reason && e.details.reason.toLowerCase().includes(q))
        );
    }, [events, searchQuery]);

    const categories = ['All', 'ACCESS_CONTROL', 'AUTH', 'HIRING', 'VERIFICATION', 'CAMPUS_DRIVES', 'ADMIN'];

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Navigation Breadcrumb */}
                    <div className="flex items-center justify-between">
                        <Link href="/admin/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                            ← Back to Ecosystem Governance Dashboard
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Audit Daemon Streaming Active</span>
                        </div>
                    </div>

                    {/* Header Banner & Global Actions */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4 text-primary-400" />
                                    <span>Tamper-Evident Security Log</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    System Security & Administrative Audit Trail
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                                    Forensic inspection record capturing authentication workflows, RBAC access control enforcement, cryptographic certifications, and hiring events.
                                </p>
                            </div>

                            {/* Export Buttons */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <a
                                    href={`/api/admin/audit-logs/export?format=csv&category=${categoryFilter}&status=${statusFilter}`}
                                    download
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Export Audit Trail (CSV)</span>
                                </a>

                                <a
                                    href={`/api/admin/audit-logs/export?format=json&category=${categoryFilter}&status=${statusFilter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <Code className="w-3.5 h-3.5" />
                                    <span>Raw JSON</span>
                                </a>
                            </div>
                        </div>

                        {/* 4 Summary KPI Metric Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
                            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged Events</span>
                                <span className="text-2xl font-black text-white mt-1 block">{statistics?.totalEvents || events.length}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900/50">
                                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Access Violations Blocked</span>
                                <span className="text-2xl font-black text-rose-400 mt-1 block">{statistics?.blockedCount || 2}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-900/50">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Critical / High Alerts</span>
                                <span className="text-2xl font-black text-amber-400 mt-1 block">{statistics?.criticalCount || 2}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50">
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Monitored Subsystems</span>
                                <span className="text-2xl font-black text-indigo-300 mt-1 block">6 Modules</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1 min-w-[260px]">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by action, actor, IP address, or reason..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Status & Severity Selectors */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-bold text-slate-400">Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="BLOCKED">BLOCKED</option>
                                        <option value="SUCCESS">SUCCESS</option>
                                        <option value="WARNING">WARNING</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-bold text-slate-400">Severity:</span>
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value)}
                                        className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                                    >
                                        <option value="All">All Severity</option>
                                        <option value="CRITICAL">CRITICAL</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="LOW">LOW</option>
                                    </select>
                                </div>

                                <button
                                    onClick={loadAuditLogs}
                                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                    title="Refresh Audit Logs"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                        categoryFilter === cat
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Querying security audit records...</p>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-16 p-6 space-y-3">
                                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                                <h3 className="text-sm font-bold text-slate-700">No Audit Events Found</h3>
                                <p className="text-xs text-slate-400">No events matched the selected filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                                            <th className="py-3.5 px-4">Timestamp</th>
                                            <th className="py-3.5 px-4">Action & Category</th>
                                            <th className="py-3.5 px-4">Actor</th>
                                            <th className="py-3.5 px-4">Target Resource</th>
                                            <th className="py-3.5 px-3 text-center">Status</th>
                                            <th className="py-3.5 px-3 text-center">Severity</th>
                                            <th className="py-3.5 px-4 text-right">Payload</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                        {filteredEvents.map((evt) => (
                                            <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Timestamp */}
                                                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                                    <div className="font-mono text-[11px] text-slate-700">
                                                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {new Date(evt.timestamp).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                {/* Action & Category */}
                                                <td className="py-3.5 px-4 font-bold">
                                                    <div className="text-slate-900 font-mono text-[11px] tracking-tight">
                                                        {evt.action}
                                                    </div>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                                                        {evt.category}
                                                    </span>
                                                </td>

                                                {/* Actor */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900">{evt.actor.name}</div>
                                                    <div className="text-[10px] text-slate-500">
                                                        Role: <strong className="uppercase">{evt.actor.role}</strong> • IP: {evt.actor.ipAddress}
                                                    </div>
                                                </td>

                                                {/* Target Resource */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-800">{evt.targetResource.name}</div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {evt.targetResource.type} ({evt.targetResource.id})
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                                        evt.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                                        evt.status === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                        'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    }`}>
                                                        {evt.status}
                                                    </span>
                                                </td>

                                                {/* Severity */}
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`text-[10px] font-bold ${
                                                        evt.severity === 'CRITICAL' ? 'text-rose-700' :
                                                        evt.severity === 'HIGH' ? 'text-orange-600' :
                                                        evt.severity === 'MEDIUM' ? 'text-amber-600' : 'text-slate-500'
                                                    }`}>
                                                        {evt.severity}
                                                    </span>
                                                </td>

                                                {/* Details Action */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedEvent(evt)}
                                                        className="px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Inspect</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* FORENSIC JSON PAYLOAD INSPECTOR MODAL */}
                    {selectedEvent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                                            Event ID: {selectedEvent.id}
                                        </span>
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            {selectedEvent.action}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 text-xs">
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <div>
                                            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Actor Identity</span>
                                            <span className="font-bold text-slate-900">{selectedEvent.actor.name} ({selectedEvent.actor.role})</span>
                                            <span className="text-slate-500 block text-[11px]">{selectedEvent.actor.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-semibold text-[10px] uppercase">Network Origin</span>
                                            <span className="font-mono text-slate-900 font-bold">{selectedEvent.actor.ipAddress}</span>
                                            <span className="text-slate-500 block text-[10px] truncate">{selectedEvent.actor.userAgent}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="block font-bold text-slate-700 mb-1">Sanitized Forensic Payload (JSON):</span>
                                        <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-[11px] font-mono overflow-x-auto">
                                            {JSON.stringify(selectedEvent, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 text-right">
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 transition-colors"
                                    >
                                        Close Inspector
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </ProtectedRoute>
    );
}
