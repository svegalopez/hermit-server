/* istanbul ignore file */
import { execSync } from "child_process";
import { writeFileSync } from "fs";

module.exports = async function () {

    execSync(`mkdir temp-${process.pid}`);

    // Copy prisma directory from ./src/prisma into ./temp-<pid>
    execSync(`cp -R ./src/prisma ./temp-${process.pid}`);
    execSync(`rm ./temp-${process.pid}/prisma/.env`);

    // Generate a .env file
    writeFileSync(`./temp-${process.pid}/prisma/.env`, `DATABASE_URL="mysql://root:rootroot@localhost:3306/test_${process.pid}"`)

    // Set env variable
    process.env.DATABASE_URL = `mysql://root:rootroot@localhost:3306/${"test_" + process.pid}`

    // Create the db and apply migrations
    execSync(`npx prisma migrate deploy --schema ./temp-${process.pid}/prisma/schema.prisma`).toString();

    // Seed test fixtures
    execSync(`npx prisma db seed --schema ./temp-${process.pid}/prisma/schema.prisma`).toString();

    await new Promise((res) => {
        setTimeout(res, 0);
    })
}