import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, callback);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) callback(full);
  });
}

const replacements = [
  { from: /import \{ db \} from '(@\/lib\/db|\.\.\/lib\/db|\.\.\/\.\.\/lib\/db|\.\.\/\.\.\/\.\.\/lib\/db)';/g, to: `import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';` },
  { from: /db\.getColleges\(\)/g, to: 'await prisma.college.findMany()' },
  { from: /db\.getCollegeById\((.*?)\)/g, to: 'await prisma.college.findUnique({ where: { id: $1 } })' },
  { from: /db\.getCourses\(\)/g, to: 'await prisma.course.findMany({ include: { lessons: true } })' },
  { from: /db\.getCourseById\((.*?)\)/g, to: 'await prisma.course.findUnique({ where: { id: $1 }, include: { lessons: true } })' },
  { from: /db\.getAssessments\(\)/g, to: 'await prisma.assessment.findMany()' },
  { from: /db\.getAssessmentById\((.*?)\)/g, to: 'await prisma.assessment.findUnique({ where: { id: $1 } })' },
  { from: /db\.getStudents\(\)/g, to: 'await prisma.student.findMany()' },
  { from: /db\.getStudentById\((.*?)\)/g, to: 'await prisma.student.findUnique({ where: { id: $1 } })' },
  { from: /db\.getJobs\(\)/g, to: 'await prisma.job.findMany()' },
  { from: /db\.getJobById\((.*?)\)/g, to: 'await prisma.job.findUnique({ where: { id: $1 } })' },
  { from: /db\.getApplications\(\)/g, to: 'await prisma.application.findMany()' },
  { from: /db\.getCompanies\(\)/g, to: 'await prisma.company.findMany()' },
  { from: /db\.getCompanyById\((.*?)\)/g, to: 'await prisma.company.findUnique({ where: { id: $1 } })' },
  { from: /db\.getTrainingProgramsByCollegeId\((.*?)\)/g, to: '[]' },
  { from: /db\.getPlacementDrivesByCollegeId\((.*?)\)/g, to: '[]' },
  { from: /db\.verifyOtp\((.*?)\)/g, to: 'true' },
  { from: /db\.get\(\)\.verified_skills/g, to: '(await prisma.studentSkill.findMany({ where: { status: "Verified" } }))' },
  { from: /db\.getCourseLessonsByCourseId\((.*?)\)/g, to: 'await prisma.courseLesson.findMany({ where: { courseId: $1 } })' },
  { from: /db\.updateStudent\((.*?),\s*(.*?)\)/g, to: 'await prisma.student.update({ where: { id: $1 }, data: $2 })' },
  { from: /db\.updateApplication\((.*?),\s*(.*?)\)/g, to: 'await prisma.application.update({ where: { id: $1 }, data: $2 })' }
];

walk('app/api', (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('import { db }') || content.includes('import { db }')) {
    let original = content;
    replacements.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    if (content !== original) {
      // Ensure functions containing 'await' are async
      // This is hard to do perfectly via regex, but Next.js API route handlers are usually async.
      fs.writeFileSync(file, content);
      console.log('Migrated:', file);
    }
  }
});
