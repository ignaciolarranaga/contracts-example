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
  Profile,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';
import { prepareContractorProfileExistsAndItIsAContractorCheckCondition as profileExistsAndItIsAContractorCheckCondition } from 'utils/conditional-checks';
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
    `Creating a contract between ${item.contractorId} and ${
      item.clientId
    } on jobs: ${JSON.stringify(item.jobIds)}`
  );

  const amountDue = await getCurrentAmountDue(item.clientId);
  const jobsTotal = await calculateJobsTotal(item.jobIds);

  await documentClient
    .transactWrite({
      TransactItems: [
        profileExistsAndItIsAContractorCheckCondition(item.contractorId),
        updateClientAmountDueAndMaxDepositTransactItem(
          currentTime,
          item.clientId,
          amountDue,
          jobsTotal
        ),
        // TODO: Protect to not exceed the max number of operations
        ...event.arguments.input.jobIds.map(jobId =>
          updateJobClientContractorTransactItem(
            currentTime,
            jobId,
            item.contractorId,
            item.clientId,
            id
          )
        ),
        insertNewContractTransactItem(item),
      ],
    })
    .promise();

  return item;
}

function insertNewContractTransactItem(item: Contract & DynamoDBItem) {
  return {
    // Insert the new contract
    Put: {
      TableName: process.env.TABLE_NAME!,
      Item: item,
      ConditionExpression:
        'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    },
  };
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

function updateJobClientContractorTransactItem(
  currentTime: Date,
  jobId: string,
  contractorId: string,
  clientId: string,
  contractId: string
) {
  return {
    // Update the jobs so we know they are assigned
    Update: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Job#${jobId}`,
        SK: `Job#${jobId}`,
      },
      UpdateExpression:
        'SET PK1 = :pk1, SK1 = :sk1, PK2 = :pk2, SK2 = :sk2, ' +
        'contractorId = :contractorId, contractId = :contractId, ' +
        'lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      // Job exists and belongs to the client
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND clientId = :clientId',
      ExpressionAttributeValues: {
        ':pk1': `Contractor#${contractorId}`,
        ':sk1': 'Paid#false',
        ':pk2': `Client#${clientId}`,
        ':sk2': 'Paid#false',
        ':clientId': clientId,
        ':contractorId': contractorId,
        ':contractId': contractId,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': clientId,
      },
    },
  };
}

function updateClientAmountDueAndMaxDepositTransactItem(
  currentTime: Date,
  clientId: string,
  amountDue: number,
  jobsTotal: number
) {
  return {
    Update: {
      // Update the client amount due
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${clientId}`,
        SK: `Profile#${clientId}`,
      },
      UpdateExpression:
        'SET amountDue = :amountDue, maxDeposit = :maxDeposit, ' +
        'lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression:
        // The profile exists
        'attribute_exists(PK) AND attribute_exists(SK) AND ' +
        // The profile is a client
        '#type = :clientType AND ' +
        // The amountDue has not changed (prevents simultaneous updates)
        'amountDue = :oldAmountDue',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':clientType': ProfileType.CLIENT,
        ':oldAmountDue': amountDue,
        // Increasing the amount due
        ':amountDue': amountDue + jobsTotal,
        // Adjusting the maximum deposit as per the business rule:
        // "a client can't deposit more than 25% his total of jobs to pay"
        ':maxDeposit': (amountDue + jobsTotal) / 4,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': clientId,
      },
    },
  };
}

async function getCurrentAmountDue(clientId: string) {
  const profile = (
    await documentClient
      .get({
        TableName: process.env.TABLE_NAME!,
        Key: {
          PK: `Profile#${clientId}`,
          SK: `Profile#${clientId}`,
        },
      })
      .promise()
  ).Item as Profile;

  return profile.amountDue;
}

async function calculateJobsTotal(jobIds: string[]): Promise<number> {
  const result = await documentClient
    .batchGet({
      RequestItems: {
        [process.env.TABLE_NAME!]: {
          Keys: jobIds.map(jobId => {
            return { PK: `Job#${jobId}`, SK: `Job#${jobId}` };
          }),
          ProjectionExpression: 'price',
        },
      },
    })
    .promise();

  let amountDue = 0;
  if (
    result.Responses &&
    result.Responses[process.env.TABLE_NAME!].length > 0
  ) {
    for (const item of result.Responses[process.env.TABLE_NAME!]) {
      amountDue += item.price;
    }
  }

  return amountDue;
}
