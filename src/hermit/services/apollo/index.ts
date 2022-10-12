import { ApolloServer, AuthenticationError } from "apollo-server-express";

import prisma from "../prisma";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import { Request, Response } from 'express';
import { JwtPayload, verify } from "jsonwebtoken";
import { PrismaClient, User, UserRoles } from "@prisma/client";

export type CtxUser = Partial<User> & { userRoles: UserRoles[] }

export interface IContext {
    req: Request,
    prisma: PrismaClient,
    user: CtxUser
}

const secret = process.env.JWT_SECRET || '123456789';

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: { req: Request }): Promise<IContext> => {

        const token = req.header('Authorization');
        if (!token) throw new AuthenticationError('Missing credentials');

        const user = await new Promise<CtxUser>((res, rej) => {

            verify(token, secret, async (err, decoded) => {
                if (err) return rej(new AuthenticationError('Invalid credentials'))

                const user = await prisma.user.findUnique({
                    select: {
                        id: true,
                        email: true,
                        userRoles: true
                    },
                    where: { id: (decoded as JwtPayload).id }
                });
                /* istanbul ignore next */
                if (!user) return rej(new AuthenticationError('User not found'))
                return res(user);
            });
        });

        return {
            req,
            prisma,
            user
        }
    }
});

export default apollo;