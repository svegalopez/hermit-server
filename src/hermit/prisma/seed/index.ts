import { PrismaClient } from '@prisma/client';
import data from './data';

async function main() {
    const prisma = new PrismaClient();
    await prisma.user.createMany({ data });
    await prisma.$disconnect();
}

main().then(() => {
    console.log('seed succeded!')
});