# Contracts Example

This is an example around 3 main entities and some business rules.

### Entities
* Profile:
  * A profile can be either a `client` or a `contractor`.
  * clients create contracts with contractors. contractor does jobs for clients and get paid.
  * Each profile has a balance property.

* Contract:
  * A contract between and client and a contractor.
  * Contracts have 3 statuses: `new`, `in_progress`, `terminated`.
  * contracts are considered active only when in status `in_progress`
  * Contracts group jobs within them.

* Job
  * contractor get paid for jobs by clients under a certain contract.

### Business Rules
* **getContract(id: ID!)**: Returns the contract only if it belongs to the profile calling (either client or contractor). See the integration tests at [getContract.test.ts](packages/graphql-resolvers/src/resolvers/getContract.test.ts).
* **makeProfileDeposit(input: {amount: Float})**: Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay (at the deposit moment). See the integration tests at [makeProfileDeposit.test.ts](packages/graphql-resolvers/src/resolvers/makeProfileDeposit.test.ts).
* **payJob(id: ID!)**: Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance. See the integration tests at [payJob.test.ts](packages/graphql-resolvers/src/resolvers/payJob.test.ts).
* **listJobs(filter: { paid: Boolean }, limit: Int, nextToken: String)**: Get all paid/unpaid jobs for a user.
* **listContracts(filter: { unterminated: Boolean }, limit: Int, nextToken: String)**: Get all or terminated/unterminated contracts for a user.

You can find sample GraphQL operations around this model in [GRAPHQL-QUERIES.md](GRAPHQL-QUERIES.md).

## Getting Started

You have 2 ways to start developing:

1. Using Gitpod, or doing a local setup manually as described in the how-tos.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#git@github.com:ignaciolarranaga/contracts-example.git)

2. Once you are there you will need to define an AWS account to deploy your stack, i.e.:
```
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_DEFAULT_REGION=us-west-2
```

3. If it is the first time you use AWS CDK you will need to [bootstrap it](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_bootstrap) (i.e. `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`).

4. Now you have to deploy the stack: `npm run deploy`

Notes:
* This project uses [Lerna](https://lerna.js.org/) for the building of the monorepo.
* We do not rebuild the code on deploy to improve the performance of the development workflow, so remember to run `npm run build && npm run deploy`.
* We are explicitly not using the workspaces because we need the graphql-resolver-libraries to be in the node_modules subfolder for packaging.
* There are useful GraphQL queries on [GRAPHQL-QUERIES.md](GRAPHQL-QUERIES.md)

## Testing

This project uses both unit tests (*.spec.ts) and integration tests (*.test.ts).
* Use `npm test` to run the unit test all across the packages
* Use `npm run it` to run the integration tests all across the packages (you need to execute `npm run deploy` first)

## Useful commands

* `npm run lint` Check lint issues on the different packages
* `npm run prettier` Check prettier issues on the different packages
* `npm run regenerate-graphql-schema` Regenerates the GraphQL schema from the individual schema files
* `npm run regenerate-graphql-schema-types` Regenerates the GraphQL schema types in [graphql-model](packages/graphql-model/)

## Technical Stack

This project mainly uses:
* [AWS CDK](https://aws.amazon.com/es/cdk/) for infrastructure as code
* [AWS Cognito](https://aws.amazon.com/es/cognito/) for authentication and authorization
* [AWS Appsync](https://aws.amazon.com/es/appsync/) for the GraphQL implementation
* [AWS Lambda](https://aws.amazon.com/es/lambda/) for the backend logic
* [DynamoDB](https://aws.amazon.com/es/dynamodb/) for persistence
* [Typescript](https://www.typescriptlang.org/) as default implementation language
* [ESLint](https://typescript-eslint.io/) for code validation
* [Prettier](https://prettier.io/) for code formatting

Some Q&A:
* Q: Why we choose DynamoDB over for example a traditional relational database?
  * A: Because the queries that support the implementation will scale up-to levels that any relational database can reach
* Q: Why we choose Lambda instead of a express-server?
  * A: Because the implementation will self-scale rather than us having to setup and manage a cluster
* Q: Why we choose GraphQL instead of REST?
  * A: Because facilitates the implementation of the clients by leaving them to define how to use the API as well as the type system expressiveness value add

## Entities

This project uses [DynamoDB](https://aws.amazon.com/es/dynamodb/) for persistence and particularly the [single-table design pattern](https://aws.amazon.com/es/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/).

| Entity   | PK                 | SK                 | PK1                   | SK1             | PK2               | SK2             | PK3     | SK3    |
|----------|--------------------|--------------------|-----------------------|-----------------|-------------------|-----------------|---------|--------|
| Profile  | Profile#[USERNAME] | Profile#[USERNAME] |                       |                 |                   |                 |         |        |
| Job      | Job#[ID]           | Job#[ID]           | Contractor#[USERNAME] | Paid#[PAID]     | Client#[USERNAME] | Paid#[PAID]     | Payment | [DATE] |
| Contract | Contract#[ID]      | Contract#[ID]      | Contractor#[USERNAME] | Status#[STATUS] | Client#[USERNAME] | Status#[STATUS] |         |        |

### Access Patterns

* Access Contract by ID: `PK = Contract#[ID] AND SK = Contract#[ID]`
* List Non Terminated Contracts by Profile (Client or Contractor):
  * Non-Terminated Contracts for a Contractor: `PK1 = Contractor#[USERNAME] AND SK1 BETWEEN Status#IN_PROGRESS AND Status#NEW`
  * Non-Terminated Contracts for a Client: `PK2 = Client#[USERNAME] AND SK2 BETWEEN Status#IN_PROGRESS AND Status#NEW`
  * Please note that: IN_PROGRESS < NEW < TERMINATED if ordered alphabetically
* List Unpaid Jobs:
  * Non-Terminated Contracts for a Contractor: `PK1 = Contractor#[USERNAME] AND SK1 = Paid#false`
  * Non-Terminated Contracts for a Client: `PK2 = Client#[USERNAME] AND SK2 = Paid#false`
* Best Profession: `PK3 = Payment AND SK3 BETWEEN start AND end`
* Best Clients: `PK3 = Payment AND SK3 BETWEEN start AND end`

## HOW-TOs

### How-to manual deploy

1. Install the software dependencies as detailed in [.gitpodDockerfile](.gitpodDockerfile) (e.g. aws-cdk, aws-sam-cli, etc.)
2. Use `npm install` to download the lerna dependencies used in the following steps
3. Use `npm run bootstrap` to bootstrap the project (i.e. install all the dependencies)
4. Use `npm run build` to build it

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
specifically a script named regenerate-graphql-schema so execute `npm run regenerate-graphql-schema` in order to regenerate
(schema.graphql)[src/app-sync/schema.graphql]

Note: We do not do it automatically at the stack deploy in order to not slowdown every single deploy and/or to avoid un-intended
changes to be produced automatically since the schema doesn't change so frequently.

### Regenerate the GraphQL Schema Types

This project generates Typescript types for the GraphQL API operations. In order to regenerate those types you must execute `npm run regenerate-graphql-schema-types`
