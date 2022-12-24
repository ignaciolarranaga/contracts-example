import { AppSyncResolverEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { BestClientsOutputConnection, Job, QueryBestClientsArgs } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { JobDynamoDBItem } from 'utils/JobDynamoDBItem';

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * Calculates the best profession
 * @param event The AppSync event received
 * @returns The profile created
 */
export default async function bestClients(
  event: AppSyncResolverEvent<QueryBestClientsArgs>
): Promise<BestClientsOutputConnection> {
  console.log(
    `Calculating the best clients for ${event.arguments.filter?.start} : ${event.arguments.filter?.end}`
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
            : '9999-12-31T23:59:59.999Z',
        },
      })
      .promise()
  ).Items as (Job & JobDynamoDBItem)[];

  const clientNames : { [id: string]: string } = {};
  const clientTotals: { [id: string]: number } = {};
  for (const job of paidJobs) {
    clientNames[job.clientId] = job.clientFullName!;
    clientTotals[job.clientId] =
      (clientTotals[job.clientId] ? clientTotals[job.clientId] : 0) + job.price;
  }

  const result = Object
    .entries(clientTotals)
    .map(total => {
      const id = total[0];
      const paid = total[1];
      return { id, fullName: clientNames[id], paid }
    })
    .sort((a, b) => b.paid - a.paid); // Descendant
  const limit = event.arguments.limit && event.arguments.limit > 0 ? event.arguments.limit : undefined;
  const items = result.slice(0, limit);

  return {
    items
  };
}
