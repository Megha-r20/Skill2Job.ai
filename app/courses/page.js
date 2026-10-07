'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Search, Clock, ArrowRight, Star, Sparkles, BookOpen } from 'lucide-react';

export default function CoursesCatalogPage() {
    const { profile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadCourses() {
            setLoading(true);
            try {
                let url = '/api/courses';
                if (selectedCategory !== 'All')
                    url += `?category=${encodeURIComponent(selectedCategory)}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.courses) {
                    let list = data.courses;
                    if (searchQuery) {
                        list = list.filter((c) =>
                            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (c.targetSkills && c.targetSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())))
                        );
                    }
                    setCourses(list);
                }
            }
            catch (e) {
                console.error('Error loading courses:', e);
            }
            finally {
                setLoading(false);
            }
        }
        loadCourses();
    }, [selectedCategory, searchQuery]);

    const categories = ['All', 'Programming', 'Data Structures', 'Databases', 'Web Development', 'Cloud'];

    return (
        <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header (Section 21) */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 space-y-6">
                    <div className="max-w-3xl space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Free In-Platform Learning Hub</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                            Master High-Demand Tech Skills for Free
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Zero external redirects. Learn directly inside Skill2Hire with interactive notes, runnable code examples, practice questions, and skill verification assessments.
                        </p>
                    </div>

                    {/* Search & Categories */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
                        <div className="relative w-full sm:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            <input
                                type="text"
                                placeholder="Search Python, DSA, SQL, AWS, React..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md'
                                            : 'bg-white/10 dark:bg-slate-900/90 text-slate-200 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-slate-800 border border-white/10 dark:border-slate-800'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div>
                    {loading ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 transition-colors">
                            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading structured courses...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => {
                                const level = course.level || 'Intermediate';
                                const rating = course.rating || 4.9;
                                const duration = course.duration || (course.durationHours ? `${course.durationHours} Hours` : '24 Hours');
                                const skills = course.targetSkills || course.tags || [course.category || 'Tech'];
                                const thumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c7a3607?w=800&auto=format&fit=crop&q=80';

                                return (
                                    <div
                                        key={course.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-xl dark:hover:shadow-primary-950/20 transition-all flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Course Thumbnail Banner */}
                                            <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                                                <img
                                                    src={thumbnail}
                                                    alt={course.title}
                                                    onError={(e) => {
                                                        // Graceful fallback if unsplash is blocked
                                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1516116211227-bbc13c7a3607?w=800&auto=format&fit=crop&q=80';
                                                    }}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                                                <div className="absolute top-3 left-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/85 text-white backdrop-blur-md border border-white/10 shadow-sm">
                                                        {level}
                                                    </span>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1 shadow-sm backdrop-blur-md">
                                                        <Star className="w-3 h-3 fill-white" /> {rating}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Course Info */}
                                            <div className="p-6 space-y-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider text-[11px]">
                                                        {course.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                                                        <Clock className="w-3.5 h-3.5" /> {duration}
                                                    </span>
                                                </div>

                                                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                    {course.title}
                                                </h2>

                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {course.description}
                                                </p>

                                                {/* Target Skills */}
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {skills.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="text-[10px] px-2.5 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200/50 dark:border-primary-800/40"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="p-6 pt-0">
                                            <Link
                                                href={`/courses/${course.id}/learn`}
                                                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 group-hover:bg-primary-600 dark:group-hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <span>Start Learning for Free</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RECOMMENDED YOUTUBE TUTORIALS & MASTERCLASSES */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 flex items-center gap-1">
                                    <svg className="w-3 h-3 fill-red-600" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    YouTube Masterclasses
                                </span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">• High Demand Video Lessons</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                                Recommended Placement Video Tutorials
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Handpicked full-length crash courses and interview guides directly playable in high definition.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Python for Beginners – Full Course [Programming Tutorial]',
                                channel: 'freeCodeCamp.org',
                                views: '45M views',
                                duration: '4h 26m',
                                videoId: 'kqtD5dpn9C8',
                                category: 'Python',
                                badge: 'Top Rated'
                            },
                            {
                                title: 'Data Structures and Algorithms in 15 Minutes [Crash Course]',
                                channel: 'CS Dojo / NeetCode',
                                views: '12M views',
                                duration: '5h 15m',
                                videoId: '8hly31xKli0',
                                category: 'DSA',
                                badge: 'Interview Prep'
                            },
                            {
                                title: 'SQL Tutorial - Full Database Course for Beginners',
                                channel: 'freeCodeCamp.org',
                                views: '18M views',
                                duration: '4h 20m',
                                videoId: 'HXV3zeRR3h4',
                                category: 'SQL',
                                badge: 'Database'
                            },
                            {
                                title: 'C++ Programming Course - Beginner to Advanced',
                                channel: 'FreeCodeCamp / The Cherno',
                                views: '9.2M views',
                                duration: '6h 10m',
                                videoId: 'vLnPwxZdW4Y',
                                category: 'C++',
                                badge: 'Systems'
                            },
                            {
                                title: 'Java Full Course for Beginners [2026 Edition]',
                                channel: 'Programming with Mosh',
                                views: '14M views',
                                duration: '4h 00m',
                                videoId: 'A74TOX803D0',
                                category: 'Java',
                                badge: 'OOP'
                            },
                            {
                                title: 'AWS Certified Cloud Practitioner - Full Course',
                                channel: 'freeCodeCamp.org',
                                views: '7.8M views',
                                duration: '13h 40m',
                                videoId: '3hLmDS179YE',
                                category: 'Cloud',
                                badge: 'AWS Certified'
                            }
                        ].map((video) => (
                            <div
                                key={video.videoId}
                                className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md flex flex-col justify-between group hover:border-cyan-500/50 transition-all"
                            >
                                <div>
                                    <div className="relative aspect-video w-full bg-black overflow-hidden">
                                        <iframe
                                            className="w-full h-full border-0"
                                            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1`}
                                            title={video.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>

                                    <div className="p-5 space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-bold text-cyan-400">{video.category}</span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                                {video.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                                            {video.title}
                                        </h3>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                                            <span>{video.channel}</span>
                                            <span>{video.views}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 pt-0">
                                    <Link
                                        href={`/courses/crs_${video.category.toLowerCase()}/learn`}
                                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <span>Open Interactive Practice Sandbox</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
