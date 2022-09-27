import request from 'supertest';
import data from '../prisma/seed/data';
import { PrismaClient, User } from '@prisma/client';
import Hermit, { IHermit } from '../hermit';
import destroyDd from './teardown/destroyDd';

describe("Users", () => {

    let hermit: IHermit;
    let prisma = new PrismaClient();
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(async () => {
        hermit.httpServer.close();
        await destroyDd();
    });

    describe("REST", () => {
        it("should return all users", async () => {
            const { body } = await request(hermit.app).get("/api/users");
            const mapper = (user: User) => ({ email: user.email });
            expect(body.map(mapper)).toEqual(data);
        });

        it("should create a user", async () => {
            const { body } = await request(hermit.app)
                .post("/api/users")
                .send({ email: "figaro@test.com" });

            expect(body.email).toEqual("figaro@test.com");

            const u = await prisma.user.findUnique({ where: { email: "figaro@test.com" } });
            expect(u).toEqual(body);
        });
    })

    // describe("GQL", () => {
    //     // it('should return all users', async () => {
    //     //     const { body } = await request(hermit.app).post("/graphql").send({
    //     //         query: 'query{users{email}}'
    //     //     })
    //     //     expect(body.data.users).toEqual(data);
    //     // });

    //     it("should create a a female user", async () => {

    //         console.log(process.pid, 'creating susana');

    //         let query = `mutation CreateUser($user: UserInput!) {
    //             createUser(user: $user) {
    //                 email,
    //                 id
    //             }
    //         }`;

    //         const { body } = await request(hermit.app)
    //             .post("/graphql")
    //             .send({
    //                 query,
    //                 variables: {
    //                     user: {
    //                         email: 'susana_' + Date.now() + '@test.com'
    //                     }
    //                 },
    //             });
    //         expect(typeof body.data.createUser.id).toEqual("number");
    //     });
    // });
});
