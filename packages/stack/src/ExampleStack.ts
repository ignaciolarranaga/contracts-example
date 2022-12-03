import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Environment } from './Environment';
import { buildUserPool } from './cognito';
import { buildDynamoDBTable } from './dynamodb';
import { buildAppSync } from './app-sync';
import { buildGraphQLResolversLambda } from './lambda/graphql-resolvers';

export interface ExampleStackParameters {
  env: Environment;
}

export class ExampleStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    params: ExampleStackParameters,
    props?: StackProps
  ) {
    super(scope, id, props);

    const { userPoolClient } = buildUserPool(this, params.env);
    const dynamoDBTable = buildDynamoDBTable(this, params.env);
    const graphQLResolversLambda = buildGraphQLResolversLambda(
      this,
      params.env,
      dynamoDBTable,
      userPoolClient
    );

    buildAppSync(this, params.env, graphQLResolversLambda);
  }
}
