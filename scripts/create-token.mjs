import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createToken(tokenName) {
  try {
    // 1. Create a participant
    const participant = await prisma.participant.create({
      data: {
        groupId: 'INTERVENTION',
        status: 'ACTIVE',
      },
    });

    // 2. Create the token linked to that participant
    const token = await prisma.participantToken.create({
      data: {
        token: tokenName,
        participantId: participant.id,
        status: 'VALID',
      },
    });

    console.log('-----------------------------------');
    console.log('✅ Access Token Created Successfully!');
    console.log(`Token: ${token.token}`);
    console.log(`Participant ID: ${participant.id}`);
    console.log('-----------------------------------');
  } catch (error) {
    console.error('❌ Error creating token:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const tokenName = process.argv[2] || `TOKEN-${Math.floor(1000 + Math.random() * 9000)}`;
createToken(tokenName);
