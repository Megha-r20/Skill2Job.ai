// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'Software Developer';
    const studentId = searchParams.get('studentId') || 'std_1';

    // Retrieve student profile and skills from local mock DB
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const verifiedSkills = [] as any[];
    const verifiedSkillsNames = verifiedSkills.map(v => v.skillName.toLowerCase());

    // Get all projects from database
    const allProjects = [] as any[];

    // Map and score recommendations dynamically
    const scoredRecommendations = allProjects.map(proj => {
      let score = 0;
      let matchReasons: string[] = [] as any[];

      // 1. Role match: prioritize projects targeting active query role or student target role
      const matchesTargetRole = proj.targetRole.toLowerCase().includes(role.toLowerCase()) || 
                                role.toLowerCase().includes(proj.targetRole.toLowerCase());
      if (matchesTargetRole) {
        score += 50;
        matchReasons.push(`Matches target career role: ${proj.targetRole}`);
      }

      // 2. Skill match: check if student has verified skills in technologies required
      const matchingTech = proj.technologies.filter(tech => verifiedSkillsNames.includes(tech.toLowerCase()));
      if (matchingTech.length > 0) {
        score += matchingTech.length * 15;
        matchReasons.push(`Leverages your verified skills: ${matchingTech.join(', ')}`);
      } else {
        // Suggest it as a learning opportunity to bridge the gap
        matchReasons.push(`Calibrated to bridge skills gaps in: ${proj.technologies.slice(0, 2).join(' & ')}`);
      }

      // 3. Readiness / CGPA check: if student has higher readiness, match harder projects
      const studentReadiness = student?.placementReadiness || 0;
      if (studentReadiness > 70 && proj.difficulty === 'Advanced') {
        score += 20;
        matchReasons.push('Aligned with your advanced placement readiness tier');
      } else if (studentReadiness <= 70 && proj.difficulty === 'Beginner') {
        score += 20;
        matchReasons.push('Foundational project for skill reinforcement');
      }

      return {
        ...proj,
        matchScore: score,
        matchReasons
      };
    });

    // Sort by match score descending
    const recommendations = scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      role,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching project recommendations:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
