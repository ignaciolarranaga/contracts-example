#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { ExampleStack } from './ExampleStack';
import { Environment } from './Environment';

const app = new cdk.App();

new ExampleStack(app, 'ExampleStack', {
  env: (process.env.ENVIRONMENT_NAME as Environment) || Environment.develop,
});
