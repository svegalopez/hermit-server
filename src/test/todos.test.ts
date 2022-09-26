import Hermit, { IHermit } from '../hermit';

describe("Todos", () => {

    let hermit: IHermit;
    beforeAll(async () => {
        hermit = await Hermit();
    });

    afterAll(() => {
        hermit.httpServer.close();
    })

    it('should pass', () => {

    });
});
