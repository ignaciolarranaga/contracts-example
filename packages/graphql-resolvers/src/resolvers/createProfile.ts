import { AppSyncResolverEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { MutationCreateProfileArgs } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
});

/**
 * Creates a new profile
 * @param event The AppSync event received
 * @returns The profile created
 */
export default async function createProfile(
  event: AppSyncResolverEvent<MutationCreateProfileArgs>
): Promise<any> {
  console.log(
    `Creating profile for ${event.arguments.input.firstName} ${event.arguments.input.lastName}`
  );

  // Creating the user in Cognito
  await cognitoIdentityServiceProvider
    .signUp({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: event.arguments.input.username,
      Password: event.arguments.input.password,
    })
    .promise();

  const id = uuid();
  const item = {
    PK: `Profile#${id}`,
    SK: `Profile#${id}`,
    _typename: 'Profile',

    id,
    username: event.arguments.input.username,
    firstName: event.arguments.input.firstName,
    lastName: event.arguments.input.lastName,
    profession: event.arguments.input.profession,
    type: event.arguments.input.type,
    balance: 0,
  };

  await documentClient
    .put({ TableName: process.env.TABLE_NAME!, Item: item })
    .promise();

  return item;
}
