'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Skill2JobLogo from '@/components/Skill2JobLogo';
import GoogleSignInModal from '@/components/GoogleSignInModal';
import { Lock, Mail, ArrowRight, Sparkles, GraduationCap, Building2, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff, Briefcase, Sun, Moon, ArrowLeft } from 'lucide-react';
export default function LoginPage() {
    const router = useRouter();
    const { login, loginWithGoogle } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    // Google Modal State
    const [googleModalOpen, setGoogleModalOpen] = useState(false);
    // Active Role Tab
    const [selectedRole, setSelectedRole] = useState('student');
    // Credentials
    const [identifier, setIdentifier] = useState('alex.rivera@student.skill2job.ai');
    const [password, setPassword] = useState('demo123');
    const [showPassword, setShowPassword] = useState(false);
    // OTP Login Mode
    const [useOtp, setUseOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // 3 Role Cards with Pre-configured Demo Accounts
    const THREE_ROLE_CREDENTIALS = [
        {
            role: 'student',
            title: 'Student Portal',
            subtitle: 'Candidate & Learner',
            email: 'alex.rivera@student.skill2job.ai',
            password: 'demo123',
            icon: GraduationCap,
            color: 'from-cyan-500 to-blue-600',
            badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            description: 'Practice coding in IDE, take AI assessments, boost readiness gauge & apply to verified tech openings.',
            defaultDestination: '/student/dashboard'
        },
        {
            role: 'college',
            title: 'College Portal',
            subtitle: 'TPO & Academic Leadership',
            email: 'tpo@apexuniversity.edu',
            password: 'demo123',
            icon: Building2,
            color: 'from-violet-500 to-indigo-600',
            badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
            description: 'Track student batch placement readiness, curriculum demand gaps & monitor company recruiting visits.',
            defaultDestination: '/college/dashboard'
        },
        {
            role: 'company',
            title: 'Recruiter Hub',
            subtitle: 'Enterprise Talent Lead',
            email: 'recruiter@technova.com',
            password: 'demo123',
            icon: Briefcase,
            color: 'from-fuchsia-500 to-pink-600',
            badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
            description: 'Search verified candidate skills, view live code test scores & manage multi-stage hiring pipelines.',
            defaultDestination: '/recruiter/dashboard'
        }
    ];
    const getDashboardRoute = (targetRole) => {
        switch (targetRole) {
            case 'student': return '/student/dashboard';
            case 'college': return '/college/dashboard';
            case 'company': return '/recruiter/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/student/dashboard';
        }
    };
    const handleSelectRoleCredentials = (cred) => {
        setSelectedRole(cred.role);
        setIdentifier(cred.email);
        setPassword(cred.password);
        setError('');
        setSuccessMsg(`Credentials for ${cred.title} loaded into form below.`);
    };
    const handleQuickInstantLogin = async (cred) => {
        setError('');
        setSuccessMsg('');
        setSubmitting(true);
        setSelectedRole(cred.role);
        setIdentifier(cred.email);
        setPassword(cred.password);
        try {
            const res = await login(cred.email, cred.password, false);
            if (res.success) {
                router.push(cred.defaultDestination);
            }
            else {
                setError(res.error || 'Authentication failed.');
            }
        }
        catch (err) {
            setError(err.message || 'Error executing quick login.');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleGoogleAuth = () => {
        setGoogleModalOpen(true);
    };
    const handleGoogleSelectAccount = async (googleEmail, googleName) => {
        setGoogleModalOpen(false);
        setError('');
        setSuccessMsg('');
        setSubmitting(true);
        try {
            const res = await loginWithGoogle(googleEmail);
            if (res.success) {
                const targetRoute = getDashboardRoute(res.user?.role || selectedRole);
                router.push(targetRoute);
            }
            else if (res.isNewUser) {
                router.push(`/signup?email=${encodeURIComponent(res.email || googleEmail)}&name=${encodeURIComponent(res.name || googleName)}`);
            }
            else {
                setError(res.error || 'Google login failed.');
            }
        }
        catch (err) {
            setError(err.message || 'Failed to authenticate Google identity.');
        }
        finally {
            setSubmitting(false);
        }
    };
    const startOtpCooldown = () => {
        setOtpCooldown(60);
        const interval = setInterval(() => {
            setOtpCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const handleSendOtp = async () => {
        if (!identifier.trim()) {
            setError('Please provide your email address to receive an OTP.');
            return;
        }
        setError('');
        setSuccessMsg('');
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: identifier.trim().toLowerCase(),
                    type: 'email',
                    purpose: 'login'
                })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to send OTP code.');
            startOtpCooldown();
            setSuccessMsg(data.message || 'OTP dispatched to your registered email.');
        }
        catch (err) {
            setError(err.message || 'Failed to send verification code.');
        }
    };
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSubmitting(true);
        try {
            const res = await login(identifier.trim(), useOtp ? otp.trim() : password, useOtp);
            if (res.success) {
                const targetRole = res.user?.role || THREE_ROLE_CREDENTIALS.find(c => c.email === identifier.trim())?.role || selectedRole;
                router.push(getDashboardRoute(targetRole));
            }
            else {
                setError(res.error || 'Invalid credentials or verification code.');
            }
        }
        catch (err) {
            setError(err.message || 'Login failed.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (<div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      
      {/* 🧭 Top Navigation Header */}
      <header className="w-full border-b border-border/80 dark:border-white/10 glass sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Skill2JobLogo variant="full" size="sm" theme={resolvedTheme}/>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-3.5 h-3.5"/>
              <span>Back to Home</span>
            </Link>

            <Link href="/signup" className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors">
              Register
            </Link>

            {/* Quick Dark Mode / Light Mode Toggle Button */}
            <button onClick={toggleTheme} aria-label="Toggle color theme" className="p-2 rounded-xl border border-border dark:border-white/10 bg-card hover:bg-muted text-foreground transition-all duration-200">
              {resolvedTheme === 'dark' ? (<Sun className="w-4 h-4 text-amber-400"/>) : (<Moon className="w-4 h-4 text-slate-700"/>)}
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Content Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
            Sign In to Your <span className="text-gradient-brand">Skill2Job.ai</span> Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg mx-auto">
            Secure role-based authentication for Students, Colleges, and Enterprise Recruiters.
          </p>
        </div>

        {/* 1. Quick Role Persona Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary"/>
              <span>Select Your Portal Role (Instant Demo Access)</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">Click 1-Click Login to enter immediately</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THREE_ROLE_CREDENTIALS.map((cred) => {
            const Icon = cred.icon;
            const isSelected = selectedRole === cred.role && identifier === cred.email;
            return (<div key={cred.role} className={`rounded-3xl bg-card border p-5 flex flex-col justify-between space-y-4 shadow-subtle transition-all relative overflow-hidden backdrop-blur-md ${isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-glow-cyan'
                    : 'border-border/80 dark:border-white/10 hover:border-primary/40'}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cred.color} text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0`}>
                          <Icon className="w-5 h-5"/>
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-foreground">{cred.title}</div>
                          <div className="text-[11px] text-muted-foreground font-semibold">{cred.subtitle}</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cred.badgeColor}`}>
                        {cred.role}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cred.description}
                    </p>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-0.5 font-mono text-[11px]">
                      <div className="text-muted-foreground">Email: <span className="text-foreground font-bold">{cred.email}</span></div>
                      <div className="text-muted-foreground">Password: <span className="text-foreground font-bold">{cred.password}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button onClick={() => handleQuickInstantLogin(cred)} disabled={submitting} className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20 hover-lift">
                      <Sparkles className="w-3.5 h-3.5"/>
                      <span>⚡ 1-Click Login as {cred.title.replace(' Portal', '')}</span>
                    </button>

                    <button onClick={() => handleSelectRoleCredentials(cred)} className="w-full py-1.5 px-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] text-center transition-colors">
                      Fill Credentials Below ↓
                    </button>
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* 2. Main Login Form & Credentials Container */}
        <div className="max-w-xl mx-auto w-full bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
          
          {/* Primary: Continue with Google Button */}
          <div className="space-y-3">
            <button type="button" onClick={handleGoogleAuth} disabled={submitting} className="w-full py-3.5 px-4 rounded-2xl border border-border dark:border-white/10 bg-card hover:bg-muted text-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-subtle hover-lift transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{submitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center pt-2 pb-1">
              <div className="border-t border-border w-full"/>
              <span className="bg-card px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                Or Sign In with Email
              </span>
              <div className="border-t border-border w-full"/>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (<div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0"/>
              <span>{error}</span>
            </div>)}

          {successMsg && (<div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0"/>
              <span>{successMsg}</span>
            </div>)}

          {/* Direct Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email / Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Email Address or Registered Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="w-4 h-4"/>
                </div>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter email address" className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
              </div>
            </div>

            {/* Password or OTP Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-foreground">{useOtp ? '6-Digit Email OTP' : 'Password'}</span>
              <button type="button" onClick={() => { setUseOtp(!useOtp); setError(''); setSuccessMsg(''); }} className="text-primary font-bold hover:underline">
                {useOtp ? 'Switch to Password Login' : 'Login with Email OTP instead'}
              </button>
            </div>

            {/* Password Input */}
            {!useOtp && (<div className="space-y-1.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4"/>
                  </div>
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password (default: demo123)" className="w-full pl-10 pr-10 py-3 rounded-2xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>)}

            {/* OTP Input with Send Code Button */}
            {useOtp && (<div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP code" className="flex-1 px-4 py-3 rounded-2xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-mono font-bold tracking-widest text-foreground text-center transition-all"/>
                  <button type="button" onClick={handleSendOtp} disabled={otpCooldown > 0 || submitting} className="px-4 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs shrink-0 transition-colors border border-border">
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP Code'}
                  </button>
                </div>
              </div>)}

            {/* Submit Button */}
            <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 hover-lift transition-all">
              <span>{submitting ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4"/>
            </button>
          </form>

          {/* New to Skill2Job.ai */}
          <div className="text-center pt-2 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account yet?{' '}
              <Link href="/signup" className="font-bold text-primary hover:underline">
                Create Account (Student, College, Company)
              </Link>
            </p>
          </div>

        </div>

      </main>

      {/* 🔻 Public Auth Footer */}
      <footer className="w-full border-t border-border/80 dark:border-white/10 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>&copy; 2026 Skill2Job.ai — Next-Gen AI Career & Recruitment Platform.</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Register</Link>
            <span className="hover:text-foreground transition-colors cursor-pointer">Security Audit</span>
          </div>
        </div>
      </footer>

      {/* Google Sign-In Account Selector Modal */}
      <GoogleSignInModal isOpen={googleModalOpen} onClose={() => setGoogleModalOpen(false)} onSelectAccount={handleGoogleSelectAccount} isLoading={submitting}/>

    </div>);
}
