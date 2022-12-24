import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';

import errorCodes from 'error-codes';
import {
  MutationMakeProfileDepositArgs,
  Profile,
  ProfileType,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Makes a deposit on a profile
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

  console.log(
    `Making a deposit of ${event.arguments.input.amount} on ${currentUser}`
  );

  try {
    const result = await documentClient
      .update(
        updateProfileForTheDepositTransactItem(
          currentTime,
          currentUser,
          event.arguments.input.amount
        )
      )
      .promise();

    return result.Attributes;
  } catch (error: any) {
    if (error.code === 'ConditionalCheckFailedException') {
      // We intentionally do not check in advance to not slow down the good operations
      const profile = await getProfile(currentUser);

      if (!profile) {
        callback(errorCodes.PROFILE_NOT_EXIST + `: ${currentUser}`);
      }
      if (profile.type !== ProfileType.CLIENT) {
        callback(errorCodes.CAN_ONLY_MAKE_DEPOSITS_TO_CLIENTS);
      } else {
        // Can not deposit over the maxDeposit
        callback(
          errorCodes.CAN_NOT_MAKE_DEPOSITS_OVER_25_PERCENT_OF_AMOUNT_DUE +
            ` (max deposit $${profile.maxDeposit})`
        );
      }

      return;
    } else {
      throw error;
    }
  }
}

function updateProfileForTheDepositTransactItem(
  currentTime: Date,
  currentUser: string,
  amount: number
) {
  return {
    TableName: process.env.TABLE_NAME!,
    Key: {
      PK: `Profile#${currentUser}`,
      SK: `Profile#${currentUser}`,
    },
    UpdateExpression:
      'SET balance = balance + :amount, lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
    // Profile exists, it is a client and the deposit is of at most 25% of the amountDue
    ConditionExpression:
      'attribute_exists(PK) AND attribute_exists(SK) AND #type = :clientType AND :amount <= maxDeposit',
    ExpressionAttributeNames: {
      '#type': 'type',
    },
    ExpressionAttributeValues: {
      ':clientType': ProfileType.CLIENT,
      ':amount': amount,
      ':lastModifiedAt': currentTime.toISOString(),
      ':lastModifiedBy': currentUser,
    },
    ReturnValues: 'ALL_NEW',
  };
}

async function getProfile(clientId: string) {
  return (
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
}
