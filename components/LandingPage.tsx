'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Skill2HireLogo from '@/components/Skill2HireLogo';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  CheckCircle2,
  BrainCircuit,
  Target,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'college' | 'company'>('student');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-primary-600/20 via-cyan-500/20 to-purple-600/20 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-cyan-600/10 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-[1600px] left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

      {/* 🧭 Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Skill2HireLogo variant="full" size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Platform Features</a>
            <a href="#solutions" className="hover:text-cyan-400 transition-colors">Role Solutions</a>
            <a href="#ai-engine" className="hover:text-cyan-400 transition-colors">AI Skill Matcher</a>
            <a href="#impact" className="hover:text-cyan-400 transition-colors">Impact & Stats</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Generation Career & Recruitment Platform</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Bridge the Gap Between <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Academic Skills & Industry Jobs
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Skill2Job.ai connects Students, Colleges, and Enterprise Recruiters using AI-driven resume analysis, skill-gap detection, and verified match scoring.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Portal & Sign In</span>
          </Link>
          <a
            href="#ai-engine"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>Explore AI Match Engine</span>
          </a>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden text-left space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Skill2Job.ai Match Analytics</h3>
                  <p className="text-xs text-slate-400">Real-time candidate profile alignment for Full-Stack AI Engineer</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                94% Target Match Score
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skill Verification</div>
                <div className="text-xl font-black text-cyan-400">92 / 100</div>
                <div className="text-[11px] text-slate-500">React, TS, Node verified</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Probability</div>
                <div className="text-xl font-black text-emerald-400">86% Likelihood</div>
                <div className="text-[11px] text-slate-500">Tier-1 candidate readiness</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skill Gap Priority</div>
                <div className="text-xl font-black text-purple-400">Docker (12h)</div>
                <div className="text-[11px] text-slate-500">Recommended action item</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Interview Score</div>
                <div className="text-xl font-black text-blue-400">88 / 100</div>
                <div className="text-[11px] text-slate-500">Clear technical articulation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ 3 Role Solutions Section */}
      <section id="solutions" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Solutions for Every Ecosystem Partner
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Discover specialized features built explicitly for Students, Academic Institutions, and Corporate Hiring Leads.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3">
          {[
            { id: 'student', label: 'For Students', icon: GraduationCap },
            { id: 'college', label: 'For Colleges & TPOs', icon: Building2 },
            { id: 'company', label: 'For Recruiters', icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Card Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === 'student' && (
            <>
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Resume Analysis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extract skill profiles instantly from PDF resumes using Gemini AI and benchmark yourself against target job descriptions.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Personalized Skill Roadmaps</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get a tailored 6-week learning plan designed to close critical skill gaps and boost your campus placement probability.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Mock AI Interview Prep</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Practice technical and behavioral interview questions with real-time feedback on clarity, relevance, and accuracy.
                </p>
              </div>
            </>
          )}

          {activeTab === 'college' && (
            <>
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Cohort Skill Heatmaps</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track institution-wide skill readiness across departments, batches, and semesters in interactive analytics dashboards.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Curriculum Gap Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compare academic syllabi with real-time market demand to introduce modern bootcamps and elective courses.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Campus Placement Drives</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Streamline corporate campus drives by sharing verified candidate profiles directly with hiring partners.
                </p>
              </div>
            </>
          )}

          {activeTab === 'company' && (
            <>
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">AI Candidate Search</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Filter verified student profiles by exact skill tags, CGPA, graduation year, and verified assessment scores.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Verified Skill Badges</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminate resume fraud with cryptographically verified assessment badges and college academic reports.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Application Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage applications seamlessly from initial AI match evaluation to candidate interview scheduling.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 📊 Impact Metrics Banner */}
      <section id="impact" className="py-16 bg-slate-900/80 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">94%</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Matching Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-400">10,000+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Students Onboarded</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-400">120+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Partner Institutions</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">450+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Recruiters</div>
          </div>
        </div>
      </section>

      {/* 🏁 Call To Action Banner */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 border border-slate-800 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Accelerate Your Career & Hiring Pipeline?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Sign in to your dedicated portal role or create a new account to unlock AI-powered recruitment tools.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
            >
              <span>Access Your Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🔻 Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <div>&copy; 2026 Skill2Job.ai — Empowering Smart Career & Campus Recruitment.</div>
        <div className="flex justify-center gap-6 font-semibold">
          <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-cyan-400 transition-colors">Register</Link>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
        </div>
      </footer>

    </div>
  );
}
