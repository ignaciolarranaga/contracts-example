import { CfnResource, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { CfnUserPoolGroup, UserPool } from 'aws-cdk-lib/aws-cognito';

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
    },
  });

  const userPoolClient = userPool.addClient('web-client', {
    userPoolClientName: 'web-client',
  });

  new CfnUserPoolGroup(scope, 'ContractorsGroup', {
    userPoolId: userPool.userPoolId,
    groupName: 'CONTRACTOR',
    description: 'Contractors',
    precedence: 1,
  }).addDependsOn(userPool.node.defaultChild as CfnResource);

  new CfnUserPoolGroup(scope, 'ClientsGroup', {
    userPoolId: userPool.userPoolId,
    groupName: 'CLIENT',
    description: 'Clients',
    precedence: 2,
  }).addDependsOn(userPool.node.defaultChild as CfnResource);

  return { userPool, userPoolClient };
}
