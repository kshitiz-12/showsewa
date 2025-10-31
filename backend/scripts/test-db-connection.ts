import prisma from '../src/lib/prisma';

(async () => {
  try {
    const res = await prisma.$queryRaw`SELECT now() as current_time, version() as db_version`;
    console.log('✅ Database connection successful!');
    console.log('📊 Query result:', res);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('❌ Database connection failed:', e);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
})();

