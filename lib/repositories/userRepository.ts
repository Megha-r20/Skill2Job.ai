import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        collegeProfile: true,
        companyProfile: true
      }
    });
  },

  async findByEmailOrPhone(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });
  },

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  async createUser(data: any) {
    const passwordHash = await this.hashPassword(data.password);
    return prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        name: data.name,
        role: data.role,
        account_status: 'ACTIVE',
        verification_status: 'PENDING'
      }
    });
  },
  
  async createStudentAccount(data: any) {
    const passwordHash = await this.hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        name: data.fullName,
        role: 'student'
      }
    });

    return prisma.student.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        collegeId: data.collegeId || 'tmp',
        collegeName: data.collegeName,
        degree: data.degree || 'B.Tech',
        department: data.department,
        graduationYear: Number(data.graduationYear),
        cgpa: 0,
        location: '',
        placementStatus: 'Needs Training',
        placementReadiness: 0
      }
    });
  },

  async resetPassword(identifier: string, newPassword: string) {
    const user = await this.findByEmailOrPhone(identifier);
    if (!user) throw new Error('User not found');
    const passwordHash = await this.hashPassword(newPassword);
    return prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
  }
};
