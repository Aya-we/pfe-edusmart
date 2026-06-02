import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async markBulk(data: { date: Date; classId: string; timeSlot?: string; records: { studentId: string; status: string }[] }) {
    const operations = data.records.map(async (record) => {
      // Upsert to handle multiple saves for the same slot
      if (data.timeSlot) {
        const existing = await this.prisma.attendance.findFirst({
          where: { studentId: record.studentId, timeSlot: data.timeSlot, date: {
            gte: new Date(new Date(data.date).setHours(0,0,0,0)),
            lt: new Date(new Date(data.date).setHours(23,59,59,999))
          }}
        });
        if (existing) {
          const attendance = await this.prisma.attendance.update({
            where: { id: existing.id },
            data: { status: record.status },
            include: { student: { include: { user: true } } }
          });
          
          if (record.status === 'ABSENT') {
            this.notificationsGateway.sendAbsenceNotification(
              attendance.student.user.schoolId,
              `${attendance.student.user.firstName} ${attendance.student.user.lastName}`
            );
          }
          return attendance;
        }
      }
      
      const attendance = await this.prisma.attendance.create({
        data: {
          date: data.date,
          status: record.status,
          studentId: record.studentId,
          timeSlot: data.timeSlot,
        },
        include: { student: { include: { user: true } } }
      });

      // Si l'élève est absent, on envoie une notification temps réel
      if (record.status === 'ABSENT') {
        this.notificationsGateway.sendAbsenceNotification(
          attendance.student.user.schoolId,
          `${attendance.student.user.firstName} ${attendance.student.user.lastName}`
        );
      }
      return attendance;
    });
    return Promise.all(operations);
  }

  async findByClassAndDate(classId: string, date: Date) {
    // On commence par récupérer tous les élèves de la classe
    const students = await this.prisma.student.findMany({
      where: { classId },
      include: {
        user: true,
        attendances: {
          where: {
            date: {
              gte: new Date(date.setHours(0,0,0,0)),
              lt: new Date(date.setHours(23,59,59,999)),
            }
          }
        }
      },
      orderBy: {
        user: { lastName: 'asc' }
      }
    });

    return students.map(s => ({
      studentId: s.id,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      attendances: s.attendances,
    }));
  }

  async getStudentAttendance(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId }
    });
    if (!student) return [];

    return this.prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
    });
  }

  async submitJustification(attendanceId: string, fileUrl: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { 
        justification: fileUrl,
        // On garde justified: false jusqu'à ce que l'admin valide
      },
    });
  }

  async getPendingJustifications() {
    return this.prisma.attendance.findMany({
      where: { 
        status: 'ABSENT',
        justified: false,
        justification: { not: null }
      },
      include: {
        student: {
          include: {
            user: true,
            class: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async approveJustification(id: string) {
    return this.prisma.attendance.update({
      where: { id },
      data: { justified: true }
    });
  }

  async rejectJustification(id: string) {
    return this.prisma.attendance.update({
      where: { id },
      data: { justification: null } // On réinitialise pour qu'il puisse en soumettre une autre
    });
  }
}
