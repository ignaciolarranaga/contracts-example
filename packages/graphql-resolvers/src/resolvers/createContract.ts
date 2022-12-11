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
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';
import {
  prepareClientProfileExistsAndItIsAClientCheckCondition,
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
    `Creating contract between ${item.contractorId} and ${item.clientId} on job: ${item.jobId}`
  );

  await documentClient
    .transactWrite({
      TransactItems: [
        prepareContractorProfileExistsAndItIsAContractorCheckCondition(
          item.contractorId
        ),
        prepareClientProfileExistsAndItIsAClientCheckCondition(item.clientId),
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
}
