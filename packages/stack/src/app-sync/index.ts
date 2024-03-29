import { Duration, Expiration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  AuthorizationType,
  DynamoDbDataSource,
  GraphqlApi,
  LambdaDataSource,
  MappingTemplate,
  Schema,
} from '@aws-cdk/aws-appsync-alpha';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import { Environment } from '../Environment';

const SCHEMA_FILE_PATH = 'src/app-sync/schema.graphql';
const GRAPHQL_REQUEST_RESOLVER_TEMPLATE =
  'src/app-sync/templates/resolvers.req.vtl';
const GRAPHQL_RESPONSE_RESOLVER_TEMPLATE =
  'src/app-sync/templates/resolvers.res.vtl';

export function buildAppSyncApi(
  scope: Construct,
  env: Environment,
  userPool: UserPool,
  dynamoDBTable: Table,
  graphQLResolversLambda: IFunction
) {
  const appSync = new GraphqlApi(scope, 'ExampleApi', {
    name: `example-${env}`,
    schema: Schema.fromAsset(SCHEMA_FILE_PATH),
    authorizationConfig: {
      defaultAuthorization: {
        authorizationType: AuthorizationType.API_KEY,
        apiKeyConfig: {
          name: 'web-key',
          description: 'Key used for the web client',
          expires: Expiration.after(Duration.days(365)),
        },
      },
      additionalAuthorizationModes: [
        {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool,
          },
        },
      ],
    },
  });

  // Data Sources
  appSync.addNoneDataSource('None', {
    name: 'None',
    description: 'Used to empty calculations',
  });
  const resolversDataSource = appSync.addLambdaDataSource(
    'ResolversLambdaDataSource',
    graphQLResolversLambda
  );
  const dynamoDBTableDataSource = appSync.addDynamoDbDataSource(
    'ExampleTable',
    dynamoDBTable
  );

  prepareDynamoDbResolvers(dynamoDBTableDataSource);
  prepareLambdaResolvers(resolversDataSource);

  return appSync;
}

function prepareDynamoDbResolvers(dynamoDBTableDataSource: DynamoDbDataSource) {
  for (const operation of [
    {
      typeName: 'Query',
      fieldName: 'getContract',
    },
    {
      typeName: 'Query',
      fieldName: 'listContracts',
    },
    {
      typeName: 'Query',
      fieldName: 'getProfile',
    },
    {
      typeName: 'Query',
      fieldName: 'listJobs',
    },
  ]) {
    dynamoDBTableDataSource.createResolver({
      typeName: operation.typeName,
      fieldName: operation.fieldName,
      requestMappingTemplate: MappingTemplate.fromFile(
        `src/app-sync/templates/${operation.typeName}.${operation.fieldName}.req.vtl`
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        `src/app-sync/templates/${operation.typeName}.${operation.fieldName}.res.vtl`
      ),
    });
  }
}

function prepareLambdaResolvers(resolversDataSource: LambdaDataSource) {
  for (const operation of [
    { typeName: 'Mutation', fieldName: 'createContract' },
    { typeName: 'Mutation', fieldName: 'createJob' },
    { typeName: 'Mutation', fieldName: 'createProfile' },
    { typeName: 'Mutation', fieldName: 'makeProfileDeposit' },
    { typeName: 'Mutation', fieldName: 'payJob' },
    { typeName: 'Query', fieldName: 'bestProfession' },
    { typeName: 'Query', fieldName: 'bestClients' },
  ]) {
    resolversDataSource.createResolver({
      ...operation,
      requestMappingTemplate: MappingTemplate.fromFile(
        GRAPHQL_REQUEST_RESOLVER_TEMPLATE
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        GRAPHQL_RESPONSE_RESOLVER_TEMPLATE
      ),
    });
  }
}
