import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(schoolId?: string) {
    return this.prisma.resource.findMany({
      where: schoolId ? {
        OR: [
          { subject: { schoolId } },
          { class: { schoolId } },
          { teacher: { user: { schoolId } } }
        ]
      } : {},
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: {
    title: string;
    type: string;
    fileUrl: string;
    size?: string;
    subjectId?: string;
    classId?: string;
    teacherId?: string; // This is actually userId from the frontend
  }) {
    let actualTeacherId = undefined;
    
    // Si on a un teacherId (qui est en fait le userId), on cherche le vrai Teacher
    if (data.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: data.teacherId }
      });
      if (teacher) {
        actualTeacherId = teacher.id;
      }
    }

    return this.prisma.resource.create({
      data: {
        title: data.title,
        type: data.type,
        fileUrl: data.fileUrl,
        size: data.size,
        subjectId: data.subjectId || null,
        classId: data.classId || null,
        teacherId: actualTeacherId
      }
    });
  }

  async delete(id: string) {
    return this.prisma.resource.delete({
      where: { id }
    });
  }
}
