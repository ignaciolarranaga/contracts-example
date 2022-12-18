import { AppSyncResolverEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { Job, QueryBestProfessionArgs } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Calculates the best profession
 * @param event The AppSync event received
 * @returns The profile created
 */
export default async function bestProfession(
  event: AppSyncResolverEvent<QueryBestProfessionArgs>
): Promise<string | null> {
  console.log(
    `Calculating the best profession for ${event.arguments.filter?.start} : ${event.arguments.filter?.end}`
  );

  // TODO: This can be optimized for example with bucketing
  const paidJobs = (
    await documentClient
      .query({
        TableName: process.env.TABLE_NAME!,
        IndexName: 'GSI3',
        KeyConditionExpression: 'PK3 = :pk3 AND SK3 BETWEEN :start AND :end',
        ExpressionAttributeValues: {
          ':pk3': 'Payment',
          ':start': event.arguments.filter?.start
            ? event.arguments.filter.start
            : '0000-01-01T00:00:00.000Z',
          ':end': event.arguments.filter?.end
            ? event.arguments.filter.end
            : '9999-12-31T23:59:69.999Z',
        },
      })
      .promise()
  ).Items as Job[];

  let max = 0,
    bestProfession = null;
  const totals: { [profession: string]: number } = {};
  for (const job of paidJobs) {
    totals[job.profession!] =
      (totals[job.profession!] ? totals[job.profession!] : 0) + job.price;
    if (totals[job.profession!] > max) {
      max = totals[job.profession!];
      bestProfession = job.profession!;
    }
  }

  return bestProfession;
}
