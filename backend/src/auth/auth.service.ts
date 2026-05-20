import { Injectable } from '@nestjs/common';
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
    
    // 1. Créer l'utilisateur de base
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        schoolId: data.schoolId,
      },
    });

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
      await this.prisma.parent.create({
        data: { userId: user.id },
      });
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
}
