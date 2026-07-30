import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Explicitly connect to trigger the success message
  prisma.$connect()
    .then(() => {
      console.log('connect datanse succesfuly');
    })
    .catch((err) => {
      console.warn('Prisma connection attempt:', err.message);
    });

  return prisma;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

/**
 * Helper function to execute database operations with automatic retries.
 * Handles serverless database cold starts (Neon PostgreSQL) and connection pooler resets.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isConnError =
        error?.code === 'P1001' ||
        error?.name === 'PrismaClientInitializationError' ||
        error?.message?.includes("Can't reach database server") ||
        error?.message?.includes('Connection reset') ||
        error?.message?.includes('socket') ||
        error?.message?.includes('closed');

      if (isConnError && attempt < retries) {
        console.warn(
          `[Prisma DB Retry] Cold start/pooler retry attempt ${attempt}/${retries}. Retrying in ${delayMs}ms...`
        );
        try {
          await prisma.$connect();
        } catch (_) {}
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}
