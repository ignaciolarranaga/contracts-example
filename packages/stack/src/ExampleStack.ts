import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { GraphqlApi } from '@aws-cdk/aws-appsync-alpha';
import { Construct } from 'constructs';

import { Environment } from './Environment';
import { buildUserPool } from './cognito';
import { buildDynamoDBTable } from './dynamodb';
import { buildAppSyncApi } from './app-sync';
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

    const { userPool, userPoolClient } = buildUserPool(this, params.env);
    const dynamoDBTable = buildDynamoDBTable(this, params.env);
    const graphQLResolversLambda = buildGraphQLResolversLambda(
      this,
      params.env,
      dynamoDBTable,
      userPool,
      userPoolClient
    );

    const appSyncApi = buildAppSyncApi(
      this,
      params.env,
      userPool,
      dynamoDBTable,
      graphQLResolversLambda
    );

    this.buildOutputs(userPool, userPoolClient, appSyncApi);
  }

  private buildOutputs(
    userPool: UserPool,
    userPoolClient: UserPoolClient,
    appSyncApi: GraphqlApi
  ) {
    new CfnOutput(this, 'AwsProjectRegion', { value: this.region });
    new CfnOutput(this, 'AwsCognitoRegion', { value: this.region });
    new CfnOutput(this, 'AwsUserPoolsId', { value: userPool.userPoolId });
    new CfnOutput(this, 'AwsUserPoolsWebClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, 'AwsAppsyncGraphqlEndpoint', {
      value: appSyncApi.graphqlUrl,
    });
    new CfnOutput(this, 'AwsAppsyncRegion', { value: this.region });
    new CfnOutput(this, 'AwsAppsyncAuthenticationType', { value: 'API_KEY' });
    new CfnOutput(this, 'AwsAppsyncApiKey', { value: appSyncApi.apiKey! });
  }
}
