import listen from './hermit';

// This program relies on the "DATABASE_URL" env variable 
async function main() {
    await listen(process.env.PORT || 4000);
}

main();