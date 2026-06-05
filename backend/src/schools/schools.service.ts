import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.school.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    // On extrait uniquement les champs scalaires autorisés
    // pour éviter que Prisma reçoive les relations (users, classes...)
    const { name, address, phone, email, logo, subdomain, themeSettings } = data;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (logo !== undefined) updateData.logo = logo;
    if (subdomain !== undefined) updateData.subdomain = subdomain;
    if (themeSettings !== undefined) updateData.themeSettings = themeSettings;

    return this.prisma.school.update({
      where: { id },
      data: updateData,
    });
  }

  async findAll() {
    return this.prisma.school.findMany();
  }
}
