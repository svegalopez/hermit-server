import express, { RequestHandler } from 'express';
const router = express.Router();
import { compareSync, hashSync } from 'bcrypt';
const jwt = require('jsonwebtoken');
const secret = '123456789'; // Dummy secret, use env variable

export const authenticate: RequestHandler = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(400).send('No comprende español');

    jwt.verify(token, secret, (err: Error, decoded: { id: number }) => {
        if (err) return res.status(401).send("No bueno compadre!");
        req.prisma.user.findUnique({ where: { id: decoded.id } })
            .then((user) => {
                if (!user) return res.status(404).send("No bueno compadre!");
                req.user = user;
                next();
            });
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

    console.log(req.headers);

    const { email, password } = req.body;
    const user = await req.prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400);

    if (compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id }, secret);
        return res.cookie('Agent-Key', '999').json({ token });
    } else {
        return res.sendStatus(401);
    }
});

router.get('/current', authenticate, async (req, res) => {
    return res.json(req.user);
});

export default router;