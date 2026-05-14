import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async getByClass(classId: string) {
    return this.prisma.timetable.findMany({
      where: { classId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async getByTeacher(teacherUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId }
    });

    if (!teacher) return [];

    return this.prisma.timetable.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: true,
        class: true,
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createSlot(data: { 
    day: string; 
    startTime: string; 
    endTime: string; 
    classId: string; 
    subjectId: string; 
    teacherId: string 
  }) {
    return this.prisma.timetable.create({
      data,
    });
  }

  async deleteSlot(id: string) {
    return this.prisma.timetable.delete({
      where: { id },
    });
  }
}
