<p align="center">
    <img height="180" src="./images/hermit.png">
</p>

<h1 align="center">Hermit Server</h1>

<br>
<br>
<p align="center">
    <img width="30" src="./images/ts.svg">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <img height="30" src="./images/prisma2.svg">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <img width="30" src="./images/gql.svg">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <img width="30" src="./images/jest.svg">
</p>
<br>
<br>
<hr>

Hermit server is a stack that integrates various developer friendly technologies to create the ultimate dev experience.

## Prisma

The schema located at `src/hermit/prisma/schema.prisma` will auto generate database migrations, a type-safe client, and typescript type definitions for you.

## Apollo Server

Using apollo-express, Hermit exposes a graph at the path `/graphql`. Thanks to prisma and graphql-codegen, the resolvers located at `src/hermit/services/apollo/resolvers.ts` are fully typed.

## Testing

When you run `npm test`, hermit uses ts-jest in order to run tests. A new environment is created behind the scenes for every spec file, so that each spec is ran in complete isolation. Jest calculates the code coverage and makes it available under `test/coverage`.

## Ci-Cd

Using Github Actions and Heroku pipelines, the workflow is the following:

- Commit to your feature branch
- Open a PR from feature branch into main
- Automated tests will run in Github, and coverage 100% is enforced : )
- Once a PR is merged to main, the code will auto deploy to [a staging environment](https://server-staging.hermit.cloud/)
- Using the Heroku pipelines dashboard you can promote to production with a single click

## Debug

To debug using vscode, simply place a breakpoint and then open `package.json`. Locate the script you would like to debug, click on Debug, and choose the appropriate script in the dropdown. You can debug both "start" and "test" programs.
