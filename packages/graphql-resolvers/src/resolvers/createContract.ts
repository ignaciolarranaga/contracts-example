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
import {
  prepareContractorProfileExistsAndItIsAContractorCheckCondition,
} from 'utils/conditional-checks';
import errorCodes from 'error-codes';

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new contract
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
  const item = prepareItem(id, currentUser, event, currentTime);

  if (item.contractorId === item.clientId) {
    callback(errorCodes.CAN_NOT_SELF_CONTRACT);
    return;
  }

  console.log(
    `Creating contract between ${item.contractorId} and ${
      item.clientId
    } on jobs: ${JSON.stringify(item.jobIds)}`
  );

  const amountDue = await calculateAmountDue(item.jobIds);

  await documentClient
    .transactWrite({
      TransactItems: [
        prepareContractorProfileExistsAndItIsAContractorCheckCondition(
          item.contractorId
        ),
        {
          Update: { // Update the client amount due
            TableName: process.env.TABLE_NAME!,
            Key: {
              PK: `Profile#${item.clientId}`,
              SK: `Profile#${item.clientId}`,
            },
            UpdateExpression: 'SET amountDue = amountDue + :amountDue',
            ConditionExpression: // The profile exists and it is a client
              'attribute_exists(PK) AND attribute_exists(SK) AND #type = :clientType',
            ExpressionAttributeNames: {
              '#type': 'type',
            },
            ExpressionAttributeValues: {
              ':clientType': ProfileType.CLIENT,
              ':amountDue': amountDue
            },
          }
        },
        ...event.arguments.input.jobIds.map(jobId => {
          return {
            // Update the jobs so we know they are assigned
            Update: {
              TableName: process.env.TABLE_NAME!,
              Key: {
                PK: `Job#${jobId}`,
                SK: `Job#${jobId}`,
              },
              UpdateExpression: 'set PK1 = :pk1, SK1 = :sk1, PK2 = :pk2, SK2 = :sk2, contractorId = :contractorId',
              ConditionExpression: // Job exists and belongs to the contractor
                'attribute_exists(PK) AND attribute_exists(SK) AND clientId = :clientId',
              ExpressionAttributeValues: {
                ':pk1': `Contractor#${item.contractorId}`,
                ':sk1': 'Paid#false',
                ':pk2': `Client#${item.clientId}`,
                ':sk2': 'Paid#false',
                ':clientId': item.clientId,
                ':contractorId': item.contractorId,
              },
            },
          };
        }),
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

async function calculateAmountDue(jobIds: string[]): Promise<Number> {
  const result = await documentClient.batchGet({
    RequestItems: {
      [process.env.TABLE_NAME!]: {
        Keys: jobIds.map(jobId => { return { PK: `Job#${jobId}`, SK: `Job#${jobId}` } }),
        ProjectionExpression: 'price'
      }
    }
  }).promise();

  let amountDue = 0;
  if (result.Responses && result.Responses[process.env.TABLE_NAME!].length > 0) {
    for (const item of result.Responses[process.env.TABLE_NAME!]) {
      amountDue += item.price
    }
  }

  return amountDue;
}

function prepareItem(
  id: string,
  currentUser: string,
  event: AppSyncResolverEvent<MutationCreateContractArgs>,
  currentTime: Date
): Contract & DynamoDBItem {
  return {
    PK: `Contract#${id}`,
    SK: `Contract#${id}`,
    __typename: 'Contract',

    id,
    clientId: currentUser, // The contracts are created only by the clients
    contractorId: event.arguments.input.contractorId,
    jobIds: event.arguments.input.jobIds,
    terms: event.arguments.input.terms,
    status: ContractStatus.NEW,

    PK1: `Contractor#${event.arguments.input.contractorId}`,
    SK1: `Status#${ContractStatus.NEW}`,
    PK2: `Client#${currentUser}`,
    SK2: `Status#${ContractStatus.NEW}`,

    createdAt: currentTime.toISOString(),
    createdBy: currentUser,
    lastModifiedAt: currentTime.toISOString(),
    lastModifiedBy: currentUser,
  };
}
