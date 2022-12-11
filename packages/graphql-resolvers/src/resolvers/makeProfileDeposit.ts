import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';

import { MutationMakeProfileDepositArgs, ProfileType, Profile } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Makes a deposit on a client profile
 * @param event The AppSync event received
 * @returns The profile after the update
 */
export default async function makeProfileDeposit(
  event: AppSyncResolverEvent<MutationMakeProfileDepositArgs>,
  context: Context,
  callback: Callback
): Promise<any> {
  const currentUser = (event.identity as AppSyncIdentityCognito).username!;
  const currentTime = new Date();

  console.log(`Making a deposit of ${event.arguments.input.amount} on ${currentUser}`);

  const result = await documentClient
    .update({
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${currentUser}`,
        SK: `Profile#${currentUser}`,
      },
      UpdateExpression: 'SET balance = balance + :amount, lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression: // Profile exists and it is a client
        'attribute_exists(PK) AND attribute_exists(SK) AND #type = :client_type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':client_type': ProfileType.CLIENT,
        ':amount': event.arguments.input.amount,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': currentUser,
      },
      ReturnValues: 'ALL_NEW'
    })
    .promise();

  return result.Attributes;
}
