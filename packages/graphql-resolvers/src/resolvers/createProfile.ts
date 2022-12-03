import { AppSyncResolverEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { MutationCreateProfileArgs } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();

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

  const id = uuid();
  const item = {
    PK: `Profile#${id}`,
    SK: `Profile#${id}`,
    _typename: 'Profile',

    id,
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
