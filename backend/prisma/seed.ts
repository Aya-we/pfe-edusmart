import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create a School
  const school = await prisma.school.upsert({
    where: { subdomain: 'test-ecole' },
    update: {},
    create: {
      name: 'École Internationale de Casablanca',
      subdomain: 'test-ecole',
      address: 'Anfa, Casablanca',
      phone: '0522000000',
    },
  });

  // 2. Admin
  await prisma.user.upsert({
    where: { email: 'admin@edusmart.com' },
    update: {},
    create: {
      email: 'admin@edusmart.com',
      password: hashedPassword,
      firstName: 'Directeur',
      lastName: 'EduSmart',
      role: 'ADMIN',
      schoolId: school.id,
    },
  });

  // 3. Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'prof.alaoui@ecole.ma' },
    update: {},
    create: {
      email: 'prof.alaoui@ecole.ma',
      password: hashedPassword,
      firstName: 'Mohamed',
      lastName: 'Alaoui',
      role: 'TEACHER',
      schoolId: school.id,
    },
  });

  const teacherProfile = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: { userId: teacherUser.id },
  });

  // 4. Class
  const classObj = await prisma.class.upsert({
    where: { id: 'class-1' },
    update: {},
    create: {
      id: 'class-1',
      name: '2ème BAC PC 1',
      schoolId: school.id,
    }
  });

  // 5. Subject
  const mathSubject = await prisma.subject.upsert({
    where: { id: 'math-1' },
    update: {},
    create: {
      id: 'math-1',
      name: 'Mathématiques',
      schoolId: school.id,
    }
  });

  const physSubject = await prisma.subject.upsert({
    where: { id: 'phys-1' },
    update: {},
    create: {
      id: 'phys-1',
      name: 'Physique-Chimie',
      schoolId: school.id,
    }
  });

  // 6. Resources (Library)
  await prisma.resource.deleteMany({}); // On reset les ressources pour le test
  await prisma.resource.createMany({
    data: [
      {
        title: 'Support de Cours - Algèbre',
        type: 'pdf',
        fileUrl: 'https://example.com/algebre.pdf',
        subjectId: mathSubject.id,
        teacherId: teacherProfile.id,
        classId: classObj.id,
      },
      {
        title: 'Expérience Électricité (Vidéo)',
        type: 'video',
        fileUrl: 'https://example.com/physique.mp4',
        subjectId: physSubject.id,
        teacherId: teacherProfile.id,
        classId: classObj.id,
      }
    ]
  });

  // 7. Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@edusmart.com' },
    update: {},
    create: {
      email: 'parent@edusmart.com',
      password: hashedPassword,
      firstName: 'Karim',
      lastName: 'Benani',
      role: 'PARENT',
      schoolId: school.id,
    },
  });

  const parentProfile = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id }
  });

  // 8. Student (Ahmed) linked to Parent
  const studentUser = await prisma.user.upsert({
    where: { email: 'ahmed@edusmart.com' },
    update: {},
    create: {
      email: 'ahmed@edusmart.com',
      password: hashedPassword,
      firstName: 'Ahmed',
      lastName: 'Benani',
      role: 'STUDENT',
      schoolId: school.id,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      classId: classObj.id,
      parentId: parentProfile.id
    }
  });

  console.log('Seed completed successfully with ALL roles and data!');
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
