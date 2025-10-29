import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prismaInstance = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
export default prismaInstance;


