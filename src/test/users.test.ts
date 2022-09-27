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

    describe("POST /users/login", () => {

        it("should login a user", async () => {
            const { body } = await request(hermit.app)
                .post("/api/users/login")
                .send({
                    email: "svegalopez@gmail.com",
                    password: 'Rootroot1!'
                });
            expect(typeof body.token).toEqual("string");
        });
    })

    describe("GET /users/current", () => {

        it("should get the current user", async () => {
            const { body } = await request(hermit.app)
                .post("/api/users/login")
                .send({
                    email: "svegalopez@gmail.com",
                    password: 'Rootroot1!'
                });

            const res = await request(hermit.app)
                .get("/api/users/current")
                .set({ Authorization: body.token });
            expect(res.body.email).toEqual("svegalopez@gmail.com");
            expect(res.body.id).toEqual(1);
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
