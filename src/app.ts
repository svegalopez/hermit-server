import express from 'express';
import server from './services/apollo/apollo';
import api from './services';

const app = express();
app.use('/api', api);

async function init() {
    await server.start();
    server.applyMiddleware({ app });
}

export {
    app,
    init
};

