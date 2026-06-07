import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let finalSchoolId = data.schoolId;

    if (data.role === 'ADMIN' && data.schoolName) {
      const baseSubdomain = data.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const subdomain = baseSubdomain + '-' + Math.floor(Math.random() * 10000);
      const newSchool = await this.prisma.school.create({
        data: {
          name: data.schoolName,
          subdomain: subdomain,
        },
      });
      finalSchoolId = newSchool.id;
    }

    // 1. Créer l'utilisateur de base
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          schoolId: finalSchoolId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Cet email est déjà utilisé.');
      }
      throw error;
    }

    // 2. Créer le profil spécifique selon le rôle
    if (data.role === 'TEACHER') {
      await this.prisma.teacher.create({
        data: { userId: user.id },
      });
    } else if (data.role === 'STUDENT') {
      // Si classId est fourni, on le met, sinon on attend que l'admin l'assigne plus tard
      await this.prisma.student.create({
        data: { 
          userId: user.id,
          classId: data.classId || "no-class", // On peut mettre une valeur temporaire ou gérer le null si le schéma le permet
        },
      });
    } else if (data.role === 'PARENT') {
      const parent = await this.prisma.parent.create({
        data: { userId: user.id },
      });
      if (data.studentIds && data.studentIds.length > 0) {
        await this.prisma.student.updateMany({
          where: { id: { in: data.studentIds } },
          data: { parentId: parent.id }
        });
      }
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, schoolId: user.schoolId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
      }
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Pour des raisons de sécurité, on ne renvoie pas d'erreur si l'email n'existe pas.
      return { message: 'Si un compte correspond à cette adresse, une demande a été envoyée à l\'administrateur.' };
    }

    await this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
      },
    });

    return { message: 'Si un compte correspond à cette adresse, une demande a été envoyée à l\'administrateur.' };
  }
}
