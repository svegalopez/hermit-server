import { execSync } from 'child_process';

let dbUrl = process.argv[2] ? process.argv[2].split('DATABASE_URL=')[1] : null;

if (!dbUrl) {
    console.log('Please specify a DB url. Eg: "npm run seed -- DATABASE_URL=<your-db-url>"')
    process.exit(1)
}

console.log(execSync(`npx dotenv -v DATABASE_URL=${dbUrl} -- npx prisma db seed`).toString());