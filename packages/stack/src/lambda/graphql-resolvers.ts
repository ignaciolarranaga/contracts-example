import { Duration } from 'aws-cdk-lib';
import {
  Code,
  Function,
  LayerVersion,
  Runtime,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { Environment } from '../Environment';

export function buildGraphQLResolversLambda(
  scope: Construct,
  env: Environment,
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
    },
    tracing: Tracing.ACTIVE,
    timeout: Duration.seconds(15), // Incrementing timeout due mongo connection
  });

  return lambda;
}
