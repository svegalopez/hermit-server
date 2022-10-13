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

        /*
            When logging in from https:
            In order for the browser to store this cookie the following settings are neeeded.
            However, when developing locally the "secure" option won't work.
            Heroku sets NODE_ENV to 'production', so as long as we are on heroku,
            we will set 'sameSite' to 'none' and 'secure' to 'true'
        */
        return res.cookie('Agent-Key', agentKey, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        }).json({ token, user });

    } else {
        return res.status(401).send({ error: 'Incorrect Password. Your account will be blocked after 2 more failed attempts.' });
    }
});

router.delete('/logout', async (req, res) => {
    async function handle() {
        const agentKey = req.cookies['Agent-Key'];
        if (!agentKey) return res.sendStatus(400);

        await req.prisma.userLogin.delete({
            where: {
                agentKey
            }
        });
        return res.sendStatus(200);
    }

    await handle().catch(err => {
        let status = (err.code && err.code === 'P2025') ? 404 : 500;
        res.status(status).send(err.message || err.code || err);
    });
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
                    email: true,
                    userRoles: true
                }
            }
        }
    });

    if (!login) return res.status(404).send({ error: 'Credentials not found' })
    const token = sign({ id: login.user.id }, secret).split('.');

    return res.json({
        user: {
            id: login.user.id,
            email: login.user.email,
            roles: login.user.userRoles.map(el => el.roleName)
        },
        tp1: token[2],
        tp2: token[1],
        tp3: token[0]
    });
});

router.get('/', authenticate, (req, res) => {
    return res.json(['user1', 'user2', 'user3']);
});

router.get('/current', authenticate, async (req, res) => {
    return res.json(req.user);
});

export default router;