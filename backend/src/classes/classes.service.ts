import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
  }

  async findByTeacher(teacherUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
      include: {
        classes: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        }
      }
    });
    return teacher?.classes || [];
  }

  async createClass(data: { name: string; schoolId: string }) {
    return this.prisma.class.create({
      data,
    });
  }

  async findStudentsByClass(classId: string) {
    return this.prisma.student.findMany({
      where: { classId },
      include: {
        user: true
      },
      orderBy: {
        user: { lastName: 'asc' }
      }
    });
  }
}
