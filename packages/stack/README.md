# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## HOW-TOs
### Regenerate the GraphQL Schema

The schema is generated from different independent schema files split by type (i.e. user.graphql, location.graphql, etc.).
To generate the combined schema file we use (graphql-schema-utilities)[https://github.com/awslabs/graphql-schema-utilities] and
specifically a script named regenerate-graphql so execute `npm run regenerate-graphql` in order to regenerate
(schema.graphql)[src/app-sync/schema.graphql]

Note: We do not do it automatically at the stack deploy in order to not slowdown every single deploy and/or to avoid un-intended
changes to be produced automatically since the schema doesn't change so frequently.