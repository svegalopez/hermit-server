import request from 'supertest';
import app from '../app';
import data from '../prisma/seed/data';
import { User } from '@prisma/client';

describe("Users", () => {
    it("should return all users", async () => {
        const res = await request(app).get("/users");
        const mapper = (user: User) => ({ email: user.email });
        expect(res.body.map(mapper)).toEqual(data);
    });
});
