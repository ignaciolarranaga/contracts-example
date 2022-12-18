import {
  AppSyncResolverEvent,
  AppSyncIdentityCognito,
  Context,
  Callback,
} from 'aws-lambda';
import AWS from 'aws-sdk';

import errorCodes from 'error-codes';
import {
  Contract,
  ContractStatus,
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

  const contract = await getContract(job.contractId);
  const jobs = await getContractJobs(contract.jobIds);
  const unpaidJobs = jobs.filter(
    job => !job.paid && job.id !== event.arguments.id
  );

  const client = await getProfile(currentUser);
  if (client.balance < job.price) {
    callback(errorCodes.NO_ENOUGH_BALANCE_TO_PAY_THE_JOB);
    return;
  }

  const contractor = await getProfile(contract.contractorId);

  await documentClient
    .transactWrite({
      TransactItems: [
        updateClientBalanceTransactItem(currentTime, job, client),
        updateContractorBalanceTransactItem(currentTime, job),
        markJobAsPaidTransactItem(currentTime, job, contractor),
        updateContractTransactItem(currentTime, contract, unpaidJobs),
      ],
    })
    .promise();

  return job;
}

function updateClientBalanceTransactItem(
  currentTime: Date,
  job: Job,
  client: Profile
) {
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

function updateContractorBalanceTransactItem(currentTime: Date, job: Job) {
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

function markJobAsPaidTransactItem(
  currentTime: Date,
  job: Job,
  contractor: Profile
) {
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
        'SET SK1 = :sk1, SK2 = :sk2, PK3 = :pk3, SK3 = :sk3, ' +
        'paid = :paid, paymentDate = :paymentDate, profession = :profession, ' +
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
        ':pk3': 'Payment',
        ':sk3': job.paymentDate,
        ':paid': job.paid,
        ':paymentDate': job.paymentDate,
        ':profession': contractor.profession,
        ':clientId': job.clientId,
        ':nonPaid': false,
        ':lastModifiedAt': job.lastModifiedAt,
        ':lastModifiedBy': job.lastModifiedBy,
      },
    },
  };
}

function updateContractTransactItem(
  currentTime: Date,
  contract: Contract,
  unpaidJobs: Job[]
) {
  const status =
    unpaidJobs.length === 0
      ? ContractStatus.TERMINATED
      : ContractStatus.IN_PROGRESS;

  return {
    // Update the contract status based on the unpaid jobs
    Update: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Contract#${contract.id}`,
        SK: `Contract#${contract.id}`,
      },
      UpdateExpression:
        'SET #status = :status, SK1 = :sk1, SK2 = :sk2, ' +
        'lastModifiedAt = :lastModifiedAt, lastModifiedBy = :lastModifiedBy',
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND lastModifiedAt = :prevLastModifiedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':sk1': `Status#${status}`,
        ':sk2': `Status#${status}`,
        ':lastModifiedAt': currentTime.toISOString(),
        ':lastModifiedBy': contract.clientId,
        ':prevLastModifiedAt': contract.lastModifiedAt,
      },
    },
  };
}

export async function getContract(id: string): Promise<Contract> {
  return (
    await documentClient
      .get({
        TableName: process.env.TABLE_NAME!,
        Key: {
          PK: `Contract#${id}`,
          SK: `Contract#${id}`,
        },
      })
      .promise()
  ).Item as Contract;
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

async function getContractJobs(jobIds: string[]): Promise<Job[]> {
  const result = await documentClient
    .batchGet({
      RequestItems: {
        [process.env.TABLE_NAME!]: {
          Keys: jobIds.map(jobId => {
            return { PK: `Job#${jobId}`, SK: `Job#${jobId}` };
          }),
        },
      },
    })
    .promise();

  const jobs = [];
  if (
    result.Responses &&
    result.Responses[process.env.TABLE_NAME!].length > 0
  ) {
    for (const item of result.Responses[process.env.TABLE_NAME!]) {
      jobs.push(item as Job);
    }
  }

  return jobs;
}
