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
* We are explicitly not using the workspaces because we need the graphql-resolver-libraries to be in the node_modules subfolder for packaging

## Useful commands

* `npm run lint` Check lint issues on the different packages
* `npm run prettier` Check prettier issues on the different packages

## HOW-TOs

### Execute Lambdas Locally
To execute a lambda locally you can run: `sam local invoke LAMBDA_ID -e SAMPLE_EVENT -t stack.yml`.

**IMPORTANT**:
* If you make changes to the code you need to run `npm run build && npm run synth` first, example: `npm run build && npm run synth && sam local invoke GraphQLResolversCC7FA53B -e packages/graphql-resolvers/sample-events/getCompany.json -t stack.yml`

References:
* See (Run a Lambda function on local environment with AWS CDK and SAM)[https://cloudash.dev/blog/run-cdk-lambda-function-on-local-environment]
* (sam local invoke)[https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html] command.
