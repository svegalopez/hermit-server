import * as dotenv from 'dotenv';
dotenv.config({ path: './src/prisma/.env' });
import Hermit from './hermit';

async function main() {
    await Hermit();
}

main();
