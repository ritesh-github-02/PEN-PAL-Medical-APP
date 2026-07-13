import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'ParticipantToken' AND table_schema = 'public'
    ORDER BY column_name
  `;
  console.log('ParticipantToken columns:', cols.map(c => c.column_name).join(', '));

  const secCols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'TokenSecurityEvent' AND table_schema = 'public'
    ORDER BY column_name
  `;
  console.log('TokenSecurityEvent columns:', secCols.map(c => c.column_name).join(', '));

  const sessCols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Session' AND table_schema = 'public'
    ORDER BY column_name
  `;
  console.log('Session columns:', sessCols.map(c => c.column_name).join(', '));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
