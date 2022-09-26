import { execSync } from 'child_process';
import Hermit, { IHermit } from '../hermit';
import destroyDd from './teardown/destroyDd';
import request from 'supertest';

describe("Todos", () => {

    let hermit: IHermit;
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(async () => {
        hermit.httpServer.close();
        await destroyDd();
        execSync(`rm -rf ./temp-${process.pid}`)
    })

    it("should login", async () => {
        const { status } = await request(hermit.app).post("/api/users/login");
        expect(status).toEqual(200);
    });
});
