import { AppSyncResolverEvent, AppSyncIdentityCognito } from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { MutationCreateJobArgs, Job } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { DynamoDBItem } from 'utils/DynamoDBItem';
import { prepareClientProfileExistsAndItIsAClientCheckCondition } from 'utils/conditional-checks';

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Creates a new job
 * @param event The AppSync event received
 * @returns The profile created
 */
export default async function createJob(
  event: AppSyncResolverEvent<MutationCreateJobArgs>
): Promise<any> {
  const id = uuid();
  const currentUser = (event.identity as AppSyncIdentityCognito).username!;
  const currentTime = new Date();
  const item = prepareItem(id, currentUser, event, currentTime);

  console.log(`Creating a job of ${currentUser}: ${item.description}`);

  await documentClient
    .transactWrite({
      TransactItems: [
        prepareClientProfileExistsAndItIsAClientCheckCondition(item.clientId),
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
    clientId: currentUser,
    description: event.arguments.input.description,
    price: event.arguments.input.price,
    paid: false,

    createdAt: currentTime.toISOString(),
    createdBy: currentUser,
    lastModifiedAt: currentTime.toISOString(),
    lastModifiedBy: currentUser,
  };
}
