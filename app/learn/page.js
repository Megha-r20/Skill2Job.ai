'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, BookOpen, Layers } from 'lucide-react';

const DEFAULT_SKILLS = [
  { id: 'sk_python', name: 'Python', category: 'Programming', industryDemandPercent: 94, description: 'Core Python syntax, data structures, OOP, file handling, and algorithms for automation, backend, and data science.' },
  { id: 'sk_dsa', name: 'Data Structures & Algorithms', category: 'Data Structures', industryDemandPercent: 98, description: 'Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and algorithm optimization.' },
  { id: 'sk_sql', name: 'SQL & Database Design', category: 'Databases', industryDemandPercent: 91, description: 'Relational query design, indexing, normalization, transactions, and performance tuning.' },
  { id: 'sk_react', name: 'React & Frontend', category: 'Web Development', industryDemandPercent: 89, description: 'Component architecture, hooks, state management, modern Next.js paradigms, and responsive UI.' },
  { id: 'sk_java', name: 'Java Enterprise', category: 'Programming', industryDemandPercent: 88, description: 'Java 17+, Object-Oriented design patterns, Collections framework, multithreading, and Spring Boot.' },
  { id: 'sk_cpp', name: 'C++ Systems Programming', category: 'Programming', industryDemandPercent: 82, description: 'Low-level memory management, pointers, STL, templates, and high-performance competitive programming.' },
  { id: 'sk_aws', name: 'AWS Cloud Architecture', category: 'Cloud', industryDemandPercent: 86, description: 'EC2, S3, Lambda, IAM, VPC, and cloud infrastructure deployment best practices.' },
  { id: 'sk_ml', name: 'Machine Learning Foundations', category: 'AI/ML', industryDemandPercent: 87, description: 'Supervised & unsupervised learning, scikit-learn, neural networks, feature engineering, and model evaluation.' },
  { id: 'sk_node', name: 'Node.js Backend Engineering', category: 'Web Development', industryDemandPercent: 85, description: 'Asynchronous event-driven runtimes, REST APIs, Express, authentication, and microservices.' },
  { id: 'sk_soft', name: 'Aptitude & Technical Communication', category: 'Soft Skills', industryDemandPercent: 95, description: 'Quantitative reasoning, critical problem solving, behavioral interview readiness, and placement prep.' }
];

export default function LearnHubPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLearnData() {
      try {
        const res = await fetch('/api/search?q=&studentId=std_1');
        if (res.ok) {
          const skData = await res.json();
          if (Array.isArray(skData.skills) && skData.skills.length > 0) {
            setSkills(skData.skills);
          }
        }
      } catch (err) {
        console.error('Error loading learn data, using fallback skills:', err);
      }
    }
    loadLearnData();
  }, []);

  const categories = ['All', 'Programming', 'Data Structures', 'Databases', 'Web Development', 'AI/ML', 'Cloud', 'Soft Skills'];

  const filteredSkills = skills.filter(s => {
    const matchesSearch = !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularSkills = [
    'Python',
    'DSA',
    'SQL',
    'React',
    'Java',
    'C++',
    'AWS',
    'Machine Learning',
    'Node.js',
    'Soft Skills'
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800 space-y-6">
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill2Job.ai Skill & Video Academy</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Master In-Demand Placement Skills
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Interactive video lessons, code execution sandboxes, cheatsheets, and verified skill certifications designed to bridge campus-to-corporate gaps.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-3xl z-10">
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-800 transition-colors">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any skill (e.g. Python, DSA, SQL, React, AWS, Machine Learning)..."
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium px-3 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Skill Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Popular Skills:</span>
            {popularSkills.map((sk) => (
              <button
                key={sk}
                onClick={() => router.push(`/learn/${encodeURIComponent(sk)}`)}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-all shadow-sm"
              >
                {sk}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Technical Skill Ecosystems ({filteredSkills.length})
            </h2>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {filteredSkills.length} tracks available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((sk) => (
              <div
                key={sk.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg dark:hover:shadow-emerald-950/20 transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform shadow-sm">
                      ⚡
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700/60">
                      Demand: {sk.industryDemandPercent}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <Link href={`/learn/${encodeURIComponent(sk.name)}`}>
                        {sk.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {sk.description}
                    </p>
                  </div>

                  {/* Level Badges */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                      Beginner
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                      Intermediate
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50">
                      Advanced
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/learn/${encodeURIComponent(sk.name)}`}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-800 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 text-white flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Explore {sk.name} Ecosystem</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
