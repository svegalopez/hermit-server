import express, { RequestHandler } from 'express';
import { compareSync } from '../../utils/passwordHash';
import { randomUUID } from 'crypto';
import { User } from '@prisma/client';
import { JwtPayload, verify, sign } from 'jsonwebtoken';
const secret = process.env.JWT_SECRET || '123456789';
const router = express.Router();

export const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(400).send({ error: 'Please provide your credentials' });

    verify(token, secret, async (err, decoded) => {
        if (err) return res.status(401).send({ error: "Unable to verify credentials" });

        const user = await req.prisma.user.findUnique({
            where: { id: (decoded as JwtPayload).id },
        })
        if (!user) return res.status(404).send({ error: "User not found" });

        req.user = user;
        next();
    });
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await req.prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).send({ error: "User not found" });

    if (compareSync(password, user.password)) {

        const token = sign({ id: user.id }, secret);
        const agentKey = randomUUID();
        await req.prisma.userLogin.create({
            data: {
                agentKey,
                userId: user.id
            }
        });

        delete (user as Partial<User>).password;
        return res.cookie('Agent-Key', agentKey, {
            httpOnly: true
        }).json({ token, user });

    } else {
        return res.status(401).send({ error: 'Incorrect Password. Your account will be blocked after 2 more failed attempts.' });
    }
});

router.delete('/logout', async (req, res) => {
    const agentKey = req.cookies['Agent-Key'];
    if (!agentKey) return res.sendStatus(400);

    const userLogin = await req.prisma.userLogin.delete({
        where: {
            agentKey
        }
    }).catch(_ => null);

    if (userLogin) return res.sendStatus(200);
    return res.sendStatus(404);
});

router.get('/well-known', async (req, res) => {
    const agentKey = req.cookies['Agent-Key'];
    if (!agentKey) return res.status(400).send({ error: 'Missing credentials' })

    const login = await req.prisma.userLogin.findUnique({
        where: { agentKey },
        select: {
            user: {
                select: {
                    id: true,
                    email: true
                }
            }
        }
    });

    if (!login) return res.status(404).send({ error: 'Credentials not found' })

    const token = sign({ id: login.user.id }, secret).split('.');

    return res.json({
        user: login.user,
        tp1: token[2],
        tp2: token[1],
        tp3: token[0]
    });
});

router.get('/', authenticate, (req, res) => {
    return res.json(['user1', 'user2', 'user3']);
});

export default router;