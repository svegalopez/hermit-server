import request from 'supertest';
import data from '../prisma/seed/data'; // get rid of this seeds are not for tests
import { User } from '@prisma/client';
import Hermit, { IHermit } from '../hermit';
import destroyDd from './teardown/destroyDd';
import { execSync } from 'child_process';


describe("Users", () => {

    let hermit: IHermit;
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(async () => {
        hermit.httpServer.close();
        await destroyDd();
        execSync(`rm -rf ./temp-${process.pid}`)
    })

    describe("REST", () => {
        it("should return all users", async () => {
            const { body } = await request(hermit.app).get("/api/users");
            const mapper = (user: User) => ({ email: user.email });
            expect(body.map(mapper)).toEqual(data);
        });

        // it("should login", async () => {
        //     const { status } = await request(hermit.app).post("/api/users/login");
        //     expect(status).toEqual(200);
        // });
    })

    describe("GQL", () => {
        it('should return all users', async () => {
            const { body } = await request(hermit.app).post("/graphql").send({
                query: 'query{users{email}}'
            })
            expect(body.data.users).toEqual(data);
        });

        it("should create a user", async () => {
            let query = `mutation CreateUser($user: UserInput!) {
                createUser(user: $user) {
                    email,
                    id
                }
            }`;

            const { body } = await request(hermit.app)
                .post("/graphql")
                .send({
                    query,
                    variables: {
                        user: {
                            email: Date.now() + '@test.com'
                        }
                    },
                });
            expect(typeof body.data.createUser.id).toEqual("number");
        });
    });
});
