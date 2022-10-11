import { PrismaClient } from '@prisma/client';
export const resolvers = {
    Query: {
        users: (_parent: any, args: any, context: any) => {
            return context.prisma.user.findMany({ orderBy: { id: 'asc' } });
        },
        currentUser: (_parent: any, _args: any, context: any) => {
            console.log(_parent);
            console.log(context);
            return {
                email: 'something',
                id: 99
            }
        }
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