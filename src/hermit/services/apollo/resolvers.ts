import { PrismaClient } from '@prisma/client';
export const resolvers = {
    Query: {
        users: (_parent: any, args: any, context: any) => {
            return context.prisma.user.findMany({ orderBy: { id: 'asc' } });
        },
    },
    Mutation: {
        createUser: async (_parent: any, args: any, context: { prisma: PrismaClient }) => {
            const user = await context.prisma.user.create({
                data: args.user,
            });
            return user;
        }
    }
};