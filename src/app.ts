import express from 'express';
import server from './services/apollo/apollo';
import users from './services/users';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.use((req, _res, next) => {
    req.prisma = prisma;
    next();
});

app.use('/users', users);


export {
    app,
    init
};

async function init() {
    await server.start();
    server.applyMiddleware({ app });
}
