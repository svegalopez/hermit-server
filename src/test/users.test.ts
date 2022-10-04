import { execSync } from 'child_process';
import request from 'supertest';
import { PrismaClient, User } from '@prisma/client';

import data from '../hermit/prisma/seed/data';
import Hermit, { IHermit } from '../hermit';
import destroyDb from './teardown/destroyDb';

describe("Users Service", () => {

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
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });

            const agentKey = res.headers['set-cookie'][0].split(';')[0];
            res = await request(hermit.app).get('/api/users/well-known').set('Cookie', agentKey);

            expect(res.status).toBe(200);

            const user = res.body.user;
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

    // describe("POST /users", () => {
    //     beforeAll(() => {
    //         console.log('🍄 Reset... 🍄');
    //         execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate reset --force --skip-generate --schema ./src/hermit/prisma/schema.prisma`)
    //     });

    //     it("should create a user", async () => {
    //         const data: Omit<User, "id"> = {
    //             email: "figaro@test.com",
    //             password: 'Password1!'
    //         };

    //         const { body } = await request(hermit.app)
    //             .post("/api/users")
    //             .send(data);

    //         expect(typeof body.id).toEqual("number");
    //         expect(body.email).toEqual(data.email);

    //         const u = await prisma.user.findUnique({ where: { email: "figaro@test.com" } });
    //         expect(u).toEqual(body);
    //     });
    // });

    // describe("POST /users/login", () => {
    //     beforeAll(() => {
    //         console.log('🍄 Reset... 🍄');
    //         execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate reset --force --skip-generate --schema ./src/hermit/prisma/schema.prisma`)
    //     });

    //     it("should login a user", async () => {
    //         const { body } = await request(hermit.app)
    //             .post("/api/users/login")
    //             .send({
    //                 email: "svegalopez@gmail.com",
    //                 password: 'Rootroot1!'
    //             });
    //         expect(typeof body.token).toEqual("string");
    //     });
    // });

    // describe("GET /users/current", () => {
    //     beforeAll(() => {
    //         console.log('🍄 Reset... 🍄');
    //         execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate reset --force --skip-generate --schema ./src/hermit/prisma/schema.prisma`)
    //     });

    //     it("should get the current user", async () => {
    //         const { body } = await request(hermit.app)
    //             .post("/api/users/login")
    //             .send({
    //                 email: "svegalopez@gmail.com",
    //                 password: 'Rootroot1!'
    //             });

    //         const res = await request(hermit.app)
    //             .get("/api/users/current")
    //             .set({ Authorization: body.token });
    //         expect(res.body.email).toEqual("svegalopez@gmail.com");
    //         expect(res.body.id).toEqual(1);
    //     });
    // });

});
