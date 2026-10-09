import { aiService } from './services/aiService.js';
import { studentRepository } from './repositories/studentRepository.js';
import { jobRepository } from './repositories/jobRepository.js';
import { aiCache } from './cache/aiCache.js';
import { logger } from './logger.js';

/**
 * Normalizes skill names for reliable comparison across various aliases and formats.
 */
export function normalizeSkill(name) {
    if (!name || typeof name !== 'string') return '';
    const clean = name.trim().toLowerCase().replace(/[\.-]/g, '');
    if (clean === 'react' || clean === 'reactjs') return 'react';
    if (clean === 'node' || clean === 'nodejs') return 'node';
    if (clean.startsWith('python')) return 'python';
    if (clean === 'ts' || clean === 'typescript') return 'typescript';
    if (clean === 'js' || clean === 'javascript') return 'javascript';
    if (clean.includes('tailwind')) return 'tailwind';
    if (clean.includes('postgres')) return 'postgres';
    if (clean.includes('docker') || clean.includes('container')) return 'docker';
    if (clean.includes('data structure') || clean === 'dsa' || clean.includes('algorithm')) return 'dsa';
    if (clean.includes('machine learning') || clean === 'ml') return 'machine learning';
    if (clean.includes('sql')) return 'sql';
    if (clean.includes('graphql')) return 'graphql';
    if (clean.includes('aws') || clean.includes('cloud')) return 'cloud';
    if (clean.includes('next') || clean === 'nextjs') return 'nextjs';
    if (clean.includes('system design')) return 'system design';
    return clean;
}

async function resolveStudent(studentOrId) {
    if (!studentOrId) return null;
    if (typeof studentOrId === 'object' && studentOrId.id) return studentOrId;
    return await studentRepository.findById(String(studentOrId));
}

async function resolveJob(jobOrId) {
    if (!jobOrId) return null;
    if (typeof jobOrId === 'object' && jobOrId.id) return jobOrId;
    return await jobRepository.findById(String(jobOrId));
}

function extractStudentSkills(student) {
    if (!student || !Array.isArray(student.skills)) return [];
    return student.skills.map(s => {
        const name = s.skillName || s.name || '';
        return {
            name,
            normalized: normalizeSkill(name),
            level: s.level || 'Intermediate',
            status: s.status || 'Self-declared',
            score: s.score || 80
        };
    });
}

function extractJobRequiredSkills(job) {
    if (!job) return [];
    let list = [];
    if (Array.isArray(job.requiredSkills)) {
        list = job.requiredSkills;
    } else if (typeof job.requiredSkills === 'string') {
        try {
            list = JSON.parse(job.requiredSkills);
        } catch {
            list = job.requiredSkills.split(',').map(s => s.trim());
        }
    } else if (Array.isArray(job.requirements)) {
        list = job.requirements;
    }

    return list.map(item => {
        const name = typeof item === 'string' ? item : (item.skillName || item.name || '');
        const minLevel = typeof item === 'object' ? (item.minLevel || 'Intermediate') : 'Intermediate';
        let weight = 1.0;
        if (typeof item === 'object') {
            if (typeof item.weight === 'number' && item.weight > 0) {
                weight = item.weight;
            } else if (item.priority === 'Mandatory' || item.priority === 'High' || minLevel === 'Advanced') {
                weight = 1.5;
            } else if (minLevel === 'Intermediate') {
                weight = 1.2;
            } else {
                weight = 1.0;
            }
        }
        return {
            name,
            normalized: normalizeSkill(name),
            minLevel,
            weight
        };
    }).filter(s => s.name.length > 0);
}

/**
 * Evaluates academic CGPA eligibility against job cutoff criteria.
 */
export function evaluateCgpaEligibility(studentCgpa, minCgpa) {
    if (!minCgpa || typeof minCgpa !== 'number' || minCgpa <= 0) {
        return {
            eligible: true,
            factor: 1.0,
            score: 100,
            reason: 'No minimum CGPA cutoff required'
        };
    }
    const cgpa = typeof studentCgpa === 'number' ? studentCgpa : 7.0;

    if (cgpa >= minCgpa) {
        const meritBonus = cgpa >= 9.0 ? 1.03 : (cgpa - minCgpa >= 1.0) ? 1.01 : 1.0;
        return {
            eligible: true,
            factor: meritBonus,
            score: Math.min(100, Math.round(meritBonus * 100)),
            reason: `CGPA ${cgpa.toFixed(2)} meets minimum requirement of ${minCgpa.toFixed(1)}`
        };
    } else {
        const ratio = Math.max(0.60, cgpa / minCgpa);
        return {
            eligible: false,
            factor: Math.round(ratio * 100) / 100,
            score: Math.round(ratio * 100),
            reason: `CGPA ${cgpa.toFixed(2)} is below required cutoff of ${minCgpa.toFixed(1)}`
        };
    }
}

/**
 * Evaluates branch / academic department eligibility against job opening requirements.
 */
export function evaluateBranchEligibility(studentDepartment, jobBranch) {
    if (!jobBranch || typeof jobBranch !== 'string') {
        return {
            eligible: true,
            factor: 1.0,
            score: 100,
            reason: 'Open to all academic disciplines'
        };
    }
    const cleanJob = jobBranch.trim().toLowerCase();
    if (cleanJob === 'all' || cleanJob === 'all branches' || cleanJob === 'any' || cleanJob === '') {
        return {
            eligible: true,
            factor: 1.0,
            score: 100,
            reason: 'Open to all academic disciplines'
        };
    }
    if (!studentDepartment || typeof studentDepartment !== 'string') {
        return {
            eligible: true,
            factor: 0.95,
            score: 95,
            reason: 'Department unspecified'
        };
    }

    const cleanDept = studentDepartment.trim().toLowerCase();

    // Direct match
    if (cleanDept.includes(cleanJob) || cleanJob.includes(cleanDept)) {
        return {
            eligible: true,
            factor: 1.0,
            score: 100,
            reason: `${studentDepartment} matches required branch (${jobBranch})`
        };
    }

    // Match helper with word boundary support for short abbreviations (preventing 'cs' matching inside 'electronics')
    const matchesKeyword = (text, list) => {
        return list.some(k => {
            if (k.length <= 3) {
                const regex = new RegExp(`(^|[^a-zA-Z0-9])${k}([^a-zA-Z0-9]|$)`, 'i');
                return regex.test(text);
            }
            return text.includes(k);
        });
    };

    // Technology / Computing discipline cluster
    const techKeywords = ['computer', 'cs', 'cse', 'software', 'information technology', 'it', 'artificial intelligence', 'ai', 'data science', 'ds'];
    const isDeptTech = matchesKeyword(cleanDept, techKeywords);
    const isJobTech = matchesKeyword(cleanJob, techKeywords);

    if (isDeptTech && isJobTech) {
        return {
            eligible: true,
            factor: 1.0,
            score: 100,
            reason: `${studentDepartment} aligns with ${jobBranch} computing disciplines`
        };
    }

    // Circuit disciplines cluster
    const circuitKeywords = ['electronics', 'ece', 'electrical', 'eee', 'telecommunication', 'instrumentation'];
    const isDeptCircuit = matchesKeyword(cleanDept, circuitKeywords);
    const isJobCircuit = matchesKeyword(cleanJob, circuitKeywords);

    if (isDeptCircuit && (isJobTech || isJobCircuit)) {
        return {
            eligible: true,
            factor: 0.94,
            score: 94,
            reason: `${studentDepartment} is an eligible circuit branch for ${jobBranch}`
        };
    }

    // Non-aligned discipline
    return {
        eligible: false,
        factor: 0.80,
        score: 80,
        reason: `${studentDepartment} is outside preferred ${jobBranch} branch criteria`
    };
}

/**
 * Computes dynamic match percentage and gap skills using a multi-factor algorithm:
 * weighted skill overlap × credibility multiplier × CGPA/branch academic eligibility,
 * providing a transparent explanation ("Why X%").
 */
export async function calculateJobMatch(studentOrId, targetJobOrId) {
    const student = await resolveStudent(studentOrId);
    const job = await resolveJob(targetJobOrId);

    if (!student || !job) {
        return {
            matchPercentage: 50,
            matchScore: 50,
            isEligible: false,
            explanation: "Match is 50%: Initial profile assessment baseline.",
            whyExplanation: "Why 50%: Candidate profile or job criteria is currently under initial evaluation.",
            breakdown: {
                skillOverlap: { score: 50, matchedCount: 0, totalRequiredCount: 0, matched: [], missing: [] },
                credibility: { score: 70, verifiedCount: 0, unverifiedCount: 0 },
                academicEligibility: { score: 100, cgpaEligible: true, branchEligible: true },
                formula: "Baseline 50% match"
            },
            strengths: ["Profile under initial assessment"],
            recommendations: ["Complete profile and take baseline skill evaluations"],
            skillGap: ["Core Technical Skills"],
            skillsAnalysis: [],
            readinessSteps: [],
            readinessScore: 50,
            actionableFeedback: ["Add verified skills to your profile to generate customized job alignment."]
        };
    }

    const studentSkills = extractStudentSkills(student);
    const requiredSkills = extractJobRequiredSkills(job);

    // 1. Calculate Weighted Skill Overlap
    const matchedSkills = [];
    const missingSkills = [];
    let totalEarnedWeight = 0;
    let totalRequiredWeight = 0;

    for (const req of requiredSkills) {
        totalRequiredWeight += req.weight;
        const studentMatch = studentSkills.find(s => 
            s.normalized === req.normalized || 
            s.name.toLowerCase().includes(req.name.toLowerCase()) || 
            req.name.toLowerCase().includes(s.name.toLowerCase())
        );

        if (studentMatch) {
            let levelMultiplier = 1.0;
            let status = 'VERIFIED';
            if (req.minLevel === 'Advanced' && studentMatch.level !== 'Advanced') {
                levelMultiplier = 0.85;
                status = 'LEVEL_GAP';
            } else if (req.minLevel === 'Intermediate' && studentMatch.level === 'Beginner') {
                levelMultiplier = 0.70;
                status = 'LEVEL_GAP';
            } else if (req.minLevel === 'Advanced' && studentMatch.level === 'Beginner') {
                levelMultiplier = 0.50;
                status = 'LEVEL_GAP';
            }

            // Credibility factor for individual skill
            let skillCredibility = 0.72; // default for unverified/self-declared
            if (studentMatch.status === 'Verified') {
                const score = typeof studentMatch.score === 'number' ? studentMatch.score : 85;
                skillCredibility = 0.90 + (score / 100) * 0.10; // 0.90 - 1.00
            } else if (studentMatch.status === 'In-Progress') {
                skillCredibility = 0.80;
            }
            if (typeof studentMatch.credibilityScore === 'number' && studentMatch.credibilityScore > 0) {
                skillCredibility = Math.max(0.60, Math.min(1.0, studentMatch.credibilityScore / 100));
            }

            const earned = req.weight * levelMultiplier;
            totalEarnedWeight += earned;

            matchedSkills.push({
                required: req.name,
                requiredLevel: req.minLevel,
                studentSkill: studentMatch,
                weight: req.weight,
                levelMultiplier,
                earnedWeight: earned,
                credibility: skillCredibility,
                status: studentMatch.status === 'Verified' ? (status === 'LEVEL_GAP' ? 'LEVEL_GAP' : 'VERIFIED') : 'UNVERIFIED'
            });
        } else {
            missingSkills.push(req.name);
        }
    }

    const skillOverlapRatio = totalRequiredWeight > 0 
        ? Math.min(1.0, totalEarnedWeight / totalRequiredWeight) 
        : (student.placementReadiness ? student.placementReadiness / 100 : 0.80);
    const skillOverlapPct = Math.round(skillOverlapRatio * 100);

    // 2. Calculate Credibility Multiplier
    let credibilitySum = 0;
    let credibilityWeightTotal = 0;
    let verifiedCount = 0;
    let unverifiedCount = 0;
    let totalScoreSum = 0;

    for (const m of matchedSkills) {
        credibilitySum += (m.weight * m.credibility);
        credibilityWeightTotal += m.weight;
        if (m.studentSkill.status === 'Verified') {
            verifiedCount++;
            totalScoreSum += (m.studentSkill.score || 85);
        } else {
            unverifiedCount++;
        }
    }

    const credibilityRatio = credibilityWeightTotal > 0
        ? Math.min(1.0, Math.max(0.60, credibilitySum / credibilityWeightTotal))
        : 0.75;
    const credibilityPct = Math.round(credibilityRatio * 100);
    const avgScore = verifiedCount > 0 ? Math.round(totalScoreSum / verifiedCount) : 0;

    // 3. Calculate CGPA & Branch Academic Eligibility Multipliers
    const cgpaEval = evaluateCgpaEligibility(student.cgpa, job.minCgpa);
    const branchEval = evaluateBranchEligibility(student.department, job.branch);

    const academicRatio = Math.min(1.05, Math.max(0.50, cgpaEval.factor * branchEval.factor));
    const academicEligibilityPct = Math.min(100, Math.round(academicRatio * 100));

    // 4. Multiplicative Combination: Weighted Skill Overlap × Credibility × Academic Eligibility
    const rawMatch = (skillOverlapRatio * credibilityRatio * academicRatio) * 100;
    const matchPercentage = Math.min(100, Math.max(10, Math.round(rawMatch)));

    // 5. Generate Transparent Explanations ("why 72%")
    const explanation = `Match is ${matchPercentage}%: ${skillOverlapPct}% weighted skill overlap × ${credibilityPct}% verification credibility × ${academicEligibilityPct}% academic eligibility (${cgpaEval.reason}; ${branchEval.reason}).`;

    const whyExplanation = `Why ${matchPercentage}%? ` +
        `1) Skill Overlap (${skillOverlapPct}%): matched ${matchedSkills.length} of ${requiredSkills.length} required competencies with weighted importance. ` +
        `2) Credibility (${credibilityPct}%): ${verifiedCount} of ${matchedSkills.length} skills verified via standardized assessments (avg score ${avgScore}%). ` +
        `3) Academic Eligibility (${academicEligibilityPct}%): ${cgpaEval.reason}, ${branchEval.reason}.`;

    const breakdown = {
        skillOverlap: {
            score: skillOverlapPct,
            ratio: Math.round(skillOverlapRatio * 1000) / 1000,
            matchedCount: matchedSkills.length,
            totalRequiredCount: requiredSkills.length,
            totalEarnedWeight: Math.round(totalEarnedWeight * 10) / 10,
            totalRequiredWeight: Math.round(totalRequiredWeight * 10) / 10,
            matched: matchedSkills.map(m => ({
                skill: m.required,
                studentLevel: m.studentSkill.level,
                requiredLevel: m.requiredLevel,
                weight: m.weight,
                status: m.status
            })),
            missing: missingSkills
        },
        credibility: {
            score: credibilityPct,
            ratio: Math.round(credibilityRatio * 1000) / 1000,
            verifiedCount,
            unverifiedCount,
            averageAssessmentScore: avgScore,
            details: matchedSkills.map(m => ({
                skill: m.required,
                status: m.studentSkill.status,
                score: m.studentSkill.score,
                credibilityFactor: Math.round(m.credibility * 100) / 100
            }))
        },
        academicEligibility: {
            score: academicEligibilityPct,
            ratio: Math.round(academicRatio * 1000) / 1000,
            studentCgpa: student.cgpa,
            minCgpa: job.minCgpa,
            cgpaEligible: cgpaEval.eligible,
            cgpaFactor: cgpaEval.factor,
            studentDepartment: student.department,
            requiredBranch: job.branch,
            branchEligible: branchEval.eligible,
            branchFactor: branchEval.factor,
            cgpaReason: cgpaEval.reason,
            branchReason: branchEval.reason
        },
        formula: `${skillOverlapPct}% overlap × ${credibilityPct}% credibility × ${academicEligibilityPct}% academic = ${matchPercentage}%`
    };

    // 6. UI Checklists (skillsAnalysis & readinessSteps)
    const skillsAnalysis = requiredSkills.map(req => {
        const match = matchedSkills.find(m => m.required === req.name);
        return {
            skillName: req.name,
            requiredLevel: req.minLevel,
            studentLevel: match ? match.studentSkill.level : 'None',
            status: match ? match.status : 'MISSING',
            score: match ? match.studentSkill.score : null
        };
    });

    const readinessSteps = [];
    let stepNum = 1;
    for (const skill of missingSkills) {
        readinessSteps.push({
            stepNumber: stepNum++,
            action: `Learn and verify ${skill} to close critical position requirement`,
            skillName: skill,
            courseId: `course_${normalizeSkill(skill)}`,
            assessmentId: `asmt_${normalizeSkill(skill)}`
        });
    }
    for (const m of matchedSkills.filter(m => m.status === 'LEVEL_GAP')) {
        readinessSteps.push({
            stepNumber: stepNum++,
            action: `Elevate ${m.required} proficiency from ${m.studentSkill.level} to ${m.requiredLevel}`,
            skillName: m.required,
            courseId: `course_${normalizeSkill(m.required)}`,
            assessmentId: `asmt_${normalizeSkill(m.required)}`
        });
    }

    const isAcademicEligible = cgpaEval.eligible && branchEval.eligible;
    const isEligible = isAcademicEligible && missingSkills.length === 0;

    // 7. Dynamic Strengths & Recommendations
    const strengths = [];
    matchedSkills.forEach(m => {
        if (m.studentSkill.status === 'Verified') {
            strengths.push(`Verified ${m.studentSkill.level || 'proficient'} mastery in ${m.studentSkill.name} (${m.studentSkill.score || 85}%)`);
        } else {
            strengths.push(`Practical experience in ${m.studentSkill.name}`);
        }
    });

    if (cgpaEval.eligible && student.cgpa) {
        strengths.push(cgpaEval.reason);
    }
    if (branchEval.eligible && student.department) {
        strengths.push(branchEval.reason);
    }
    if (strengths.length === 0) {
        strengths.push("Enrolled in accredited degree program");
    }

    const recommendations = [];
    if (missingSkills.length > 0) {
        missingSkills.forEach(skill => {
            recommendations.push(`Complete coursework and assessment for ${skill}`);
        });
    }
    const unverifiedMatches = matchedSkills.filter(m => m.studentSkill.status !== 'Verified');
    if (unverifiedMatches.length > 0) {
        recommendations.push(`Earn official Verified badges for ${unverifiedMatches.map(m => m.studentSkill.name).join(', ')}`);
    }
    if (!cgpaEval.eligible) {
        recommendations.push(`Target companies with flexible CGPA cutoffs or request placement committee waiver`);
    }
    if (recommendations.length === 0) {
        recommendations.push("Prepare portfolio case studies and practice technical interview rounds");
    }

    const studentReadiness = student.placementReadiness || 75;
    const readinessScore = Math.min(100, Math.max(20, Math.round((matchPercentage * 0.6) + (studentReadiness * 0.4))));

    const actionableFeedback = [
        `You match ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchPercentage}% alignment).`,
        missingSkills.length > 0
            ? `Closing gaps in ${missingSkills.slice(0, 3).join(', ')} will significantly boost recruiter shortlist odds.`
            : `Your technical stack matches this position. Proceed directly to mock interview practice.`
    ];

    return {
        matchPercentage,
        matchScore: matchPercentage,
        isEligible,
        missingSkillsCount: missingSkills.length,
        explanation,
        whyExplanation,
        breakdown,
        skillsAnalysis,
        readinessSteps,
        strengths: strengths.slice(0, 4),
        recommendations: recommendations.slice(0, 4),
        skillGap: missingSkills,
        readinessScore,
        actionableFeedback
    };
}

export async function analyzeResume(resumeText, studentId, options = {}) {
    return await aiService.analyzeResume(resumeText, options);
}

/**
 * Computes dynamic skill gap analysis and categorized radar chart data.
 */
export async function generateSkillGapAnalysis(studentOrId, targetJobOrId) {
    const student = await resolveStudent(studentOrId);
    const job = await resolveJob(targetJobOrId);
    const match = await calculateJobMatch(student, job);

    const studentSkills = extractStudentSkills(student || {});
    const currentSkills = studentSkills.map(s => ({
        name: s.name,
        proficiency: s.level || 'Intermediate',
        verified: s.status === 'Verified'
    }));

    const missingSkills = (match.skillGap || []).map((skillName, idx) => ({
        name: skillName,
        priority: idx === 0 ? "High" : "Medium",
        estimatedHours: idx === 0 ? 15 : 10,
        recommendedCourse: `Mastering ${skillName}: Foundations & Practical Projects`
    }));

    // Categorized radar chart scores derived from student's actual skills
    const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Problem Solving'];
    const radarChartData = categories.map(cat => {
        let studentScore = 0;
        let jobTargetScore = 70;

        if (cat === 'Frontend') {
            const frontendSkills = studentSkills.filter(s => ['react', 'javascript', 'typescript', 'tailwind', 'html & css'].includes(s.normalized));
            studentScore = frontendSkills.length > 0 ? Math.round(frontendSkills.reduce((acc, s) => acc + (s.score || 75), 0) / frontendSkills.length) : 25;
            if (job && (job.title.toLowerCase().includes('frontend') || (job.requiredSkills || []).some(r => String(r.skillName || r).toLowerCase().includes('react')))) {
                jobTargetScore = 90;
            }
        } else if (cat === 'Backend') {
            const backendSkills = studentSkills.filter(s => ['python', 'node', 'express', 'java', 'go'].includes(s.normalized));
            studentScore = backendSkills.length > 0 ? Math.round(backendSkills.reduce((acc, s) => acc + (s.score || 75), 0) / backendSkills.length) : 25;
            if (job && (job.title.toLowerCase().includes('backend') || job.title.toLowerCase().includes('full stack'))) {
                jobTargetScore = 85;
            }
        } else if (cat === 'Database') {
            const dbSkills = studentSkills.filter(s => ['sql', 'postgres', 'mongodb', 'redis'].includes(s.normalized));
            studentScore = dbSkills.length > 0 ? Math.round(dbSkills.reduce((acc, s) => acc + (s.score || 75), 0) / dbSkills.length) : 20;
            jobTargetScore = 75;
        } else if (cat === 'DevOps') {
            const devopsSkills = studentSkills.filter(s => ['docker', 'kubernetes', 'cloud', 'aws', 'linux'].includes(s.normalized));
            studentScore = devopsSkills.length > 0 ? Math.round(devopsSkills.reduce((acc, s) => acc + (s.score || 75), 0) / devopsSkills.length) : 20;
            jobTargetScore = 75;
        } else if (cat === 'Problem Solving') {
            const dsaSkills = studentSkills.filter(s => ['dsa', 'algorithms', 'python', 'c++'].includes(s.normalized));
            studentScore = dsaSkills.length > 0 ? Math.round(dsaSkills.reduce((acc, s) => acc + (s.score || 80), 0) / dsaSkills.length) : 30;
            jobTargetScore = 85;
        }

        return {
            subject: cat,
            A: studentScore,
            B: jobTargetScore,
            fullMark: 100
        };
    });

    return {
        studentId: student?.id || studentOrId,
        targetJobId: job?.id || targetJobOrId,
        analyzedAt: new Date().toISOString(),
        matchPercentage: match.matchPercentage,
        currentSkills,
        missingSkills,
        overallReadiness: match.readinessScore,
        radarChartData
    };
}

/**
 * Calculates placement probability dynamically based on CGPA, verified skill count,
 * assessment scores, and readiness indicators.
 */
export async function calculatePlacementProbability(studentOrId) {
    const student = await resolveStudent(studentOrId);
    if (!student) {
        return {
            probability: 50,
            tier: "Needs Assessment",
            factors: [{ factor: "Profile Incomplete", impact: "0%", status: "Pending" }],
            growthSuggestions: ["Complete your student profile and take skill evaluations"]
        };
    }

    const skills = extractStudentSkills(student);
    const verifiedSkills = skills.filter(s => s.status === 'Verified');
    const cgpa = student.cgpa || 7.0;
    const readiness = student.placementReadiness || 70;

    const cgpaScore = Math.min(100, Math.round((cgpa / 10) * 100));
    const cgpaImpact = cgpa >= 8.5 ? "+20%" : cgpa >= 7.5 ? "+14%" : "+6%";
    const cgpaStatus = cgpa >= 8.5 ? "Strong" : cgpa >= 7.5 ? "Good" : "Needs Improvement";

    const verifiedCount = verifiedSkills.length;
    const verifiedScore = Math.min(100, verifiedCount * 25);
    const verifiedImpact = verifiedCount >= 4 ? "+25%" : verifiedCount >= 2 ? "+18%" : "+8%";
    const verifiedStatus = verifiedCount >= 3 ? "Strong" : verifiedCount >= 1 ? "Good" : "Needs Improvement";

    const resumeScore = Math.round(readiness);
    const resumeImpact = resumeScore >= 85 ? "+22%" : resumeScore >= 70 ? "+16%" : "+8%";
    const resumeStatus = resumeScore >= 80 ? "Strong" : resumeScore >= 65 ? "Good" : "Needs Improvement";

    const avgSkillScore = skills.length > 0 
        ? Math.round(skills.reduce((acc, s) => acc + (s.score || 75), 0) / skills.length) 
        : 60;
    const assessmentImpact = avgSkillScore >= 85 ? "+20%" : avgSkillScore >= 70 ? "+14%" : "+6%";
    const assessmentStatus = avgSkillScore >= 80 ? "Good" : "Needs Improvement";

    const probability = Math.min(98, Math.max(20, Math.round(
        (cgpaScore * 0.25) +
        (verifiedScore * 0.30) +
        (resumeScore * 0.25) +
        (avgSkillScore * 0.20)
    )));

    const tier = probability >= 85
        ? "Exceptional Placement Likelihood"
        : probability >= 72
        ? "High Placement Likelihood"
        : probability >= 55
        ? "Moderate Placement Likelihood"
        : "Developing Candidate";

    const factors = [
        { factor: `CGPA (${cgpa.toFixed(2)})`, impact: cgpaImpact, status: cgpaStatus },
        { factor: `Verified Skill Badges (${verifiedCount} verified)`, impact: verifiedImpact, status: verifiedStatus },
        { factor: `Placement Readiness (${resumeScore}/100)`, impact: resumeImpact, status: resumeStatus },
        { factor: `Skill Assessment Average (${avgSkillScore}%)`, impact: assessmentImpact, status: assessmentStatus }
    ];

    const growthSuggestions = [];
    if (verifiedCount < 3) {
        const unverified = skills.find(s => s.status !== 'Verified');
        if (unverified) {
            growthSuggestions.push(`Take assessment for ${unverified.name} to earn a verified badge`);
        } else {
            growthSuggestions.push("Attempt skill assessments in high-demand industry technologies");
        }
    }
    if (cgpa < 8.0) {
        growthSuggestions.push("Build and deploy comprehensive portfolio projects to demonstrate practical capability");
    }
    if (readiness < 80) {
        growthSuggestions.push("Complete mock AI technical interviews to improve readiness metrics");
    }
    if (growthSuggestions.length === 0) {
        growthSuggestions.push("Participate in campus placement drives and company hackathons");
        growthSuggestions.push("Maintain verified credentials and network with corporate hiring partners");
    }

    return {
        probability,
        tier,
        factors,
        growthSuggestions: growthSuggestions.slice(0, 3),
        recommendations: growthSuggestions.slice(0, 3)
    };
}

export async function analyzeCollegeCurriculum(collegeId) {
    let students = [];
    try {
        const all = await studentRepository.findAll();
        students = collegeId ? all.filter(s => s.collegeId === collegeId) : all;
    } catch {
        // fallback
    }

    const count = students.length || 1;
    const avgReadiness = Math.round(students.reduce((acc, s) => acc + (s.placementReadiness || 75), 0) / count);
    const alignmentScore = Math.min(95, Math.max(60, avgReadiness));

    return {
        collegeId,
        industryAlignmentScore: alignmentScore,
        syllabusMatchRate: `${alignmentScore - 4}%`,
        topEmergingSkillGaps: ["Cloud Native DevOps", "Generative AI API Integration", "System Architecture Design"],
        recommendations: [
            "Introduce practical Cloud Native & Docker modules in upper-semester electives",
            "Integrate enterprise mentor code reviews into capstone projects"
        ]
    };
}

export async function calculateIndustrySkillDemand() {
    let jobs = [];
    try {
        jobs = await jobRepository.findAll();
    } catch (e) {
        logger.warn('Failed to fetch jobs for demand analysis', { error: e.message });
    }

    const baselineDemands = [
        { skillName: "Full-Stack Development (React/Next.js)", category: "Web Development", baseline: 92, growth: "+28%" },
        { skillName: "Generative AI & LLM Engineering", category: "Artificial Intelligence", baseline: 90, growth: "+45%" },
        { skillName: "Backend & Microservices (Node/Go/Python)", category: "Backend Engineering", baseline: 86, growth: "+20%" },
        { skillName: "Cloud & DevOps (Docker, Kubernetes, AWS)", category: "DevOps & Cloud", baseline: 84, growth: "+24%" },
        { skillName: "Data Engineering & PostgreSQL", category: "Data Science", baseline: 78, growth: "+15%" }
    ];

    if (jobs && jobs.length > 0) {
        const skillCounts = {};
        jobs.forEach(job => {
            const reqSkills = extractJobRequiredSkills(job);
            reqSkills.forEach(s => {
                skillCounts[s.normalized] = (skillCounts[s.normalized] || 0) + 1;
            });
        });

        return baselineDemands.map(item => {
            const normalized = normalizeSkill(item.skillName);
            const frequency = skillCounts[normalized] || 0;
            const dynamicPercent = Math.min(99, Math.max(60, item.baseline + (frequency * 2)));
            return {
                skillName: item.skillName,
                demandPercent: dynamicPercent,
                demandLevel: dynamicPercent >= 90 ? "Critical" : dynamicPercent >= 80 ? "High" : "Medium",
                category: item.category,
                growthYearOverYear: item.growth
            };
        }).sort((a, b) => b.demandPercent - a.demandPercent);
    }

    return baselineDemands.map(item => ({
        skillName: item.skillName,
        demandPercent: item.baseline,
        demandLevel: item.baseline >= 90 ? "Critical" : "High",
        category: item.category,
        growthYearOverYear: item.growth
    }));
}

export async function generateCareerPathRecommendations(studentOrId) {
    const student = await resolveStudent(studentOrId);
    const studentSkills = extractStudentSkills(student || {});

    const hasFrontend = studentSkills.some(s => ['react', 'javascript', 'typescript'].includes(s.normalized));
    const hasBackend = studentSkills.some(s => ['python', 'node', 'sql'].includes(s.normalized));
    const hasAI = studentSkills.some(s => ['python', 'machine learning', 'dsa'].includes(s.normalized));

    const recommendations = [];

    if (hasFrontend && hasBackend) {
        recommendations.push({
            title: "Full-Stack Software Engineer",
            suitabilityScore: 94,
            avgSalary: "$90,000 - $130,000",
            matchReason: `Demonstrated ability across frontend and backend stack (${studentSkills.map(s => s.name).slice(0, 3).join(', ')})`
        });
    }

    if (hasAI) {
        recommendations.push({
            title: "AI / ML Applications Engineer",
            suitabilityScore: 91,
            avgSalary: "$95,000 - $140,000",
            matchReason: "Strong algorithmic problem-solving and Python / ML data foundation"
        });
    }

    if (hasFrontend) {
        recommendations.push({
            title: "Frontend Engineering Specialist",
            suitabilityScore: 88,
            avgSalary: "$80,000 - $115,000",
            matchReason: "Proven expertise in component state management and UI frameworks"
        });
    }

    if (hasBackend) {
        recommendations.push({
            title: "Backend Cloud Systems Developer",
            suitabilityScore: 84,
            avgSalary: "$85,000 - $120,000",
            matchReason: "Solid database design, API routing, and backend data processing proficiency"
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            title: "Associate Software Engineer",
            suitabilityScore: 78,
            avgSalary: "$70,000 - $95,000",
            matchReason: "Foundational computer science degree coursework and technical problem solving"
        });
    }

    return recommendations.slice(0, 3);
}

export async function analyzeCourseEngagement(studentId) {
    const student = await resolveStudent(studentId);
    const readiness = student?.placementReadiness || 75;

    return {
        studentId,
        completionRate: Math.min(98, Math.max(50, Math.round(readiness * 0.95))),
        weeklyStudyHours: Math.round(((readiness / 100) * 12 + 4) * 10) / 10,
        activeStreakDays: Math.min(30, Math.max(3, Math.round(readiness / 5))),
        learningPace: readiness >= 85 ? "Accelerated" : readiness >= 70 ? "Optimal" : "Self-Paced",
        quizAverageScore: Math.round(readiness * 0.98 * 10) / 10
    };
}

export function generateAssessmentFeedback(assessmentId, score, answers) {
    const numericScore = Number(score) || 0;
    const passed = numericScore >= 70;
    const performanceTier = numericScore >= 85 ? "Exemplary" : numericScore >= 70 ? "Competent" : "Needs Review";

    const strengths = numericScore >= 70
        ? ["Strong understanding of core language fundamentals", "Efficient algorithmic approach and edge case handling"]
        : ["Attempted all sections", "Identified primary syntax and conceptual patterns"];

    const areasToImprove = numericScore < 70
        ? ["Review core algorithmic structures, edge cases, and memory optimization", "Revisit foundational syntax and asynchronous execution"]
        : ["Master advanced distributed system patterns and microservice architecture"];

    return {
        assessmentId,
        score: numericScore,
        passed,
        performanceTier,
        strengths,
        areasToImprove,
        recommendedNextStep: passed ? "Proceed to next level assessment" : "Review targeted course modules and retake assessment"
    };
}

export function evaluateInterviewResponse(questionText, answerText, category = 'Technical') {
    const qStr = String(questionText || '').trim();
    const aStr = String(answerText || '').trim();
    
    const wordCount = aStr.split(/\s+/).filter(Boolean).length;
    
    const qKeywords = qStr
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['what', 'how', 'explain', 'describe', 'difference', 'between', 'does', 'with'].includes(w));

    const aLower = aStr.toLowerCase();
    const matchedKeywords = qKeywords.filter(k => aLower.includes(k));
    const keywordRelevance = qKeywords.length > 0 ? (matchedKeywords.length / qKeywords.length) : 0.8;

    const hasExample = /for example|e\.g\.|instance|such as|case study|scenario/i.test(aStr);
    const hasCodeOrTechnicalTerms = /function|class|const|let|async|await|return|import|api|database|index|complexity|o\(|cache|query/i.test(aStr);
    const hasTradeoffs = /however|trade-off|pros and cons|whereas|advantage|disadvantage|alternative/i.test(aStr);

    let baseScore = 60;
    if (wordCount >= 80) baseScore += 15;
    else if (wordCount >= 40) baseScore += 10;
    else if (wordCount < 15) baseScore -= 20;

    if (keywordRelevance >= 0.5) baseScore += 10;
    if (hasExample) baseScore += 5;
    if (hasCodeOrTechnicalTerms) baseScore += 5;
    if (hasTradeoffs) baseScore += 5;

    const score = Math.min(96, Math.max(35, Math.round(baseScore)));
    const clarityScore = Math.min(95, Math.max(40, wordCount >= 30 ? 85 : 60));
    const relevanceScore = Math.min(98, Math.max(30, Math.round(keywordRelevance * 70 + 30)));
    const technicalAccuracy = score;

    const feedback = score >= 85
        ? "Exemplary response. Strong conceptual clarity, thorough technical depth, and excellent contextual structure."
        : score >= 70
        ? "Solid technical foundation. Clearly answers the core question; consider illustrating with practical edge cases or trade-offs."
        : "Foundational answer. Expand on the internal mechanics, architecture, and provide specific implementation examples.";

    const keyTakeaways = [];
    if (matchedKeywords.length > 0) {
        keyTakeaways.push(`Addressed key topics: ${matchedKeywords.slice(0, 3).join(', ')}`);
    } else {
        keyTakeaways.push("Directly address the primary terminology in the question prompt");
    }
    if (!hasExample) {
        keyTakeaways.push("Include concrete real-world engineering scenarios or code snippets");
    }
    if (!hasTradeoffs) {
        keyTakeaways.push("Discuss performance implications or trade-offs (e.g. time/space complexity)");
    }

    return {
        score,
        feedback,
        clarityScore,
        relevanceScore,
        technicalAccuracy,
        keyTakeaways: keyTakeaways.slice(0, 3)
    };
}

export async function matchTalentBySkillsQuery(query, options = {}) {
    const allStudents = await studentRepository.findAll();
    const queryTerms = String(query || '')
        .toLowerCase()
        .split(/[,\s]+/)
        .map(t => normalizeSkill(t))
        .filter(Boolean);

    let candidates = allStudents.map(student => {
        const skills = extractStudentSkills(student);
        let matchCount = 0;

        queryTerms.forEach(term => {
            if (skills.some(s => s.normalized === term || s.name.toLowerCase().includes(term))) {
                matchCount++;
            }
        });

        const verifiedBonus = skills.filter(s => s.status === 'Verified').length * 2;
        const skillScore = queryTerms.length > 0 
            ? Math.round((matchCount / queryTerms.length) * 80) + verifiedBonus
            : (student.placementReadiness || 75);

        return {
            candidateId: student.id,
            name: student.fullName || student.name || 'Candidate',
            matchScore: Math.min(99, Math.max(30, skillScore)),
            skills: skills.map(s => s.name),
            college: student.collegeName || 'Accredited University',
            cgpa: student.cgpa || 7.5,
            collegeId: student.collegeId
        };
    });

    if (options.minCgpa) {
        candidates = candidates.filter(c => c.cgpa >= options.minCgpa);
    }
    if (options.collegeId && options.collegeId !== 'All') {
        candidates = candidates.filter(c => c.collegeId === options.collegeId);
    }

    candidates.sort((a, b) => b.matchScore - a.matchScore);
    return candidates;
}

export async function getNextBestAction(studentOrId) {
    const student = await resolveStudent(studentOrId);
    if (!student) {
        return {
            studentId: studentOrId,
            actionTitle: "Complete Student Profile",
            actionType: "PROFILE",
            estimatedMinutes: 10,
            impact: "+10% Profile Completion",
            targetUrl: "/profile"
        };
    }

    const skills = extractStudentSkills(student);
    const unverifiedSkill = skills.find(s => s.status !== 'Verified');

    if (unverifiedSkill) {
        return {
            studentId: student.id,
            actionTitle: `Verify ${unverifiedSkill.name} Skill Badge`,
            actionType: "ASSESSMENT",
            estimatedMinutes: 25,
            impact: "+8% Placement Readiness Score",
            targetUrl: `/assessments`
        };
    }

    if ((student.placementReadiness || 0) < 80) {
        return {
            studentId: student.id,
            actionTitle: "Take AI Technical Mock Interview",
            actionType: "INTERVIEW",
            estimatedMinutes: 20,
            impact: "+12% Interview Confidence",
            targetUrl: "/mock-interview"
        };
    }

    return {
        studentId: student.id,
        actionTitle: "Apply to Top Matched Corporate Openings",
        actionType: "JOB_APPLICATION",
        estimatedMinutes: 15,
        impact: "Direct Recruiter Review",
        targetUrl: "/jobs"
    };
}

export async function calculateComprehensiveJobReadiness(studentOrId, jobId) {
    const student = await resolveStudent(studentOrId);
    const job = jobId ? await resolveJob(jobId) : null;

    if (!student) {
        return {
            studentId: studentOrId,
            overallReadinessScore: 50,
            readinessTier: "Foundational Phase",
            skillReadiness: 50,
            academicReadiness: 50,
            interviewReadiness: 50,
            projectPortfolioScore: 50,
            breakdown: []
        };
    }

    const skills = extractStudentSkills(student);
    const cgpa = student.cgpa || 7.0;
    const academicReadiness = Math.min(100, Math.round((cgpa / 10) * 100));

    let skillReadiness;
    if (job) {
        const match = await calculateJobMatch(student, job);
        skillReadiness = match.matchPercentage;
    } else {
        const verified = skills.filter(s => s.status === 'Verified');
        const avgScore = verified.length > 0 
            ? Math.round(verified.reduce((acc, s) => acc + (s.score || 80), 0) / verified.length)
            : 60;
        skillReadiness = Math.min(100, Math.round((avgScore * 0.7) + (verified.length * 10)));
    }

    const projectPortfolioScore = Math.min(100, Math.round((student.placementReadiness || 75) * 0.95 + 5));
    const interviewReadiness = Math.min(100, Math.max(50, Math.round((student.placementReadiness || 75) * 0.9)));

    const overallReadinessScore = Math.round(
        (skillReadiness * 0.40) +
        (academicReadiness * 0.20) +
        (projectPortfolioScore * 0.25) +
        (interviewReadiness * 0.15)
    );

    const readinessTier = overallReadinessScore >= 85
        ? "Placement Ready"
        : overallReadinessScore >= 70
        ? "Interview Stage Ready"
        : overallReadinessScore >= 55
        ? "Training Required"
        : "Foundational Phase";

    return {
        studentId: student.id,
        overallReadinessScore,
        readinessTier,
        skillReadiness,
        academicReadiness,
        interviewReadiness,
        projectPortfolioScore,
        breakdown: [
            { category: "Technical Skills", score: skillReadiness, weight: "40%" },
            { category: "Academic CGPA", score: academicReadiness, weight: "20%" },
            { category: "Project Quality", score: projectPortfolioScore, weight: "25%" },
            { category: "Interview Mock Score", score: interviewReadiness, weight: "15%" }
        ]
    };
}

export async function getCareerRecommendations(studentOrId, query) {
    const student = await resolveStudent(studentOrId);
    const roles = await generateCareerPathRecommendations(student || studentOrId);

    const studentSkills = extractStudentSkills(student || {});
    const topRole = roles[0];
    const complementarySkills = ['Docker', 'Cloud Architecture', 'GraphQL', 'System Design', 'Kubernetes', 'Redis'];
    const topSkillsToLearn = complementarySkills.filter(cs => !studentSkills.some(s => s.normalized === normalizeSkill(cs))).slice(0, 3);

    return {
        recommendedRoles: roles,
        topSkillsToLearn,
        nextMilestone: `Complete ${topRole?.title || 'Technical Specialist'} Certification Roadmap`
    };
}

export async function generatePersonalizedRoadmap(studentOrId, jobId, targetRole) {
    const student = await resolveStudent(studentOrId);
    const job = jobId ? await resolveJob(jobId) : null;
    const roleTitle = targetRole || job?.title || "Full-Stack Software Engineer";

    const studentSkills = extractStudentSkills(student || {});
    let gapSkills = [];

    if (job) {
        const match = await calculateJobMatch(student, job);
        gapSkills = match.skillGap;
    } else {
        const targetSkills = roleTitle.toLowerCase().includes('data') || roleTitle.toLowerCase().includes('ai')
            ? ['Machine Learning', 'PyTorch', 'Vector Databases', 'Model Deployment']
            : roleTitle.toLowerCase().includes('frontend')
            ? ['TypeScript', 'Next.js App Router', 'Tailwind CSS', 'Web Performance']
            : ['System Design', 'Docker', 'PostgreSQL Optimization', 'Microservices'];

        gapSkills = targetSkills.filter(ts => !studentSkills.some(s => s.normalized === normalizeSkill(ts)));
    }

    if (gapSkills.length === 0) {
        gapSkills = ['Advanced System Architecture', 'Cloud Deployment & CI/CD'];
    }

    const totalWeeks = Math.max(4, Math.min(8, gapSkills.length + 3));
    const milestones = [];

    let weekNum = 1;
    milestones.push({
        week: weekNum++,
        title: `${gapSkills[0] || 'Core Technologies'}: Architecture & Fundamentals`,
        status: "COMPLETED"
    });

    for (let i = 1; i < gapSkills.length && weekNum <= totalWeeks - 2; i++) {
        milestones.push({
            week: weekNum,
            title: `${gapSkills[i]}: Hands-on Implementation & Best Practices`,
            status: weekNum === 2 ? "IN_PROGRESS" : "UPCOMING"
        });
        weekNum++;
    }

    milestones.push({
        week: weekNum++,
        title: `Production Capstone Project integrating ${gapSkills.slice(0, 2).join(' and ')}`,
        status: "UPCOMING"
    });

    milestones.push({
        week: weekNum,
        title: "Mock Technical & Behavioral Interview Simulation",
        status: "UPCOMING"
    });

    const progressPercent = Math.round((1 / totalWeeks) * 100);

    return {
        studentId: student?.id || studentOrId,
        targetRole: roleTitle,
        totalWeeks,
        currentWeek: 2,
        progressPercent,
        milestones
    };
}

export async function explainWhyNotEligible(studentOrId, jobId) {
    const student = await resolveStudent(studentOrId);
    const job = await resolveJob(jobId);

    if (!student || !job) {
        return {
            eligible: false,
            reasons: ["Student or job record not found"],
            recommendedActions: ["Verify your login session and job posting ID"]
        };
    }

    const reasons = [];
    const recommendedActions = [];

    if (job.minCgpa && student.cgpa < job.minCgpa) {
        reasons.push(`Target job requires minimum CGPA of ${job.minCgpa.toFixed(1)} (Current CGPA: ${student.cgpa.toFixed(2)})`);
        recommendedActions.push(`Request a campus placement committee CGPA waiver or apply for companies without hard cutoff`);
    }

    if (job.graduationYear && student.graduationYear && student.graduationYear !== job.graduationYear) {
        reasons.push(`Job is recruiting the ${job.graduationYear} graduating batch (Your batch: ${student.graduationYear})`);
        recommendedActions.push(`Explore job openings open to ${student.graduationYear} graduates`);
    }

    if (job.degree && student.degree && !job.degree.toLowerCase().includes(student.degree.toLowerCase())) {
        reasons.push(`Job requires ${job.degree} (Your degree: ${student.degree})`);
    }

    const studentSkills = extractStudentSkills(student);
    const requiredSkills = extractJobRequiredSkills(job);

    const missingSkills = [];
    for (const req of requiredSkills) {
        const hasSkill = studentSkills.some(s => s.normalized === req.normalized || s.name.toLowerCase().includes(req.name.toLowerCase()));
        if (!hasSkill) {
            missingSkills.push(req.name);
        }
    }

    missingSkills.forEach(skill => {
        reasons.push(`Missing required skill badge: ${skill}`);
        recommendedActions.push(`Complete coursework and earn a verified skill badge for ${skill}`);
    });

    const isEligible = reasons.length === 0;

    return {
        eligible: isEligible,
        reasons,
        recommendedActions: isEligible 
            ? ["You satisfy all candidate requirements. Submit your application directly."]
            : recommendedActions
    };
}

export async function extractSkillsFromJobDescription(text, options = {}) {
    return await aiService.analyzeJobDescription(text, options);
}
