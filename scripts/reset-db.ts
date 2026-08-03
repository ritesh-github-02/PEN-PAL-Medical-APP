import prisma from '../lib/prisma';

async function resetDatabase() {
  console.log('🧹 Clearing all data from PostgreSQL tables...');

  // Delete in reverse order of foreign key constraints
  await prisma.eventLog.deleteMany();
  await prisma.tokenSecurityEvent.deleteMany();
  await prisma.questionnaireResponse.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.session.deleteMany();
  await prisma.participantToken.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.campaign.deleteMany();

  console.log('✨ Database cleared successfully! All tables are fresh and empty.');
}

resetDatabase()
  .catch((error) => {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
