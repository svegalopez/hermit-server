import express, { RequestHandler } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '@prisma/client';
import { JwtPayload, verify, sign } from 'jsonwebtoken';

const secret = '123456789'; // Dummy secret, use env variable
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

router.get('/', async (req, res) => {
    const users = await req.prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json(users);
});

router.post('/', async (req, res) => {
    res.json(await req.prisma.user.create({ data: req.body }));
});

router.post('/register', async (req, res) => {
    let { email, password } = req.body;
    // create a user
    const user = await req.prisma.user.create({
        data: {
            email,
            password: hashSync(password, 10)
        }
    });
    return res.json({
        email: user.email,
        id: user.id
    });
});

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
    if (!agentKey) return res.sendStatus(404);

    const userLogin = await req.prisma.userLogin.delete({
        where: {
            agentKey
        }
    }).catch((err: Error) => console.error(err))

    if (userLogin) return res.sendStatus(200);
    return res.sendStatus(404);
});

router.get('/current', async (req, res) => {
    const agentKey = req.cookies['Agent-Key'];
    if (!agentKey) return res.status(400).send({ err: 'Missing credentials' })

    const login = await req.prisma.userLogin.findFirst({
        where: { agentKey },
        select: {
            user: {
                select: {
                    id: true,
                    email: true
                }
            }
        }
    })

    if (!login) return res.status(401).send({ err: 'Invalid credentials' })
    const token = sign({ id: login.user.id }, secret);

    return res.json({ user: login.user, token });
});

export default router;