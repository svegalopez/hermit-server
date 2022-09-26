import { PrismaClient } from '@prisma/client';
import express from 'express';
import users from './services/users';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use((req, _res, next) => {
    req.prisma = prisma;
    next();
});

app.use('/users', users);

export default app;