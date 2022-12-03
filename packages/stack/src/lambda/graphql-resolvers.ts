import { Duration } from 'aws-cdk-lib';
import {
  Code,
  Function,
  LayerVersion,
  Runtime,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import { Environment } from '../Environment';

export function buildGraphQLResolversLambda(
  scope: Construct,
  env: Environment,
  dynamoDBTable: Table,
  userPoolClient: UserPoolClient
) {
  const librariesLayer = new LayerVersion(scope, 'GraphQLResolversLibraries', {
    layerVersionName: `graphql-resolvers-libraries-${env}`,
    description: 'The GraphQL resolvers libraries layer',
    code: Code.fromAsset('../graphql-resolvers-libraries', {
      bundling: {
        image: Runtime.NODEJS_16_X.bundlingImage,
        // We need to introduce the nodejs directory required for the lambda layer
        command: [
          'bash',
          '-c',
          'mkdir /asset-output/nodejs && cp -r /asset-input/* /asset-output/nodejs',
        ],
      },
    }),
    compatibleRuntimes: [Runtime.NODEJS_16_X], // spellchecker: disable-line
  });

  const lambda = new Function(scope, 'GraphQLResolvers', {
    functionName: `graphql-resolvers-${env}`,
    description: 'The resolvers of the GraphQL API',
    runtime: Runtime.NODEJS_16_X,
    code: Code.fromAsset('../graphql-resolvers/dist'),
    layers: [librariesLayer],
    handler: 'index.handler',
    environment: {
      ENV: env,
      TABLE_NAME: dynamoDBTable.tableName,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
    },
    tracing: Tracing.ACTIVE,
    timeout: Duration.seconds(15), // Incrementing timeout due mongo connection
  });

  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['dynamodb:PutItem'],
      resources: [dynamoDBTable.tableArn],
    })
  );

  return lambda;
}
