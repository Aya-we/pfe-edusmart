import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { title: string, date: string, classId: string, subjectId: string, schoolId: string }) {
    return this.prisma.exam.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        classId: data.classId,
        subjectId: data.subjectId,
        schoolId: data.schoolId
      }
    });
  }

  findAll(schoolId: string) {
    return this.prisma.exam.findMany({
      where: { schoolId },
      include: {
        class: true,
        subject: true
      },
      orderBy: { date: 'asc' }
    });
  }

  findByClass(classId: string) {
    return this.prisma.exam.findMany({
      where: { classId },
      include: {
        subject: true
      },
      orderBy: { date: 'asc' }
    });
  }

  remove(id: string) {
    return this.prisma.exam.delete({
      where: { id }
    });
  }
}
