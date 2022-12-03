# Contracts Example

## Getting Started

You have 2 ways to start developing:

Using [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#git@github.com:ignaciolarranaga/contracts-example.git) (recommended)

Or doing a local setup manually:

1. Install the software dependencies as detailed in .gitpodDockerfile (e.g. aws-cdk, aws-sam-cli, etc.)
2. Use `npm install` to download the lerna dependencies used in the following steps
3. Use `npm run bootstrap` to bootstrap the project (i.e. install all the dependencies)
4. Use `npm run build` to build it

Notes:
* This project uses [Lerna](https://lerna.js.org/) for the building of the monorepo.
* We do not rebuild the code on deploy to improve the performance of the development workflow, so remember to run `npm run build && npm run deploy`.
* We are explicitly not using the workspaces because we need the graphql-resolver-libraries to be in the node_modules subfolder for packaging.

## Useful commands

* `npm run lint` Check lint issues on the different packages
* `npm run prettier` Check prettier issues on the different packages

## Technical Stack

This project mainly uses:
* [AWS CDK](https://aws.amazon.com/es/cdk/) for infrastructure as code
* [AWS Appsync](https://aws.amazon.com/es/appsync/) for the GraphQL implementation
* [AWS Lambda](https://aws.amazon.com/es/lambda/) for the backend logic
* [DynamoDB](https://aws.amazon.com/es/dynamodb/) for persistence
* [Typescript](https://www.typescriptlang.org/) as default implementation language
* [ESLint](https://typescript-eslint.io/) for code validation
* [Prettier](https://prettier.io/) for code formatting

## Entities

This project uses [DynamoDB](https://aws.amazon.com/es/dynamodb/) for persistence and particularly the [single-table design pattern](https://aws.amazon.com/es/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/).

| Entity            | PK                          | SK                                     | PK1                    | SK1                         |
|-------------------|-----------------------------|----------------------------------------|------------------------|-----------------------------|
| Profile           | Profile#[PROFILE]           | Profile#[PROFILE]                      |                        |                             |

## HOW-TOs

### Execute Lambdas Locally
To execute a lambda locally you can run: `sam local invoke LAMBDA_ID -e SAMPLE_EVENT -t stack.yml`.

**IMPORTANT**:
* If you make changes to the code you need to run `npm run build && npm run synth` first, example: `npm run build && npm run synth && sam local invoke GraphQLResolversCC7FA53B -e packages/graphql-resolvers/sample-events/getCompany.json -t stack.yml`

References:
* See (Run a Lambda function on local environment with AWS CDK and SAM)[https://cloudash.dev/blog/run-cdk-lambda-function-on-local-environment]
* (sam local invoke)[https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html] command.

### Regenerate the GraphQL Schema

The schema is generated from different independent schema files split by type (i.e. user.graphql, location.graphql, etc.).
To generate the combined schema file we use (graphql-schema-utilities)[https://github.com/awslabs/graphql-schema-utilities] and
specifically a script named regenerate-graphql so execute `npm run regenerate-graphql-schema` in order to regenerate
(schema.graphql)[src/app-sync/schema.graphql]

Note: We do not do it automatically at the stack deploy in order to not slowdown every single deploy and/or to avoid un-intended
changes to be produced automatically since the schema doesn't change so frequently.

### Regenerate the GraphQL Schema Types

This project generates Typescript types for the GraphQL API operations. In order to regenerate those types you must execute `npm run regenerate-graphql-schema-types`
