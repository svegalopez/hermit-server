import { app, init } from './app';

async function main() {
    await init();
    await new Promise<void>(resolve => app.listen({ port: 4000 }, resolve));
    console.log('🦀 Hermit ready at "http://localhost:4000" 🐚');
}

main();
