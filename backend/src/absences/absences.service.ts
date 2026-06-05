import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbsencesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { teacherId: string, date: string, reason?: string, schoolId: string }) {
    return this.prisma.teacherAbsence.create({
      data: {
        teacherId: data.teacherId,
        date: new Date(data.date),
        reason: data.reason,
        schoolId: data.schoolId
      }
    });
  }

  findAll(schoolId: string) {
    return this.prisma.teacherAbsence.findMany({
      where: { schoolId },
      include: {
        teacher: {
          include: { user: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  remove(id: string) {
    return this.prisma.teacherAbsence.delete({
      where: { id }
    });
  }
}
