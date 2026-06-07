import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId?: string) {
    return this.prisma.subject.findMany({
      where: schoolId ? { schoolId } : {},
      orderBy: { name: 'asc' }
    });
  }

  async findByTeacher(teacherId: string) {
    const ts = await this.prisma.teacherSubject.findMany({
      where: { teacher: { userId: teacherId } },
      include: { subject: true }
    });
    return ts.map(t => t.subject);
  }

  async create(data: { name: string; schoolId: string }) {
    return this.prisma.subject.create({ data });
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
