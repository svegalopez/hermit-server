import { execSync } from 'child_process';
import Hermit, { IHermit } from '../hermit';
import destroyDd from './teardown/destroyDd';

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

    it('should pass', () => {

    });
});
