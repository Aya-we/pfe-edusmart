import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId }
    });
  }

  async getByClass(classId: string, period: string) {
    return this.prisma.timetable.findMany({
      where: { classId, period },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        room: true,
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async getAllForSchool(schoolId: string, period: string) {
    const classes = await this.prisma.class.findMany({ where: { schoolId }, select: { id: true } });
    const classIds = classes.map(c => c.id);

    return this.prisma.timetable.findMany({
      where: { classId: { in: classIds }, period },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        room: true,
        class: true
      }
    });
  }

  async getByTeacher(teacherUserId: string, period: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId }
    });

    if (!teacher) return [];

    return this.prisma.timetable.findMany({
      where: { teacherId: teacher.id, period },
      include: {
        subject: true,
        class: true,
        room: true,
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async saveBulk(schoolId: string, period: string, entries: any[]) {
    const classes = await this.prisma.class.findMany({ where: { schoolId }, select: { id: true } });
    const classIds = classes.map(c => c.id);

    // Delete existing for this period
    await this.prisma.timetable.deleteMany({
      where: { classId: { in: classIds }, period }
    });

    // Insert new
    if (entries.length > 0) {
      const entriesWithPeriod = entries.map(e => ({ ...e, period }));
      await this.prisma.timetable.createMany({
        data: entriesWithPeriod
      });
    }
    return { success: true, count: entries.length };
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
