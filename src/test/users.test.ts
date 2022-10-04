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

    describe("POST /api/users/login", () => {

        it("should login a user", async () => {
            const res = await request(hermit.app).post("/api/users/login").send({
                email: 'sebastianvega.dev@gmail.com',
                password: 'Rootroot1!'
            });
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

    describe("DELETE /api/users/logout", () => {
        it("should be ablo to log out", () => { });
        it("should return 400 when no credentials are present in the headers", () => { });

        it("should return 404 when userLogin cannot be deleted", () => {

        });
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
