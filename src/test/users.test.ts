import request from 'supertest';
import data from '../prisma/seed/data';
import { User } from '@prisma/client';
import Hermit, { IHermit } from '../hermit';


describe("Users", () => {

    let hermit: IHermit;
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(() => {
        hermit.httpServer.close();
    })

    it('should pass', () => {

    });

    it("should return all users from rest api", async () => {
        const res = await request(hermit.app).get("/api/users");
        const mapper = (user: User) => ({ email: user.email });
        expect(res.body.map(mapper)).toEqual(data);
    });

    it('should return all users from gql api', async () => {
        const { body } = await request(hermit.app).post("/graphql").send({
            query: 'query{users{email}}'
        })
        expect(body.data.users).toEqual(data);
    });
});
