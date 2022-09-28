import { PrismaClient } from '@prisma/client';
export const resolvers = {
    Query: {
        users: (_parent: any, args: any, context: any) => {
            return context.prisma.user.findMany({ orderBy: { id: 'asc' } });
        },
    },
    Mutation: {
        createUser: async (_parent: any, args: any, context: { prisma: PrismaClient }) => {

            console.log('im here');

            const user = await context.prisma.user.create({
                data: args.user,
            });

            console.log('I am here!!!');
            console.log(user);

            return user;
        }
    }
};