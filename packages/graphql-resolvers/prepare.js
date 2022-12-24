#!/usr/bin/node
const fs = require('fs');
const config = require('../stack/cdk.out/outputs.json');

if (!config) {
  console.error(
    'You need to deploy the stack before trying to prepare the configuration. Execute `npm run deploy`'
  );
  process.exit(1);
}

let data = {};
for (let stack in config) {
  for (let key in config[stack]) {
    let outputKey;

    // The AmplifyJS library uses half camel/half pascal keys, so we need to map them
    // https://docs.amplify.aws/lib/graphqlapi/create-or-re-use-existing-backend/q/platform/js/#re-use-existing-appsync-graphql-api
    if (key === 'AwsAppsyncGraphqlEndpoint') {
      outputKey = 'aws_appsync_graphqlEndpoint';
    } else if (key === 'AwsAppsyncAuthenticationType') {
      outputKey = 'aws_appsync_authenticationType';
    } else if (key === 'AwsAppsyncApiKey') {
      outputKey = 'aws_appsync_apiKey';
    } else {
      outputKey = key
        .split(/(?=[A-Z])/)
        .join('_')
        .toLowerCase();
    }

    data[outputKey] = config[stack][key];
  }
}

let stringData = JSON.stringify(data, null, 2);
fs.writeFileSync('./src/deployment-config.json', stringData);
