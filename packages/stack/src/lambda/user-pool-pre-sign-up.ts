import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { Environment } from '../environment';

export function buildUserPollPreSignUpFunction(scope: Construct, env: Environment) {
  return new Function(scope, 'ExamplePreSignUp', {
    functionName: `example-user-pool-pre-sign-up-${env}`,
    description: 'The lambda that run the pre sign up validations',
    runtime: Runtime.NODEJS_16_X,
    code: Code.fromAsset('../user-pool-pre-sign-up/dist'),
    handler: 'index.handler',
    environment: {
      ENV: env,
    }
  });
}