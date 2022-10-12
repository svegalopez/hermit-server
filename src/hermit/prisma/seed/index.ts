import { PrismaClient } from '@prisma/client';
import { users, roles } from './data';

async function main() {
    const prisma = new PrismaClient();


    await prisma.user.createMany({ data: users });
    await prisma.role.createMany({ data: roles });

    // Assign admin role to user
    const user = await prisma.user.findUnique({
        where: {
            email: 'admin1@test.com'
        }
    });
    if (!user) throw Error('User not found');
    await prisma.userRole.create({
        data: {
            userId: user.id,
            roleName: 'admin'
        }
    });

    await prisma.$disconnect();
}

main().then(() => {
    console.log('seed succeded!')
});