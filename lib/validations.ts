import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['student', 'college', 'company']),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  isGoogleAuth: z.boolean().optional(),
  collegeName: z.string().optional(),
  department: z.string().optional(),
  graduationYear: z.string().or(z.number()).optional(),
  companyName: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  identifier: z.string().optional(),
  password: z.string().optional(),
  otp: z.string().length(6).optional(),
  userId: z.string().optional(),
  googleCredential: z.string().optional(),
  isGoogleAuth: z.boolean().optional(),
}).refine(data => data.email || data.phone || data.identifier || data.userId || data.googleCredential, {
  message: "Either email, phone, or identity token is required."
});

export const jobPublishSchema = z.object({
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  companyLogo: z.string().optional(),
  title: z.string().min(2),
  department: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.union([z.string(), z.array(z.string())]).optional(),
  requirements: z.union([z.string(), z.array(z.string())]).optional(),
  requiredSkills: z.array(z.any()),
  location: z.string().optional(),
  workMode: z.string().optional(),
  salary: z.string().optional(),
  employmentType: z.string().optional(),
  minCgpa: z.union([z.string(), z.number()]).optional(),
  graduationYear: z.union([z.string(), z.number()]).optional(),
  degree: z.string().optional(),
  branch: z.string().optional(),
  openings: z.union([z.string(), z.number()]).optional(),
  deadline: z.string().optional()
});

export const projectSubmitSchema = z.object({
  studentId: z.string(),
  projectId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional()
});
