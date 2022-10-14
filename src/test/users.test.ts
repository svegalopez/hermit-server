import { execSync } from 'child_process';
import request from 'supertest';
import { PrismaClient, User } from '@prisma/client';

import Hermit, { IHermit } from '../hermit';
import destroyDb from './teardown/destroyDb';
import { inspect } from 'util';

describe("Users Service /users", () => {

    let hermit: IHermit;
    let prisma = new PrismaClient();
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(async () => {
        hermit.httpServer.close();
        await destroyDb();
    });

    describe("POST /login", () => {

        it("should login a user", async () => {
            const res = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });
            const agentKey = res.headers['set-cookie'][0].split(';')[0];

            expect(agentKey.includes('Agent-Key=')).toBe(true)
            expect(res.ok).toBe(true);
            expect(typeof res.body.token).toBe("string");
            expect(res.body.user).toBeTruthy();
        });

        it("should return a 404 when user is not found by given email", async () => {
            const res = await request(hermit.app).post("/api/users/login").send({
                email: 'whatever@gmail.com',
                password: 'something'
            });
            expect(res.ok).toBe(false);
            expect(res.status).toBe(404);
        });

        it("should not login a user when password is wrong", async () => {
            const res = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'something'
            });
            expect(res.ok).toBe(false);
            expect(res.body.error).toBeTruthy();
        });
    });

    describe("DELETE /logout", () => {

        it("should be able to log out", async () => {
            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });

            const agentKey = res.headers['set-cookie'][0].split(';')[0];
            res = await request(hermit.app).delete("/api/users/logout").set('Cookie', agentKey);
            expect(res.status).toBe(200);

            res = await request(hermit.app).get('/api/users/well-known').set('Cookie', agentKey);
            expect(res.status).toBe(404);
        });

        it("should return 400 when no credentials are present in the headers", async () => {
            const res = await request(hermit.app).delete("/api/users/logout");
            expect(res.status).toBe(400);
        });

        it("should return 404 when userLogin cannot be deleted", async () => {
            const res = await request(hermit.app).delete("/api/users/logout").set('Cookie', 'Agent-Key=123456789');
            expect(res.status).toBe(404);
        });
    });

    describe("GET /well-known", () => {

        it('should get credentials', async () => {
            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });

            const agentKey = res.headers['set-cookie'][0].split(';')[0];
            res = await request(hermit.app).get('/api/users/well-known').set('Cookie', agentKey);

            expect(res.status).toBe(200);

            const token = `${res.body.tp3}.${res.body.tp2}.${res.body.tp1}`;

            res = await request(hermit.app).get('/api/users/').set('Authorization', token);
            expect(res.status).toBe(200);
        });

        it('should 400 when credentials are missing', async () => {
            const res = await request(hermit.app).get('/api/users/well-known');
            expect(res.status).toBe(400);
        })

        it('should 404 when session does not exist', async () => {
            const res = await request(hermit.app).get('/api/users/well-known').set('Cookie', 'Agent-Key=123456789');
            expect(res.status).toBe(404);
        })
    });

    describe("authenticate middleware", () => {
        it('should 400 when Authorization header is missing', async () => {
            const res = await request(hermit.app).get('/api/users');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Please provide your credentials' });
        })

        it('should 401 when unable to verify token', async () => {
            const res = await request(hermit.app).get('/api/users').set('Authorization', '123');
            expect(res.status).toBe(401);
            expect(res.body).toEqual({ error: 'Unable to verify credentials' });
        })

        it('should 404 when user is not found', async () => {

            // Get a token
            const { body } = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });
            expect(typeof body.token).toBe('string');

            // Delete the user
            await prisma.userLogin.deleteMany({
                where: {
                    userId: body.user.id
                }
            });
            await prisma.user.delete({
                where: {
                    email: 'sebastianvega.dev@gmail.com'
                }
            });

            // Make a request to a protected route
            const res = await request(hermit.app).get('/api/users').set('Authorization', body.token);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'User not found' });
        })
    });

    describe("GET /current", () => {

        let token = '';
        beforeAll(async () => {
            const { status, body } = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });
            expect(status).toBe(200);
            token = body.token;
        });

        it('should get the currently logged in user', async () => {
            let { status, body } = await request(hermit.app).get("/api/users/current").set('Authorization', token);
            expect(status).toBe(200);
            expect(body.email).toBe('admin1@test.com');
        });

        it('should 400 if credentials are not provided', async () => {
            let { status } = await request(hermit.app).get("/api/users/current");
            expect(status).toBe(400);
        });

        it('should 401 if credentials are invalid', async () => {
            let { status } = await request(hermit.app).get("/api/users/current").set('Authorization', '123456789');
            expect(status).toBe(401);
        });
    })

    describe("GQL Query.currentUser", () => {

        let token = '';
        beforeAll(async () => {
            const { status, body } = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });
            expect(status).toBe(200);
            token = body.token;
        });

        it('should get the current user', async () => {
            const { body, status } = await request(hermit.app).post("/graphql").set('Authorization', token).send({
                query: 'query{currentUser{email}}'
            });
            expect(status).toBe(200);
            expect(body.data.currentUser).toEqual({ email: 'admin1@test.com' });
        });

        it('should get the current user and its roles', async () => {
            const { body, status } = await request(hermit.app).post("/graphql").set('Authorization', token).send({
                query: 'query{currentUser{email, roles{name}}}'
            });

            expect(status).toBe(200);
            expect(body.data.currentUser.email).toEqual('admin1@test.com');
            expect(body.data.currentUser.roles).toEqual([{ name: 'admin' }]);
        });
    });

    describe("GQL context", () => {
        it('should 400 if credentials are missing', async () => {
            const { body, status } = await request(hermit.app).post("/graphql").send({
                query: 'query{currentUser{email}}'
            });

            expect(status).toBe(400);
            expect(body.errors[0].message).toBe('Context creation failed: Missing credentials')
        });

        it('should 400 if invalid credentials are provided', async () => {
            const { body, status } = await request(hermit.app).post("/graphql").set('Authorization', '123456').send({
                query: 'query{currentUser{email}}'
            });

            expect(status).toBe(400);
            expect(body.errors[0].message).toBe('Context creation failed: Invalid credentials')
        })
    })

    describe("GQL Mutation.createUser", () => {
        let token = '';
        let nonAdminToken = '';
        beforeAll(async () => {
            let { status, body } = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });
            expect(status).toBe(200);
            token = body.token;

            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'svegalopez@gmail.com',
                password: 'Rootroot1!'
            });
            expect(res.status).toBe(200);
            nonAdminToken = res.body.token;
        });

        it("should create a user", async () => {
            const user: Omit<User, "id"> = {
                email: 'susana_' + Date.now() + '@test.com',
                password: 'Password1!'
            };

            let query = `mutation CreateUser($user: UserInput!) {
                createUser(user: $user) {
                    email,
                    id
                }
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', token)
                .send({
                    query,
                    variables: { user },
                });

            expect(body.errors).toBe(undefined);
            expect(typeof body.data.createUser.id).toEqual("number");
            expect(body.data.createUser.email.includes('susana')).toEqual(true);
        });

        it('should error out creating a user as a non-admin', async () => {
            const user: Omit<User, "id"> = {
                email: 'susana_' + Date.now() + '@test.com',
                password: 'Password1!'
            };

            let query = `mutation CreateUser($user: UserInput!) {
                createUser(user: $user) {
                    email,
                    id
                }
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', nonAdminToken)
                .send({
                    query,
                    variables: { user },
                });

            expect(body.errors[0].message).toBe('Unauthorized');
        })
    });

    describe("GQL Mutation.changePassword", () => {
        let token = '';
        let token2 = ''
        beforeAll(async () => {
            console.log('🍄 Reset... 🍄');
            execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate reset --force --skip-generate --schema ./src/hermit/prisma/schema.prisma`)

            let { status, body } = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });
            expect(status).toBe(200);
            token = body.token;

            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });
            expect(res.status).toBe(200);
            token2 = res.body.token;
        });

        it("should change a user's password", async () => {
            let query = `mutation ChangePassword($current: String!, $new: String!, $confirmNew: String!) {
                changePassword(current: $current, new: $new, confirmNew: $confirmNew)
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', token)
                .send({
                    query,
                    variables: { current: 'Rootroot1!', new: 'Rootroot2!', confirmNew: 'Rootroot2!' },
                });

            expect(body.errors).toBe(undefined);

            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });

            // Expect old pw to be wrong
            expect(res.body).toEqual({
                error: 'Incorrect Password. Your account will be blocked after 2 more failed attempts.'
            });

            res = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot2!'
            });

            // Expect new pw to work
            expect(res.status).toBe(200);
            expect(res.body.user).toBeTruthy();
        });

        it("should error out when new passwords do not match", async () => {
            let query = `mutation ChangePassword($current: String!, $new: String!, $confirmNew: String!) {
                changePassword(current: $current, new: $new, confirmNew: $confirmNew)
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', token2)
                .send({
                    query,
                    variables: { current: 'Rootroot1!', new: 'Rootroot2!', confirmNew: '123456' },
                });

            expect(body.errors[0].message).toBe("Passwords do not match");
        });

        it("should error out when current password is wrong", async () => {
            let query = `mutation ChangePassword($current: String!, $new: String!, $confirmNew: String!) {
                changePassword(current: $current, new: $new, confirmNew: $confirmNew)
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', token2)
                .send({
                    query,
                    variables: { current: '123456', new: 'Rootroot2!', confirmNew: 'Rootroot2!' },
                });

            expect(body.errors[0].message).toBe("Wrong password");
        });
    });

    describe("GQL Query.users", () => {
        let token = '';
        let nonAdminToken = '';

        beforeAll(async () => {
            console.log('🍄 Reset... 🍄');
            execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate reset --force --skip-generate --schema ./src/hermit/prisma/schema.prisma`)

            let { status, body } = await request(hermit.app).post("/api/users/login").send({
                email: 'admin1@test.com',
                password: 'Rootroot1!'
            });
            expect(status).toBe(200);
            token = body.token;

            let res = await request(hermit.app).post("/api/users/login").send({
                email: 'svegalopez@gmail.com',
                password: 'Rootroot1!'
            });
            expect(res.status).toBe(200);
            nonAdminToken = res.body.token;
        });

        it("should list users", async () => {

            let query = `query {
                users {
                    email,
                    id,
                    roles {
                        name
                    }
                }
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', token)
                .send({
                    query
                });

            expect(body.errors).toBe(undefined);
            expect(body.data.users).toEqual([
                { email: 'svegalopez@gmail.com', id: 1, roles: [] },
                { email: 'sebastianvega.dev@gmail.com', id: 2, roles: [] },
                { email: 'admin1@test.com', id: 3, roles: [{ name: 'admin' }] }
            ]);
        });

        it('should error out listing users as a non-admin', async () => {
            let query = `query {
                users {
                    email,
                    id,
                    roles {
                        name
                    }
                }
            }`;
            const { body } = await request(hermit.app)
                .post("/graphql")
                .set('Authorization', nonAdminToken)
                .send({
                    query
                });

            expect(body.errors[0].message).toBe('Unauthorized');
        })
    });
});
