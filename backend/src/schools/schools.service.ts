import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.school.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.school.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return this.prisma.school.findMany();
  }
}
