import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// prisma singleton used by both REST and GQL APIs.
export default prisma;