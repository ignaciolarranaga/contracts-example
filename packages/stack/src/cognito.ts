import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

import { Environment } from './Environment';

import { buildUserPollPreSignUpFunction } from './lambda/user-pool-pre-sign-up';

export function buildUserPool(scope: Stack, env: Environment) {
  const preSignUpFunction = buildUserPollPreSignUpFunction(scope, env);

  const userPool = new UserPool(scope, 'ExampleUserPool', {
    userPoolName: `example-user-pool-${env}`,
    selfSignUpEnabled: true,
    removalPolicy: RemovalPolicy.DESTROY,
    signInAliases: {
      username: true,
    },
    signInCaseSensitive: true,
    lambdaTriggers: {
      preSignUp: preSignUpFunction,
    }
  });

  const userPoolClient = userPool.addClient('web-client', {
    userPoolClientName: 'web-client',
  });

  return { userPool, userPoolClient };
}
