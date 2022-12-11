import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { MutationCreateJobArgs, Job } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';
import { prepareContractorProfileExistsAndItIsAContractorCheckCondition } from 'utils/conditional-checks';

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new job
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 * @returns The profile created
 */
export default async function createJob(
  event: AppSyncResolverEvent<MutationCreateJobArgs>,
  context: Context,
  callback: Callback
): Promise<any> {
  const id = uuid();
  const currentUser = (event.identity as AppSyncIdentityCognito).username!;
  const currentTime = new Date();
  const item = prepareItem(id, currentUser, event, currentTime);

  console.log(`Creating a job of ${currentUser}: ${item.description}`);

  await documentClient
    .transactWrite({
      TransactItems: [
        prepareContractorProfileExistsAndItIsAContractorCheckCondition(
          item.contractorId
        ),
        {
          // Insert the new job
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
  event: AppSyncResolverEvent<MutationCreateJobArgs>,
  currentTime: Date
): Job & DynamoDBItem {
  return {
    PK: `Job#${id}`,
    SK: `Job#${id}`,
    __typename: 'Job',

    id,
    contractorId: currentUser,
    description: event.arguments.input.description,
    price: event.arguments.input.price,
    paid: false,

    PK1: `Contractor#${currentUser}`,
    SK1: `Job#${id}`,

    createdAt: currentTime.toISOString(),
    createdBy: currentUser,
    lastModifiedAt: currentTime.toISOString(),
    lastModifiedBy: currentUser,
  };
}
