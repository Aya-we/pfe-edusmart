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
    teacherId?: string;
  }) {
    return this.prisma.resource.create({
      data
    });
  }

  async delete(id: string) {
    return this.prisma.resource.delete({
      where: { id }
    });
  }
}
