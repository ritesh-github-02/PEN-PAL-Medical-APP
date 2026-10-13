import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DB INSPECTION START ---');
  
  const participantCount = await prisma.participant.count();
  console.log(`Total Participants: ${participantCount}`);

  const recentParticipants = await prisma.participant.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      responses: true,
      slideMetrics: true,
      sessions: true,
      tokens: true,
    }
  });

  for (const p of recentParticipants) {
    console.log(`\nParticipant: ${p.id} (status: ${p.status}, group: ${p.groupId}, createdAt: ${p.createdAt})`);
    console.log(`Tokens: ${p.tokens.map(t => t.id).join(', ')}`);
    console.log(`Responses count: ${p.responses.length}`);
    p.responses.forEach(r => {
      console.log(`  - [${r.questionId}]: ${r.answerValue} (time: ${r.timeSpentMs}ms, metadata: ${r.metadata || 'none'})`);
    });
    console.log(`Slide Metrics count: ${p.slideMetrics.length}`);
    p.slideMetrics.forEach(sm => {
      console.log(`  - [${sm.stepId}]: duration=${sm.durationMs}ms, visits=${sm.visitCount}`);
    });
  }

  const responseCount = await prisma.questionnaireResponse.count();
  console.log(`\nTotal Questionnaire Responses: ${responseCount}`);

  const metricCount = await prisma.slideMetric.count();
  console.log(`Total Slide Metrics: ${metricCount}`);

  console.log('--- DB INSPECTION END ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
