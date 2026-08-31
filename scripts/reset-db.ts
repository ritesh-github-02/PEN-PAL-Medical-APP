import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning all study data from database...');

  // Delete all study records in safe dependency order
  const delMetrics = await prisma.slideMetric.deleteMany();
  console.log(`Deleted ${delMetrics.count} slide metrics.`);

  const delResponses = await prisma.questionnaireResponse.deleteMany();
  console.log(`Deleted ${delResponses.count} questionnaire responses.`);

  const delSurveys = await prisma.surveyResponse.deleteMany();
  console.log(`Deleted ${delSurveys.count} survey responses.`);

  const delEvents = await prisma.eventLog.deleteMany();
  console.log(`Deleted ${delEvents.count} event logs.`);

  const delSecEvents = await prisma.tokenSecurityEvent.deleteMany();
  console.log(`Deleted ${delSecEvents.count} token security events.`);

  const delSessions = await prisma.session.deleteMany();
  console.log(`Deleted ${delSessions.count} sessions.`);

  const delTokens = await prisma.participantToken.deleteMany();
  console.log(`Deleted ${delTokens.count} participant tokens.`);

  const delParticipants = await prisma.participant.deleteMany();
  console.log(`Deleted ${delParticipants.count} participants.`);

  const delCampaigns = await prisma.campaign.deleteMany();
  console.log(`Deleted ${delCampaigns.count} campaigns.`);

  console.log('✨ Database successfully reset to clean, fresh state!');
}

main()
  .catch((e) => {
    console.error('Error resetting database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
