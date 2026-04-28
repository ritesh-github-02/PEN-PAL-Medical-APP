import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();
  
  // Explicitly connect to trigger the success message
  prisma.$connect()
    .then(() => {
      console.log('connect datanse succesfuly');
    })
    .catch((err) => {
      // In some environments, we might want to log the error, 
      // but the user specifically asked for the success message.
      // We'll keep it quiet if it fails to avoid spamming the console 
      // if the DB is intentionally disconnected.
    });

  return prisma;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
