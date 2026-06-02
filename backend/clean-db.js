const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.student.deleteMany({ where: { classId: 'no-class' } });
    console.log('Cleaned up corrupted students.');
  } catch (e) {
    console.error('Cleanup error:', e);
  } finally {
    process.exit(0);
  }
}
run();
