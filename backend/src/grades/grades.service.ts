import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { value: number; coefficient: number; comment?: string; studentId: string; subjectId: string }) {
    return this.prisma.grade.create({
      data,
    });
  }

  async findAllByClassAndSubject(classId: string, subjectId: string) {
    return this.prisma.grade.findMany({
      where: {
        student: { classId },
        subjectId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        student: {
          user: {
            lastName: 'asc',
          },
        },
      },
    });
  }

  async getStudentAverages(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId }
    });
    if (!student) return [];

    const grades = await this.prisma.grade.findMany({
      where: { studentId: student.id },
      include: { subject: true },
    });

    // Group by subject
    const subjectGrades = grades.reduce((acc, grade) => {
      if (!acc[grade.subjectId]) {
        acc[grade.subjectId] = {
          name: grade.subject.name,
          sum: 0,
          totalCoeff: 0,
        };
      }
      acc[grade.subjectId].sum += grade.value * grade.coefficient;
      acc[grade.subjectId].totalCoeff += grade.coefficient;
      return acc;
    }, {} as any);

    return Object.values(subjectGrades).map((s: any) => ({
      subject: s.name,
      average: s.totalCoeff > 0 ? (s.sum / s.totalCoeff).toFixed(2) : 0,
    }));
  }

  async update(id: string, value: number, comment?: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { value, comment },
    });
  }

  async delete(id: string) {
    return this.prisma.grade.delete({
      where: { id },
    });
  }
}
