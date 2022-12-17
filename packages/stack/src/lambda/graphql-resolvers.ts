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
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import { Environment } from '../Environment';

export function buildGraphQLResolversLambda(
  scope: Construct,
  env: Environment,
  dynamoDBTable: Table,
  userPool: UserPool,
  userPoolClient: UserPoolClient
) {
  const librariesLayer = new LayerVersion(scope, 'GraphQLResolversLibraries', {
    layerVersionName: `example-graphql-resolvers-libraries-${env}`,
    description: 'The GraphQL resolvers libraries layer',
    code: Code.fromAsset('../graphql-resolvers-libraries'),
    compatibleRuntimes: [Runtime.NODEJS_16_X], // spellchecker: disable-line
  });

  const lambda = new Function(scope, 'GraphQLResolvers', {
    functionName: `example-graphql-resolvers-${env}`,
    description: 'The resolvers of the GraphQL API',
    runtime: Runtime.NODEJS_16_X,
    code: Code.fromAsset('../graphql-resolvers/dist'),
    layers: [librariesLayer],
    handler: 'index.handler',
    environment: {
      ENV: env,
      TABLE_NAME: dynamoDBTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
    },
    tracing: Tracing.ACTIVE,
  });

  // Add Permissions to Modify Users
  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['cognito-idp:AdminAddUserToGroup'],
      resources: [userPool.userPoolArn],
    })
  );
  // Add Permissions Over the DynamoDB Table
  lambda.addToRolePolicy(
    new PolicyStatement({
      actions: [
        'dynamodb:ConditionCheckItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:BatchGetItem',
        'dynamodb:GetItem',
      ],
      resources: [dynamoDBTable.tableArn],
    })
  );

  return lambda;
}
