import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId?: string) {
    return this.prisma.class.findMany({
      where: schoolId ? { schoolId } : {},
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
        teacherClasses: {
          include: {
            class: {
              include: {
                _count: {
                  select: { students: true }
                }
              }
            }
          }
        }
      }
    });
    return teacher?.teacherClasses.map((tc: any) => tc.class) || [];
  }

  async createClass(data: { name: string; studentCount?: number; schoolId: string }) {
    return this.prisma.class.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; studentCount?: number }) {
    return this.prisma.class.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.class.delete({
      where: { id },
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
