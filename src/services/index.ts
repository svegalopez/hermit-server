import express from 'express';
import prisma from './prisma';
import users, { authenticate } from './rest/users';
const router = express.Router();

router.use(express.json());

router.use((req, _res, next) => {
    req.prisma = prisma;
    next();
});

router.use('/users', users);
// router.use('/order', authenticate, orders);

export default router;