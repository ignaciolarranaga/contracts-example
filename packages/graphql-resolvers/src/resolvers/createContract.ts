import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import {
  MutationCreateContractArgs,
  Contract,
  ContractStatus,
  ProfileType,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';
import errorCodes from 'error-codes';

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new profile
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 * @returns The profile created
 */
export default async function createProfile(
  event: AppSyncResolverEvent<MutationCreateContractArgs>,
  context: Context,
  callback: Callback
): Promise<any> {
  const id = uuid();
  const currentUser = (event.identity as AppSyncIdentityCognito).username!;
  const currentTime = new Date();
  const item: Contract & DynamoDBItem = {
    PK: `Contract#${id}`,
    SK: `Contract#${id}`,
    __typename: 'Contract',

    id,
    contractorId: currentUser,
    clientId: event.arguments.input.clientId,
    jobId: event.arguments.input.jobId,
    terms: event.arguments.input.terms,
    status: ContractStatus.NEW,

    PK1: `Contractor#${currentUser}`,
    SK1: ContractStatus.NEW,
    PK2: `Client#${event.arguments.input.clientId}`,
    SK2: ContractStatus.NEW,

    createdAt: currentTime.toISOString(),
    createdBy: currentUser,
    lastModifiedAt: currentTime.toISOString(),
    lastModifiedBy: currentUser,
  };

  if (item.contractorId === item.clientId) {
    callback(errorCodes.CAN_NOT_SELF_CONTRACT);
    return;
  }

  console.log(
    `Creating contract between ${item.contractorId} and ${item.clientId} on job: ${item.jobId}`
  );

  await documentClient
    .transactWrite({
      TransactItems: [
        {
          // Contractor profile exits and it is a contractor
          ConditionCheck: {
            TableName: process.env.TABLE_NAME!,
            Key: {
              PK: `Profile#${item.contractorId}`,
              SK: `Profile#${item.contractorId}`,
            },
            ConditionExpression:
              'attribute_exists(PK) AND attribute_exists(SK) AND #type = :contractor_type',
            ExpressionAttributeNames: {
              '#type': 'type',
            },
            ExpressionAttributeValues: {
              ':contractor_type': ProfileType.CONTRACTOR
            },
          },
        },
        {
          // Client profile exits and it is a contractor
          ConditionCheck: {
            TableName: process.env.TABLE_NAME!,
            Key: {
              PK: `Profile#${item.clientId}`,
              SK: `Profile#${item.clientId}`,
            },
            ConditionExpression:
              'attribute_exists(PK) AND attribute_exists(SK) AND #type = :client_type',
            ExpressionAttributeNames: {
              '#type': 'type',
            },
            ExpressionAttributeValues: {
              ':client_type': ProfileType.CLIENT
            },
          },
        },
        {
          // Insert the new contract
          Put: {
            TableName: process.env.TABLE_NAME!,
            Item: item,
            ConditionExpression:
              'attribute_not_exists(PK) AND attribute_not_exists(SK)',
          },
        },
      ],
    })
    .promise();

  return item;
}
