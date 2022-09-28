import { ApolloServer } from "apollo-server-express";

import prisma from "../prisma";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: (req: Express.Request, res: Express.Response) => {
        return {
            req,
            res,
            prisma
        }
    }
});

export default apollo;