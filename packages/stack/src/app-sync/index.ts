import { Duration, Expiration } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  AuthorizationType,
  GraphqlApi,
  MappingTemplate,
  Schema,
} from '@aws-cdk/aws-appsync-alpha';
import { Construct } from 'constructs';

import { Environment } from '../Environment';

const SCHEMA_FILE_PATH = 'src/app-sync/schema.graphqls'; // cspell:disable-line
const GRAPHQL_REQUEST_RESOLVER_TEMPLATE =
  'src/app-sync/templates/resolvers.req.vtl';
const GRAPHQL_RESPONSE_RESOLVER_TEMPLATE =
  'src/app-sync/templates/resolvers.res.vtl';

export function buildAppSync(
  scope: Construct,
  env: Environment,
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

  // Lambda resolvers
  for (const operation of [
    { typeName: 'Mutation', fieldName: 'createProfile' },
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

  return appSync;
}
