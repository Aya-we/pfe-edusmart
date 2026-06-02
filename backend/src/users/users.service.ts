import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: string) {
    const users = await this.prisma.user.findMany({
      where: role ? { role: role as any } : {},
      include: {
        student: {
          include: {
            class: true,
            parent: { include: { user: true } },
          },
        },
        teacher: { include: { teacherClasses: { include: { class: true } } } },
        parent: true,
      },
    });
    
    return users.map(user => {
      if (user.teacher) {
        (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
        delete (user.teacher as any).teacherClasses;
      }
      return user;
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            parent: { include: { user: true } },
          },
        },
        teacher: { include: { teacherClasses: { include: { class: true } } } },
        parent: { include: { students: { include: { user: true, class: true } } } },
      },
    });
    
    if (user && user.teacher) {
      (user.teacher as any).classes = (user.teacher as any).teacherClasses?.map((tc: any) => tc.class) || [];
      delete (user.teacher as any).teacherClasses;
    }
    
    return user;
  }

  async update(id: string, data: any) {
    const { classId, teacherClasses, parentId, ...userData } = data;

    // 1. Update User basic info
    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
    });

    // 2. Update Student (class + parent)
    if (user.role === 'STUDENT') {
      const studentUpdate: any = {};
      if (classId) studentUpdate.classId = classId;
      // parentId: null means "remove parent", string means "assign parent"
      if (parentId !== undefined) {
        studentUpdate.parentId = parentId || null;
      }
      if (Object.keys(studentUpdate).length > 0) {
        await this.prisma.student.update({
          where: { userId: id },
          data: studentUpdate,
        });
      }
    }

    // 3. Update Teacher Classes
    if (user.role === 'TEACHER' && teacherClasses) {
      await this.prisma.teacher.update({
        where: { userId: id },
        data: {
          teacherClasses: {
            deleteMany: {},
            create: teacherClasses.map((cid: string) => ({ classId: cid })),
          },
        },
      });
    }

    return user;
  }

  async delete(id: string) {
    // Delete profile first to avoid FK constraints if necessary (depending on schema)
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
