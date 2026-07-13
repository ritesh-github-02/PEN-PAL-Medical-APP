const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching latest 10 TokenSecurityEvents...');
    const events = await prisma.tokenSecurityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log(JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Failed to query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
