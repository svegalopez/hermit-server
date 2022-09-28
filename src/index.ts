import listen from './hermit';

// This program relies on the "DATABASE_URL" env variable 
async function main() {
    await listen(4000);
}

main();