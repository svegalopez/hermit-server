import { PrismaClient, UserRoles } from '@prisma/client';
export const resolvers = {
    Query: {
        users: (_parent: any, args: any, context: any) => {
            return context.prisma.user.findMany({ orderBy: { id: 'asc' } });
        },
        currentUser: (_parent: any, _args: any, context: any) => {
            const user = {
                ...context.user
            }
            user.roles = user.userRoles.map((el: UserRoles) => {
                return {
                    name: el.roleName
                }
            })
            delete user.userRoles;
            return user;
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