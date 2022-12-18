import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';

import errorCodes from 'error-codes';
import {
  Job,
  MutationPayJobArgs,
  Profile,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Pays a job
 * @param event The AppSync event received
 * @returns The profile after the update
 */
export default async function makeProfileDeposit(
  event: AppSyncResolverEvent<MutationPayJobArgs>,
  context: Context,
  callback: Callback
): Promise<any> {
  const currentUser = (event.identity as AppSyncIdentityCognito).username!;
  const currentTime = new Date();

  console.log(`Paying the job ${event.arguments.id}`);

  const job = await getJob(event.arguments.id);
  if (!job.contractId) {
    callback(errorCodes.CAN_NOT_PAY_A_JOB_OUTSIDE_A_CONTRACT);
    return;
  }

  const client = await getClientProfile(currentUser);
  if (client.balance < job.price) {
    callback(errorCodes.NO_ENOUGH_BALANCE_TO_PAY_THE_JOB);
    return;
  }

  await documentClient
    .transactWrite({
      TransactItems: [
        updateClientBalance(currentTime, job, client),
        updateContractorBalance(currentTime, job),
        markJobAsPaidTransactItem(currentTime, job),
      ],
    })
    .promise();

  return job;
}

function updateClientBalance(currentTime: Date, job: Job, client: Profile) {
  return {
    // Update the job so it is marked as paid
    Update: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${client.id}`,
        SK: `Profile#${client.id}`,
      },
      UpdateExpression:
        'SET balance = balance - :amount, amountDue = amountDue - :amount, maxDeposit = :maxDeposit, ' +
        'lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND ' +
        // Prevents the profile to be modified while updating
        'amountDue = :oldAmountDue AND ' +
        // Has sufficient balance at the moment of transaction
        'balance >= :amount',
      ExpressionAttributeValues: {
        ':oldAmountDue': client.amountDue,
        ':amount': job.price,
        ':maxDeposit': (client.amountDue - job.price) / 4,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': client.id,
      },
    },
  };
}

function updateContractorBalance(currentTime: Date, job: Job) {
  return {
    // Update the job so it is marked as paid
    Update: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${job.contractorId}`,
        SK: `Profile#${job.contractorId}`,
      },
      UpdateExpression:
        'SET balance = balance + :amount, lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      ExpressionAttributeValues: {
        ':amount': job.price,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': job.clientId,
      },
    },
  };
}

function markJobAsPaidTransactItem(currentTime: Date, job: Job) {
  // Intentionally modifying the job so it can be returned
  job.paid = true;
  job.paymentDate = currentTime.toISOString();
  job.lastModifiedAt = currentTime.toISOString();
  job.lastModifiedBy = job.clientId;

  return {
    // Update the job so it is marked as paid
    Update: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Job#${job.id}`,
        SK: `Job#${job.id}`,
      },
      UpdateExpression:
        'SET SK1 = :sk1, SK2 = :sk2, ' +
        'paid = :paid, paymentDate = :paymentDate, ' +
        'lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression:
        // Job exists
        'attribute_exists(PK) AND attribute_exists(SK) AND ' +
        // Job belongs to the client
        'clientId = :clientId AND ' +
        // It is not yet paid
        'paid = :nonPaid',
      ExpressionAttributeValues: {
        ':sk1': 'Paid#true',
        ':sk2': 'Paid#true',
        ':paid': job.paid,
        ':paymentDate': job.paymentDate,
        ':clientId': job.clientId,
        ':nonPaid': false,
        ':lastModifiedAt': job.lastModifiedAt,
        ':lastModifiedBy': job.lastModifiedBy,
      },
    },
  };
}

async function getJob(id: string) {
  return (
    await documentClient
      .get({
        TableName: process.env.TABLE_NAME!,
        Key: {
          PK: `Job#${id}`,
          SK: `Job#${id}`,
        },
      })
      .promise()
  ).Item as Job;
}

async function getClientProfile(clientId: string) {
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
