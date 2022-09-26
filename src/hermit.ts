import express, { Express as IExpress } from 'express';
import server from './services/apollo/apollo';
import api from './services';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';


export interface IHermit {
    app: IExpress,
    httpServer: Server
}

async function Hermit(): Promise<IHermit> {

    const app = express();
    const httpServer = createServer(app);

    // Regsiter REST API
    app.use('/api', api);

    // Start Apollo Server
    await server.start();

    // Register the GQL Graph at '/graphql'
    server.applyMiddleware({ app });

    // Listen
    await new Promise<void>((res) => httpServer.listen({ port: 0 }, res));
    const address = httpServer.address() as AddressInfo;
    console.log(`🦀 Hermit ready at "http://localhost:${address.port}" 🐚`);

    return {
        app,
        httpServer
    };
}

export default Hermit;
