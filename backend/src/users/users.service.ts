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
        teacher: { 
          include: { 
            teacherClasses: { include: { class: true } },
            teacherSubjects: { include: { subject: true } }
          } 
        },
        parent: true,
      },
    });
    
    return users.map(user => {
      if (user.teacher) {
        (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
        (user.teacher as any).subjects = (user.teacher as any).teacherSubjects?.map((ts: any) => ts.subject) || [];
        delete (user.teacher as any).teacherClasses;
        delete (user.teacher as any).teacherSubjects;
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
        teacher: { 
          include: { 
            teacherClasses: { include: { class: true } },
            teacherSubjects: { include: { subject: true } }
          } 
        },
        parent: { include: { students: { include: { user: true, class: true } } } },
      },
    });
    
    if (user && user.teacher) {
      (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
      (user.teacher as any).subjects = (user.teacher as any).teacherSubjects?.map((ts: any) => ts.subject) || [];
      delete (user.teacher as any).teacherClasses;
      delete (user.teacher as any).teacherSubjects;
    }
    
    return user;
  }

  async update(id: string, data: any) {
    const { classId, teacherClasses, teacherSubjects, parentId, studentIds, ...userData } = data;

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

    // 3. Update Teacher Classes and Subjects
    if (user.role === 'TEACHER') {
      const teacherUpdate: any = {};
      const teacherCreate: any = { userId: id };
      
      if (teacherClasses) {
        teacherUpdate.teacherClasses = {
          deleteMany: {},
          create: teacherClasses.map((cid: string) => ({ classId: cid })),
        };
        teacherCreate.teacherClasses = {
          create: teacherClasses.map((cid: string) => ({ classId: cid })),
        };
      }
      if (teacherSubjects) {
        teacherUpdate.teacherSubjects = {
          deleteMany: {},
          create: teacherSubjects.map((sid: string) => ({ subjectId: sid })),
        };
        teacherCreate.teacherSubjects = {
          create: teacherSubjects.map((sid: string) => ({ subjectId: sid })),
        };
      }

      await this.prisma.teacher.upsert({
        where: { userId: id },
        update: teacherUpdate,
        create: teacherCreate
      });
    }
    // 4. Update Parent
    if (user.role === 'PARENT') {
      const parent = await this.prisma.parent.upsert({
        where: { userId: id },
        update: {},
        create: { userId: id }
      });
      if (studentIds !== undefined) {
         await this.prisma.student.updateMany({
           where: { parentId: parent.id },
           data: { parentId: null }
         });
         if (studentIds.length > 0) {
           await this.prisma.student.updateMany({
             where: { id: { in: studentIds } },
             data: { parentId: parent.id }
           });
         }
      }
    }

    return user;
  }
  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    // 1. Delete messages (sent and received)
    await this.prisma.message.deleteMany({
      where: { OR: [{ senderId: id }, { receiverId: id }] }
    });

    // 2. Delete password reset requests
    await this.prisma.passwordResetRequest.deleteMany({
      where: { userId: id }
    });

    // 3. Delete role specific records
    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({ where: { userId: id } });
      if (student) {
        await this.prisma.grade.deleteMany({ where: { studentId: student.id } });
        await this.prisma.attendance.deleteMany({ where: { studentId: student.id } });
        await this.prisma.student.delete({ where: { id: student.id } });
      }
    } else if (user.role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: id } });
      if (teacher) {
        await this.prisma.teacherClass.deleteMany({ where: { teacherId: teacher.id } });
        await this.prisma.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
        await this.prisma.timetable.deleteMany({ where: { teacherId: teacher.id } });
        await this.prisma.resource.deleteMany({ where: { teacherId: teacher.id } });
        await this.prisma.teacherAbsence.deleteMany({ where: { teacherId: teacher.id } });
        await this.prisma.teacher.delete({ where: { id: teacher.id } });
      }
    } else if (user.role === 'PARENT') {
      const parent = await this.prisma.parent.findUnique({ where: { userId: id } });
      if (parent) {
        await this.prisma.student.updateMany({
          where: { parentId: parent.id },
          data: { parentId: null }
        });
        await this.prisma.parent.delete({ where: { id: parent.id } });
      }
    }

    // Finally delete user
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
