import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string, capacity?: number }, schoolId: string) {
    return this.prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity ? Number(data.capacity) : 30,
        schoolId,
      },
    });
  }

  findAll(schoolId: string) {
    return this.prisma.room.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    });
  }

  update(id: string, data: { name?: string, capacity?: number }) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
