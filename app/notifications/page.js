'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    Bell, CheckCircle2, ShieldCheck, Zap, Award, Send,
    Megaphone, Filter, Check, Clock, ExternalLink, RefreshCw,
    AlertCircle, Sparkles, Plus, Users
} from 'lucide-react';

export default function NotificationsPage() {
    const { user, profile, role } = useAuth();
    const currentRole = role || 'student';
    const userId = user?.id || profile?.id || 'u_student_1';

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [unreadOnly, setUnreadOnly] = useState(false);

    // Broadcast Modal (Admin only)
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        message: '',
        targetRoles: ['student', 'company', 'college'],
        priority: 'HIGH',
        link: ''
    });

    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            let url = `/api/notifications?`;
            if (categoryFilter !== 'All') url += `category=${encodeURIComponent(categoryFilter)}&`;
            if (unreadOnly) url += `unread=true`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [categoryFilter, unreadOnly]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId })
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true })
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                showToast('All notifications marked as read.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broadcast: true,
                    ...broadcastData
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`📢 Broadcast sent to [${broadcastData.targetRoles.join(', ')}]!`);
                setIsBroadcastModalOpen(false);
                setBroadcastData({
                    title: '',
                    message: '',
                    targetRoles: ['student', 'company', 'college'],
                    priority: 'HIGH',
                    link: ''
                });
                await loadNotifications();
            } else {
                showToast(data.error || 'Failed to dispatch broadcast.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error dispatching broadcast.', 'error');
        }
    };

    const categories = ['All', 'HIRING', 'ASSESSMENT', 'CAMPUS_DRIVE', 'SECURITY', 'SYSTEM_BROADCAST'];

    return (
        <div className="min-h-screen bg-slate-50 py-8 text-slate-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

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

                {/* Header Banner */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 flex items-center gap-1.5">
                                <Bell className="w-4 h-4 text-primary-600" />
                                Notifications & Activity Hub
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <span>Platform Activity Feed</span>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-primary-600 text-white">
                                        {unreadCount} Unread
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Real-time updates on candidate applications, verified assessment results, scheduled placement drives, and system alerts.
                            </p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Mark All as Read</span>
                                </button>
                            )}

                            {/* Admin Broadcast Trigger */}
                            {currentRole === 'admin' && (
                                <button
                                    onClick={() => setIsBroadcastModalOpen(true)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
                                >
                                    <Megaphone className="w-3.5 h-3.5" />
                                    <span>Broadcast Announcement</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        categoryFilter === cat
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat === 'SYSTEM_BROADCAST' ? 'ANNOUNCEMENTS' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Unread Only Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                            <input
                                type="checkbox"
                                checked={unreadOnly}
                                onChange={(e) => setUnreadOnly(e.target.checked)}
                                className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            <span>Unread Only</span>
                        </label>
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-500">Checking notifications stream...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">You&apos;re All Caught Up!</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No notifications matching the selected filter. Activity updates will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex items-start gap-4 ${
                                    !item.read
                                        ? 'border-primary-300 bg-primary-50/15 ring-1 ring-primary-100'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {/* Category Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                                    item.category === 'HIRING' ? 'bg-indigo-100 text-indigo-700' :
                                    item.category === 'ASSESSMENT' ? 'bg-emerald-100 text-emerald-700' :
                                    item.category === 'CAMPUS_DRIVE' ? 'bg-purple-100 text-purple-700' :
                                    item.category === 'SECURITY' ? 'bg-rose-100 text-rose-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {item.category === 'HIRING' ? <Send className="w-5 h-5" /> :
                                     item.category === 'ASSESSMENT' ? <Award className="w-5 h-5" /> :
                                     item.category === 'CAMPUS_DRIVE' ? <Zap className="w-5 h-5" /> :
                                     item.category === 'SECURITY' ? <ShieldCheck className="w-5 h-5" /> :
                                     <Megaphone className="w-5 h-5" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className={`text-sm tracking-tight ${!item.read ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                                                {item.title}
                                            </h3>
                                            {!item.read && (
                                                <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {item.message}
                                    </p>

                                    {/* Action Links & Footer */}
                                    <div className="pt-2 flex items-center justify-between text-xs">
                                        {item.link ? (
                                            <Link
                                                href={item.link}
                                                className="font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                            >
                                                <span>View Details →</span>
                                            </Link>
                                        ) : <div />}

                                        {!item.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(item.id)}
                                                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODAL: BROADCAST ANNOUNCEMENT (Admin Only) */}
                {isBroadcastModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Admin Announcement Center</span>
                                    <h3 className="text-xl font-extrabold text-slate-900">Broadcast Announcement</h3>
                                </div>
                                <button
                                    onClick={() => setIsBroadcastModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-medium">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Announcement Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mandatory System Maintenance / New Drive Open"
                                        value={broadcastData.title}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Message Body *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Detailed announcement content..."
                                        value={broadcastData.message}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Target Roles</label>
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        {['student', 'company', 'college'].map((r) => {
                                            const checked = broadcastData.targetRoles.includes(r);
                                            return (
                                                <label key={r} className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            setBroadcastData({
                                                                ...broadcastData,
                                                                targetRoles: checked
                                                                    ? broadcastData.targetRoles.filter(role => role !== r)
                                                                    : [...broadcastData.targetRoles, r]
                                                            });
                                                        }}
                                                        className="rounded text-indigo-600"
                                                    />
                                                    <span className="capitalize">{r}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Target Deep Link (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="/jobs or /college/placement-drives"
                                        value={broadcastData.link}
                                        onChange={(e) => setBroadcastData({ ...broadcastData, link: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsBroadcastModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                                    >
                                        Dispatch Broadcast Announcement
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
