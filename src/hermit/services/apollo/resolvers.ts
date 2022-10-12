import { AuthenticationError } from 'apollo-server-express';
import { hasRole } from './../../utils/hasRole';
import { IContext } from './index';
import { MutationCreateUserArgs, User } from './gql-types.d';
import { PrismaClient, UserRoles } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import e from 'express';
export const resolvers = {
    Query: {
        users: async (_parent: any, args: any, context: IContext): Promise<User[]> => {
            if (!hasRole(context.user, 'admin')) throw new AuthenticationError('Unauthorized');

            const users = await context.prisma.user.findMany({
                include: {
                    userRoles: true
                },
                orderBy: { id: 'asc' }
            });

            return users.map(el => {
                return {
                    email: el.email,
                    roles: el.userRoles.map(el => ({ name: el.roleName })),
                    id: el.id
                }
            });
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
        createUser: async (_: any, args: MutationCreateUserArgs, context: IContext): Promise<User> => {
            if (!hasRole(context.user, 'admin')) throw new AuthenticationError('Unauthorized');

            let user = await context.prisma.user.create({
                data: args.user
            });

            return {
                ...user,
                roles: []
            };
        }
    }
};