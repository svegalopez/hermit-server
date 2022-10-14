import { ApolloError, AuthenticationError } from 'apollo-server-express';
import { hasRole } from './../../utils/hasRole';
import { IContext } from './index';
import { MutationCreateUserArgs, User, MutationChangePasswordArgs } from './gql-types.d';
import { UserRole } from '@prisma/client';
import { compareSync, getHash } from '../../utils/passwordHash';

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
            user.roles = user.userRoles.map((el: UserRole) => {
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
        },
        changePassword: async (_: any, args: MutationChangePasswordArgs, context: IContext): Promise<String> => {
            if (args.new !== args.confirmNew) throw new ApolloError('Passwords do not match');

            const user = await context.prisma.user.findUnique({
                where: {
                    id: context.user.id
                },
                select: {
                    password: true
                }
            });

            /* istanbul ignore if */
            if (!user) throw new ApolloError('User not found');
            if (!compareSync(args.current, user.password)) throw new ApolloError('Wrong password');

            await context.prisma.user.update({
                where: { id: context.user.id },
                data: { password: getHash(args.new) }
            });

            return "OK";
        }
    }
};