import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
    const users = await req.prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json(users);
})

export default router;