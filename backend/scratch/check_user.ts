import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@edusmart.com' }
  });
  console.log('USER_FOUND:', user ? 'YES' : 'NO');
  if (user) console.log('USER_ROLE:', user.role);
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
