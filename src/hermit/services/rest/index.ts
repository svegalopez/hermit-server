import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import prisma from '../prisma';
import users, { authenticate } from './users';

const router = express.Router();

router.use(cookieParser());
router.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        if (!origin) return callback(new Error('Invalid request'))
        if (origin.includes('localhost:3000')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}));
router.use(express.json());

router.use((req, _res, next) => {
    req.prisma = prisma;
    next();
});

router.use('/users', users);
// router.use('/order', authenticate, orders);

export default router;