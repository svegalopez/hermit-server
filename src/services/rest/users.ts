import express from 'express';
const router = express.Router();
import { hashSync } from 'bcrypt';

router.get('/', async (req, res) => {
    const users = await req.prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json(users);
})

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

// POST /login
// GET /current-user

// libs I will need
// jsonwebtoken for signing and verifying tokens
// bcryptjs for hashing passwords before storage and checking for matches during login

// keys needed: secret for signing/veryfing tokens

export default router;