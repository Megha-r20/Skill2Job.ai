'use client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Skill2HireLogo from '@/components/Skill2HireLogo';
const LiveOtpNotificationBanner = dynamic(() => import('@/components/LiveOtpNotificationBanner'), { ssr: false });
const GoogleSignInModal = dynamic(() => import('@/components/GoogleSignInModal'), { ssr: false });
import { GraduationCap, Building2, Briefcase, CheckCircle2, Lock, Mail, Phone, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff, Sun, Moon, ArrowLeft, User, Code2 } from 'lucide-react';
export default function SignupPage() {
    return (<Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>}>
      <SignupContent />
    </Suspense>);
}
function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthSession } = useAuth();
    const { resolvedTheme, toggleTheme } = useTheme();
    // Wizard Step: 1 = 'credentials' | 2 = 'profile' | 3 = 'otp_email' | 4 = 'completed'
    const [currentStep, setCurrentStep] = useState('credentials');
    // Category 1: Role Selection
    const [selectedRole, setSelectedRole] = useState('student');
    // Category 2: Basic Account Credentials
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isGoogleVerified, setIsGoogleVerified] = useState(false);
    const [googleModalOpen, setGoogleModalOpen] = useState(false);
    // Category 3: Role Specific Profiles
    // Student Profile
    const [collegeName, setCollegeName] = useState('Apex University of Engineering');
    const [department, setDepartment] = useState('Computer Science & Engineering');
    const [graduationYear, setGraduationYear] = useState('2026');
    const [careerGoal, setCareerGoal] = useState('Full Stack Software Engineer');
    const [skillsInput, setSkillsInput] = useState('Python, Data Structures, SQL, Git');
    const [resumeUrl, setResumeUrl] = useState('https://storage.skill2hire.com/resumes/alex_resume.pdf');
    // College Profile
    const [website, setWebsite] = useState('https://apexuniversity.edu');
    const [address, setAddress] = useState('Academic City Campus, Tech Corridor');
    const [contactPerson, setContactPerson] = useState('Dean of Placements & Training');
    // Company Profile
    const [industry, setIndustry] = useState('Technology & Cloud Systems');
    const [recruiterName, setRecruiterName] = useState('Lead Technical Recruiter');
    // OTP Verification state
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpInputRefs = useRef([]);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [emailCooldown, setEmailCooldown] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    // Prefill Google Identity from query params if redirected
    useEffect(() => {
        const googleEmail = searchParams.get('email');
        const googleName = searchParams.get('name');
        if (googleEmail) {
            setEmail(googleEmail);
            setIsGoogleVerified(true);
            if (googleName)
                setName(googleName);
            setSuccessMsg(`Google identity verified for ${googleEmail}. Continue with profile details.`);
        }
    }, [searchParams]);
    // Cooldown timer for OTP
    const startCooldown = () => {
        setEmailCooldown(60);
        const timer = setInterval(() => {
            setEmailCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    // Password Strength evaluation
    const getPasswordStrength = (pwd) => {
        if (!pwd)
            return { score: 0, label: '', color: 'bg-muted' };
        let score = 0;
        if (pwd.length >= 6)
            score += 1;
        if (pwd.length >= 10)
            score += 1;
        if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
            score += 1;
        if (/[^A-Za-z0-9]/.test(pwd))
            score += 1;
        switch (score) {
            case 1: return { score: 1, label: 'Weak', color: 'bg-rose-500' };
            case 2: return { score: 2, label: 'Fair', color: 'bg-amber-500' };
            case 3: return { score: 3, label: 'Good', color: 'bg-sky-500' };
            case 4: return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
            default: return { score: 0, label: 'Too Short', color: 'bg-rose-500' };
        }
    };
    const passwordStrength = getPasswordStrength(password);
    // Validate Step 1 (Account Credentials) and advance to Step 2 (Profile Details)
    const handleProceedToProfile = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email || !email.includes('@')) {
            setError('Please provide a valid email address.');
            return;
        }
        if (!name.trim()) {
            setError('Please enter your full name or account name.');
            return;
        }
        if (!isGoogleVerified) {
            if (!password || password.length < 6) {
                setError('Password must contain at least 6 characters.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }
        setCurrentStep('profile');
    };
    // Submit Final Registration (Step 2 -> OTP Step 3)
    const handleFinalRegistration = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const skillsList = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
            const payload = {
                role: selectedRole,
                name: name.trim() || (selectedRole === 'student' ? 'Student Candidate' : selectedRole === 'college' ? collegeName : 'Company Partner'),
                email: email.trim().toLowerCase(),
                phone: phone.trim() || '+91 98765 00000',
                password: password || 'google_oauth_verified',
                isGoogleAuth: isGoogleVerified,
                collegeName,
                department,
                graduationYear,
                careerGoal,
                skills: skillsList,
                resumeUrl,
                website,
                address,
                contactPerson,
                industry,
                recruiterName
            };
            const regRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const regData = await regRes.json();
            if (!regRes.ok)
                throw new Error(regData.error || 'Registration failed.');
            // Dispatch 6-Digit Email OTP
            const otpRes = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: email.trim().toLowerCase(),
                    type: 'email',
                    purpose: 'registration',
                    name: name || 'Skill2Hire User'
                })
            });
            const otpData = await otpRes.json();
            if (!otpRes.ok)
                throw new Error(otpData.error || 'Failed to dispatch verification code.');
            setMaskedEmail(otpData.maskedIdentifier || email);
            startCooldown();
            setCurrentStep('otp_email');
            setSuccessMsg(otpData.message || `A 6-digit verification code has been dispatched to ${email}.`);
        }
        catch (err) {
            setError(err.message || 'Registration failed.');
        }
        finally {
            setLoading(false);
        }
    };
    // Handle OTP Box Input Changes
    const handleOtpBoxChange = (index, val) => {
        const char = val.slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = char;
        setOtpDigits(newDigits);
        if (char && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
        if (!pasteData)
            return;
        const chars = pasteData.slice(0, 6).split('');
        const newDigits = [...otpDigits];
        chars.forEach((c, i) => {
            if (i < 6)
                newDigits[i] = c;
        });
        setOtpDigits(newDigits);
        const focusIdx = Math.min(chars.length, 5);
        otpInputRefs.current[focusIdx]?.focus();
    };
    // Verify OTP
    const handleVerifyEmailOtp = async (e) => {
        e.preventDefault();
        const fullOtp = otpDigits.join('');
        if (fullOtp.length < 6) {
            setError('Please enter all 6 digits of your verification code.');
            return;
        }
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: email.trim().toLowerCase(),
                    code: fullOtp.trim(),
                    purpose: 'registration'
                })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Invalid verification code.');
            setCurrentStep('completed');
            if (data.user) {
                setAuthSession(data.user, data.profile);
            }
            setTimeout(() => {
                if (selectedRole === 'student')
                    router.push('/student/dashboard');
                else if (selectedRole === 'college')
                    router.push('/college/dashboard');
                else
                    router.push('/recruiter/dashboard');
            }, 1000);
        }
        catch (err) {
            setError(err.message || 'Verification failed.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleResendOtp = async () => {
        if (emailCooldown > 0)
            return;
        setError('');
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: email.trim().toLowerCase(),
                    type: 'email',
                    purpose: 'registration'
                })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error);
            startCooldown();
            setSuccessMsg(data.message);
        }
        catch (err) {
            setError(err.message || 'Failed to resend code.');
        }
    };
    // Helper to add skill chips
    const addSkillChip = (skillName) => {
        const current = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
        if (!current.includes(skillName)) {
            setSkillsInput([...current, skillName].join(', '));
        }
    };
    return (<div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      
      {/* 🧭 Top Navigation Header */}
      <header className="relative w-full border-b border-border/80 dark:border-white/10 bg-card/60 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Skill2HireLogo variant="full" size="sm" theme={resolvedTheme}/>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-3.5 h-3.5"/>
              <span>Home</span>
            </Link>

            <Link href="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>

            {/* Quick Dark Mode / Light Mode Toggle Button */}
            <button onClick={toggleTheme} aria-label="Toggle color theme" className="p-2 rounded-xl border border-border dark:border-white/10 bg-card hover:bg-muted text-foreground transition-all duration-200">
              {resolvedTheme === 'dark' ? (<Sun className="w-4 h-4 text-amber-400"/>) : (<Moon className="w-4 h-4 text-slate-700"/>)}
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Top Header & Progressive Category Stepper */}
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>Fast 2-Step Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
            {currentStep === 'credentials' && 'Step 1: Role & Account Credentials'}
            {currentStep === 'profile' && `Step 2: Complete Your ${selectedRole === 'student' ? 'Student' : selectedRole === 'college' ? 'Institution' : 'Company'} Profile`}
            {currentStep === 'otp_email' && 'Step 3: Email OTP Verification'}
            {currentStep === 'completed' && 'Registration Complete!'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {currentStep === 'credentials' && 'Choose your portal role and set your login email and password.'}
            {currentStep === 'profile' && 'Add your background details so your dashboard and AI recommendations are customized.'}
            {currentStep === 'otp_email' && `Enter the 6-digit verification code sent to ${maskedEmail || email}.`}
          </p>

          {/* Stepper Tabs with Categories */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${currentStep === 'credentials'
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-muted/50 text-muted-foreground border-border'}`}>
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span>Account Credentials</span>
            </div>

            <div className="w-4 h-0.5 bg-border"/>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${currentStep === 'profile'
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-muted/50 text-muted-foreground border-border'}`}>
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span>Profile Details</span>
            </div>

            <div className="w-4 h-0.5 bg-border"/>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${currentStep === 'otp_email' || currentStep === 'completed'
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-muted/50 text-muted-foreground border-border'}`}>
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">3</span>
              <span>Verification</span>
            </div>
          </div>
        </div>

        {/* Global Feedback Messages */}
        {error && (<div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0"/>
            <span>{error}</span>
          </div>)}

        {successMsg && (<div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0"/>
            <span>{successMsg}</span>
          </div>)}

        {/* ========================================================================= */}
        {/* 📦 STEP 1: ROLE SELECTION & ACCOUNT CREDENTIALS (4 SIMPLE FIELDS)         */}
        {/* ========================================================================= */}
        {currentStep === 'credentials' && (<div className="max-w-2xl mx-auto space-y-6">
            
            {/* CATEGORY 1: Choose Role (Compact Segmented Switcher) */}
            <div className="bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-lg p-5 sm:p-6 space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-black">1</span>
                  <span>Select User Role</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">Controls permissions & portal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                {
                    role: 'student',
                    title: 'Student',
                    icon: GraduationCap,
                    desc: 'Practice & get hired',
                    activeStyle: 'border-primary ring-2 ring-primary/20 bg-primary/10 shadow-glow-cyan text-primary'
                },
                {
                    role: 'college',
                    title: 'College / University',
                    icon: Building2,
                    desc: 'TPO & Batch analytics',
                    activeStyle: 'border-secondary ring-2 ring-secondary/20 bg-secondary/10 shadow-glow-violet text-secondary'
                },
                {
                    role: 'company',
                    title: 'Company / Recruiter',
                    icon: Briefcase,
                    desc: 'Post jobs & hire talent',
                    activeStyle: 'border-fuchsia-500 ring-2 ring-fuchsia-500/20 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/15 text-fuchsia-500'
                }
            ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (<button key={item.role} type="button" onClick={() => setSelectedRole(item.role)} className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${isSelected
                        ? item.activeStyle
                        : 'border-border/80 bg-muted/30 hover:bg-muted/60 text-muted-foreground'}`}>
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                        <Icon className="w-4 h-4"/>
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-foreground truncate">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                      </div>
                    </button>);
            })}
              </div>
            </div>

            {/* CATEGORY 2: Account Login Credentials */}
            <form onSubmit={handleProceedToProfile} className="bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-lg p-6 sm:p-8 space-y-6 backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-black">2</span>
                  <span>Login Credentials</span>
                </span>
                
                {/* Fast track with Google */}
                <button type="button" onClick={() => setGoogleModalOpen(true)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Fast Fill with Google</span>
                </button>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Full Name / Account Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4"/>
                    </div>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Rivera" className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Verified Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4"/>
                    </div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@gmail.com" className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              {!isGoogleVerified && (<div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>Password</span>
                        {password && (<span className="text-[10px] font-bold text-muted-foreground">
                            {passwordStrength.label}
                          </span>)}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <Lock className="w-4 h-4"/>
                        </div>
                        <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                          <Lock className="w-4 h-4"/>
                        </div>
                        <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                      </div>
                    </div>
                  </div>

                  {password && (<div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[1, 2, 3, 4].map((s) => (<div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= passwordStrength.score ? passwordStrength.color : 'bg-muted'}`}/>))}
                    </div>)}
                </div>)}

              {/* Phone Optional */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Phone Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="w-4 h-4"/>
                  </div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 00000" className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-muted/40 border border-input focus:bg-card focus:ring-2 focus:ring-primary focus:border-primary text-xs font-medium text-foreground transition-all"/>
                </div>
              </div>

              {/* Step 1 Action Button */}
              <button type="submit" className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/25 hover-lift transition-all">
                <span>Continue to Profile Details</span>
                <ArrowRight className="w-4 h-4"/>
              </button>

            </form>

          </div>)}

        {/* ========================================================================= */}
        {/* 📋 STEP 2: CATEGORIZED ROLE PROFILE DETAILS                                */}
        {/* ========================================================================= */}
        {currentStep === 'profile' && (<div className="max-w-2xl mx-auto space-y-6">
            
            <form onSubmit={handleFinalRegistration} className="bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-lg p-6 sm:p-8 space-y-6 backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <button type="button" onClick={() => setCurrentStep('credentials')} className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5"/>
                  <span>Back to Credentials</span>
                </button>

                <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  {selectedRole === 'student' ? '🎓 Student Profile' : selectedRole === 'college' ? '🏛️ Institution Profile' : '🏢 Recruiter Profile'}
                </span>
              </div>

              {/* 🎓 FOR STUDENTS: Categorized Sections */}
              {selectedRole === 'student' && (<div className="space-y-6">
                  
                  {/* Category A: Academic Institution */}
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/80">
                    <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4"/>
                      <span>Category A: Academic Details</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-foreground">College / University Name</label>
                        <input type="text" required value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Department / Major</label>
                        <input type="text" required value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Graduation Year</label>
                        <input type="number" required value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                      </div>
                    </div>
                  </div>

                  {/* Category B: Career & Skills */}
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/80">
                    <span className="text-xs font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                      <Code2 className="w-4 h-4"/>
                      <span>Category B: Skills & Career Goal</span>
                    </span>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Target Role / Career Goal</label>
                        <input type="text" required value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Full Stack Software Engineer" className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Declared Skills (Comma separated)</label>
                        <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                        
                        {/* Quick Skill Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-muted-foreground font-semibold">Popular:</span>
                          {['Python', 'React', 'DSA', 'SQL', 'TypeScript', 'AWS'].map((tag) => (<button key={tag} type="button" onClick={() => addSkillChip(tag)} className="px-2 py-0.5 rounded-md bg-muted hover:bg-primary/20 hover:text-primary text-[10px] font-bold text-muted-foreground transition-colors">
                              + {tag}
                            </button>))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>)}

              {/* 🏛️ FOR COLLEGES: Categorized Details */}
              {selectedRole === 'college' && (<div className="space-y-4 p-4 rounded-2xl bg-muted/20 border border-border/80">
                  <span className="text-xs font-black uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <Building2 className="w-4 h-4"/>
                    <span>Institution Verification Details</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-foreground">Official Campus Website</label>
                      <input type="url" required value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://university.edu" className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Placement Cell Contact / Dean</label>
                      <input type="text" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Campus Location / Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                    </div>
                  </div>
                </div>)}

              {/* 🏢 FOR RECRUITERS: Categorized Details */}
              {selectedRole === 'company' && (<div className="space-y-4 p-4 rounded-2xl bg-muted/20 border border-border/80">
                  <span className="text-xs font-black uppercase tracking-wider text-fuchsia-500 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4"/>
                    <span>Company & Recruiting Details</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Industry / Sector</label>
                      <input type="text" required value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Cloud & AI Infrastructure" className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Lead Recruiter / Hiring Lead</label>
                      <input type="text" required value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-input text-xs font-medium text-foreground"/>
                    </div>
                  </div>
                </div>)}

              {/* Submit to Send OTP */}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/25 disabled:opacity-50 hover-lift transition-all">
                <span>{loading ? 'Creating Account & Dispatching OTP...' : 'Submit & Receive Email OTP'}</span>
                <ArrowRight className="w-4 h-4"/>
              </button>

            </form>

          </div>)}

        {/* ========================================================================= */}
        {/* 🔑 STEP 3: 6-DIGIT EMAIL OTP VERIFICATION SCREEN                           */}
        {/* ========================================================================= */}
        {currentStep === 'otp_email' && (<div className="max-w-md mx-auto space-y-6">
            
            {/* Live simulated OTP notification for 1-click test auto-fill */}
            <LiveOtpNotificationBanner filterDestination={email} onSelectOtp={(code) => {
                const chars = code.split('').slice(0, 6);
                const newDigits = [...otpDigits];
                chars.forEach((c, i) => {
                    newDigits[i] = c;
                });
                setOtpDigits(newDigits);
            }}/>

            <div className="bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-xl p-8 space-y-6 text-center backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Mail className="w-7 h-7"/>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-foreground">Verify Your Email Address</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We sent a 6-digit verification code to <strong className="text-foreground">{maskedEmail || email}</strong>.
                </p>
              </div>

              {/* 6 Monospace OTP Input Boxes */}
              <form onSubmit={handleVerifyEmailOtp} className="space-y-6">
                <div className="flex items-center justify-center gap-2.5">
                  {otpDigits.map((digit, idx) => (<input key={idx} ref={(el) => {
                    otpInputRefs.current[idx] = el;
                }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpBoxChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} onPaste={handleOtpPaste} className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl border border-input bg-muted/40 focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground transition-all"/>))}
                </div>

                <button type="submit" disabled={loading || otpDigits.join('').length < 6} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover-lift">
                  <span>{loading ? 'Verifying Code...' : 'Verify OTP & Activate Portal'}</span>
                  <CheckCircle2 className="w-4 h-4"/>
                </button>
              </form>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
                <button type="button" onClick={handleResendOtp} disabled={emailCooldown > 0} className="font-bold text-primary hover:underline disabled:opacity-50">
                  {emailCooldown > 0 ? `Resend Code in ${emailCooldown}s` : 'Resend Verification Code'}
                </button>

                <span className="text-muted-foreground hidden sm:inline">•</span>

                <button type="button" onClick={() => setCurrentStep('credentials')} className="text-muted-foreground hover:text-foreground font-semibold">
                  Edit Account Details
                </button>
              </div>
            </div>

          </div>)}

        {/* ========================================================================= */}
        {/* 🎉 STEP 4: REGISTRATION COMPLETED                                          */}
        {/* ========================================================================= */}
        {currentStep === 'completed' && (<div className="max-w-md mx-auto bg-card text-card-foreground rounded-3xl border border-border dark:border-white/10 shadow-xl p-10 space-y-4 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8"/>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Welcome to Skill2Hire!</h2>
            <p className="text-xs text-muted-foreground">
              Your account has been verified. Redirecting you to your dedicated dashboard...
            </p>
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4"/>
          </div>)}

      </main>

      {/* 🔻 Public Auth Footer */}
      <footer className="w-full border-t border-border/80 dark:border-white/10 py-6 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>&copy; 2026 Skill2Job.ai — Next-Gen AI Career & Recruitment Platform.</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <span className="hover:text-foreground transition-colors cursor-pointer">Security Audit</span>
          </div>
        </div>
      </footer>

      {/* Google Sign In Modal */}
      <GoogleSignInModal isOpen={googleModalOpen} onClose={() => setGoogleModalOpen(false)} onSelectAccount={(googleEmail, googleName) => {
            setEmail(googleEmail);
            setName(googleName);
            setIsGoogleVerified(true);
            setGoogleModalOpen(false);
            setSuccessMsg(`Google identity verified for ${googleEmail}. Proceed to Step 2.`);
        }}/>

    </div>);
}
