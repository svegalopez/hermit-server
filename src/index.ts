import Hermit from './hermit';

// This program relies on the env variable "DATABASE_URL" being set
async function main() {
    await Hermit(4000);
    // Server listening in port 4000...
}

main();