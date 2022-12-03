import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { Environment } from './Environment';
import { buildAppSync } from './app-sync';
import { buildGraphQLResolversLambda } from './lambda/graphql-resolvers';
import { buildDynamoDBTable } from './dynamodb';

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

    const graphQLResolversLambda = buildGraphQLResolversLambda(
      this,
      params.env,
    );

    buildDynamoDBTable(this, params.env);

    buildAppSync(this, params.env, graphQLResolversLambda);
  }
}
