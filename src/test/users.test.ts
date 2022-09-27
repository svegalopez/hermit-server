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

    describe("GET /users", () => {
        it("should list users", async () => {
            const { body } = await request(hermit.app).get("/api/users");
            expect(body.map((el: User) => el.email)).toEqual(data.map(el => el.email));
        });
    });

    describe("POST /users", () => {
        it("should create a user", async () => {
            const data: Omit<User, "id"> = {
                email: "figaro@test.com",
                password: 'Password1!'
            };

            const { body } = await request(hermit.app)
                .post("/api/users")
                .send(data);

            expect(typeof body.id).toEqual("number");
            expect(body.email).toEqual(data.email);

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
