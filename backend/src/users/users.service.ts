import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: string, schoolId?: string) {
    const whereClause: any = {};
    if (role) whereClause.role = role as any;
    if (schoolId) whereClause.schoolId = schoolId;
    
    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
            parent: { include: { user: true } },
          },
        },
        teacher: { include: { teacherClasses: { include: { class: true } } } },
        parent: true,
      },
    });
    
    return users.map(user => {
      if (user.teacher) {
        (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
        delete (user.teacher as any).teacherClasses;
      }
      return user;
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            parent: { include: { user: true } },
          },
        },
        teacher: { include: { teacherClasses: { include: { class: true } } } },
        parent: { include: { students: { include: { user: true, class: true } } } },
      },
    });
    
    if (user && user.teacher) {
      (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
      delete (user.teacher as any).teacherClasses;
    }
    
    return user;
  }

  async update(id: string, data: any) {
    const { classId, teacherClasses, parentId, ...userData } = data;

    // 1. Update User basic info
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    // 2. Update Student (class + parent)
    if (user.role === 'STUDENT') {
      const studentUpdate: any = {};
      if (classId) studentUpdate.classId = classId;
      // parentId: null means "remove parent", string means "assign parent"
      if (parentId !== undefined) {
        studentUpdate.parentId = parentId || null;
      }
      if (Object.keys(studentUpdate).length > 0) {
        await this.prisma.student.upsert({
          where: { userId: id },
          update: studentUpdate,
          create: {
            userId: id,
            classId: classId || 'no-class',
            parentId: parentId || null
          }
        });
      }
    }

    // 3. Update Teacher Classes
    if (user.role === 'TEACHER' && teacherClasses) {
      await this.prisma.teacher.upsert({
        where: { userId: id },
        update: {
          teacherClasses: {
            deleteMany: {},
            create: teacherClasses.map((cid: string) => ({ classId: cid })),
          },
        },
        create: {
          userId: id,
          teacherClasses: {
            create: teacherClasses.map((cid: string) => ({ classId: cid })),
          },
        }
      });
    }
    // 4. Update Parent
    if (user.role === 'PARENT') {
      await this.prisma.parent.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id }
      });
    }

    return user;
  }
  async delete(id: string) {
    // Delete profile first to avoid FK constraints if necessary (depending on schema)
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getTeacherDashboardData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher: {
          include: {
            teacherClasses: true,
            teacherSubjects: true,
          }
        }
      }
    });

    if (!user || !user.teacher) {
      throw new Error("Professeur non trouvé");
    }

    const teacher = user.teacher;
    const classesCount = teacher.teacherClasses.length;
    const subjectsCount = teacher.teacherSubjects.length;

    // Get today's timetables
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dayMap: Record<string, string> = {
      'Monday': 'Lundi',
      'Tuesday': 'Mardi',
      'Wednesday': 'Mercredi',
      'Thursday': 'Jeudi',
      'Friday': 'Vendredi',
      'Saturday': 'Samedi',
      'Sunday': 'Dimanche'
    };
    const todayFr = dayMap[today] || 'Lundi';

    const timetables = await this.prisma.timetable.findMany({
      where: {
        teacherId: teacher.id,
        day: todayFr
      },
      include: {
        class: true,
        subject: true,
        room: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Calculate hours
    let totalHours = 0;
    timetables.forEach(t => {
      const start = parseInt(t.startTime.split(':')[0]);
      const end = parseInt(t.endTime.split(':')[0]);
      totalHours += (end - start);
    });

    // Count attendances done today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.groupBy({
      by: ['timetableId'],
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        timetable: {
          teacherId: teacher.id
        }
      }
    });

    return {
      classesCount,
      subjectsCount,
      hoursToday: totalHours,
      attendancesDone: attendances.length,
      totalTimetablesToday: timetables.length,
      upcomingCourses: timetables.map(t => ({
        time: `${t.startTime} - ${t.endTime}`,
        class: t.class.name,
        subject: t.subject.name,
        room: t.room ? t.room.name : 'Non assignée'
      }))
    };
  }

  async getPasswordResetRequests(schoolId: string) {
    return this.prisma.passwordResetRequest.findMany({
      where: {
        user: { schoolId }
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async resolvePasswordReset(requestId: string, newPassword?: string) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) throw new Error("Requête non trouvée");

    if (newPassword) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: request.userId },
        data: { password: hashedPassword }
      });
    }

    return this.prisma.passwordResetRequest.delete({
      where: { id: requestId }
    });
  }
}
