/* istanbul ignore file */
import { execSync } from "child_process";


// Jest calls this function once for every test file.
// Jest calls this function first, then runs the test file after the function returns.
// You can also return a promise and Jest will await it before calling the test file.
module.exports = function () {

    // Create a randomly named test database
    const dbName = `test_${process.pid}_${Math.floor(Math.random() * 1000)}`;

    // Set env variable to be used by the test run that will run right after this function returns.
    process.env.DATABASE_URL = `mysql://root:rootroot@localhost:3306/${dbName}`;

    // This is only used for deleting the test db at the end of the test run
    process.env.DATABASE_NAME = dbName;

    // Create the db and apply migrations
    execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma migrate deploy --schema ./src/hermit/prisma/schema.prisma`);

    // Seed application data
    execSync(`npx dotenv -v DATABASE_URL=${process.env.DATABASE_URL} -- npx prisma db seed`);
}