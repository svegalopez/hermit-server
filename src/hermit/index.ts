// External deps
import { AddressInfo } from 'net';
import express, { Express } from 'express';
import { createServer, Server } from 'http';

// Internal deps
import restApi from './services/rest';
import apollo from './services/apollo';

/**
 * Listens for http requests on port.
 * If no port is provided, it listens on the first available port.
 * Returns an object of type IHermit, which allows: 
 * 
 * 1. The server to be tested using supertest. eg: request(hermit.app).get('/users')
 * 2. The underlying http server to be closed. eg: hermit.httpServer.close(). This can
 *  be useful for the consumer when trying to implement graceful termination of a Hermit
 *  server.
 * 
 */
export default async (port?: number | string): Promise<IHermit> => {

    const app = express();
    const httpServer = createServer(app);

    // Regsiter REST API
    app.use('/api', restApi);

    // Start Apollo Server
    await apollo.start();

    // Register the GQL Graph at '/graphql'
    apollo.applyMiddleware({ app });

    // Listen
    await new Promise<void>((res) => httpServer.listen({ port: port || 0 }, res));
    const address = httpServer.address() as AddressInfo;

    console.log(`
        🦀 Hermit ready at "http://localhost:${address.port}" 
        🐚 DB URL: ${process.env.DATABASE_URL}
    `);

    return {
        app,
        httpServer
    };
}

export interface IHermit {
    app: Express,
    httpServer: Server
}