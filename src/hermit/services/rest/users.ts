import express, { RequestHandler } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { randomUUID } from 'crypto';
const jwt = require('jsonwebtoken');

const secret = '123456789'; // Dummy secret, use env variable
const router = express.Router();

export const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.header('Authorization');
    const agentKey = req.cookies['Agent-Key'];

    if (!token) return res.status(400).send({ error: 'No token' });
    if (!agentKey) return res.status(400).send({ error: 'No key' });

    jwt.verify(token, secret, async (err: Error, decoded: { id: number }) => {
        if (err) return res.status(401).send({ error: "No bueno compadre!" });

        const user = await req.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                email: true,
                id: true,
                logins: {
                    where: {
                        userId: decoded.id,
                        agentKey
                    }
                }
            }
        })
        if (!user) return res.status(404).send({ error: "No bueno compadre!" });
        if (!user.logins[0]) return res.status(404).send({ error: "No logins found" });

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
    if (!user) return res.status(400);

    if (compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id }, secret);

        const agentKey = randomUUID();
        await req.prisma.userLogin.create({
            data: {
                agentKey,
                userId: user.id
            }
        })
        return res.cookie('Agent-Key', agentKey, {
            httpOnly: true
        }).json({ token });
    } else {
        return res.sendStatus(401);
    }
});

router.delete('/logout', authenticate, async (req, res) => {
    await req.prisma.userLogin.delete({
        where: {
            userId_agentKey: {
                userId: req.user!.id,
                agentKey: req.cookies['Agent-Key']
            }
        }
    })
    res.sendStatus(200);
});

router.get('/current', authenticate, async (req, res) => {
    console.log(req.header('Cookie'));
    return res.json(req.user);
});

export default router;