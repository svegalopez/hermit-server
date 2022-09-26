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


            console.log(body)
            expect(typeof body.data.createUser.id).toEqual("number");
        });
    })

    // describe("REST", () => {
    //     it("should return all users", async () => {
    //         const { body } = await request(hermit.app).get("/api/users");
    //         const mapper = (user: User) => ({ email: user.email });
    //         expect(body.map(mapper)).toEqual(data);
    //     });
    // })
});
