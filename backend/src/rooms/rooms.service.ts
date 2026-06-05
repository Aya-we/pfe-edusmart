import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(createRoomDto: { name: string }, schoolId: string) {
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
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

  remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
