import express, { Express } from 'express';
import server from './services/apollo/apollo';
import api from './services';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

// The library gets initialized when a consumer imports the function "Hermit".
// The server begins to listen after the function "Hermit" is called.
// Hermit relies on the "DATABASE_URL" env variable, which must be set on the process that consumes this library.

export interface IHermit {
    app: Express,
    httpServer: Server
}

async function Hermit(port?: number): Promise<IHermit> {

    const app = express();
    const httpServer = createServer(app);

    // Regsiter REST API
    app.use('/api', api);

    // Start Apollo Server
    await server.start();

    // Register the GQL Graph at '/graphql'
    server.applyMiddleware({ app });

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

export default Hermit;
