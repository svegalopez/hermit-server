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
    console.log('this does not run');
    res.sendStatus(200);
})

export default router;