import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async create(data: { name: string; schoolId: string }) {
    return this.prisma.subject.create({ data });
  }
}
