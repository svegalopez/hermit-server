import request from 'supertest';
import data from '../prisma/seed/data';
import { User } from '@prisma/client';
import { app, init } from '../app';

describe("Users", () => {

    beforeAll(async () => {
        await init();
    });

    it("should return all users from rest api", async () => {
        const res = await request(app).get("/api/users");
        const mapper = (user: User) => ({ email: user.email });
        expect(res.body.map(mapper)).toEqual(data);
    });

    it('should return all users from gql api', async () => {
        const { body } = await request(app).post("/graphql").send({
            query: 'query{users{email}}'
        })
        expect(body.data.users).toEqual(data);
    });
});
