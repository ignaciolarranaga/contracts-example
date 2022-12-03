import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { MutationCreateProfileArgs } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new profile
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 * @returns The profile created
 */
 export default async function createProfile(event: AppSyncResolverEvent<MutationCreateProfileArgs>,
  context: Context, callback: Callback): Promise<any> {

  console.log(`Creating profile for ${event.arguments.input.firstName} ${event.arguments.input.lastName}`);

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
  }

  await documentClient.put({ TableName : process.env.TABLE_NAME, Item: item }).promise();

  return item;
}