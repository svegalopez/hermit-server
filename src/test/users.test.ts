import request from 'supertest';
import data from '../prisma/seed/data';
import { User } from '@prisma/client';
import { app, init } from '../app';

describe("Users", () => {

    beforeAll(async () => {
        await init();
    });

    it("should return all users", async () => {
        const res = await request(app).get("/users");
        const mapper = (user: User) => ({ email: user.email });
        expect(res.body.map(mapper)).toEqual(data);
    });
});
