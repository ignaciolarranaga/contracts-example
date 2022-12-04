import { AppSyncResolverEvent, AppSyncIdentityCognito } from 'aws-lambda';
import AWS from 'aws-sdk';
import { MutationCreateProfileArgs, Profile } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';

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
      Username: event.arguments.input.id,
      Password: event.arguments.input.password,
    })
    .promise();

  const currentUser = event.identity ? (event.identity as AppSyncIdentityCognito).username : undefined;
  const currentTime = new Date();
  const item: Profile & DynamoDBItem = {
    PK: `Profile#${event.arguments.input.id}`,
    SK: `Profile#${event.arguments.input.id}`,
    __typename: 'Profile',

    id: event.arguments.input.id,
    firstName: event.arguments.input.firstName,
    lastName: event.arguments.input.lastName,
    profession: event.arguments.input.profession,
    type: event.arguments.input.type,
    balance: 0,

    createdAt: currentTime.toISOString(),
    createdBy: currentUser,
    lastModifiedAt: currentTime.toISOString(),
    lastModifiedBy: currentUser,
  };

  await documentClient
    .put({
      TableName: process.env.TABLE_NAME!,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    })
    .promise();

  return item;
}
