import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
    const users = await req.prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json(users);
})

router.post('/login', async (req, res) => {
    // obtain user from db
    // check passwords
    // sign a token and send to user
})

export default router;