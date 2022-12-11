import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

export function prepareClientProfileExistsAndItIsAClientCheckCondition(
  clientId: string
): DocumentClient.TransactWriteItem {
  return {
    ConditionCheck: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${clientId}`,
        SK: `Profile#${clientId}`,
      },
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND #type = :client_type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':client_type': ProfileType.CLIENT,
      },
    },
  };
}

export function prepareContractorProfileExistsAndItIsAContractorCheckCondition(
  contractorId: string
): DocumentClient.TransactWriteItem {
  return {
    ConditionCheck: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Profile#${contractorId}`,
        SK: `Profile#${contractorId}`,
      },
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND #type = :contractor_type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':contractor_type': ProfileType.CONTRACTOR,
      },
    },
  };
}

export function prepareJobExistsAndBelongsToContractorCheckCondition(
  jobId: string,
  contractorId: string
): DocumentClient.TransactWriteItem {
  return {
    ConditionCheck: {
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `Job#${jobId}`,
        SK: `Job#${jobId}`,
      },
      ConditionExpression:
        'attribute_exists(PK) AND attribute_exists(SK) AND contractorId = :contractor_id',
      ExpressionAttributeValues: {
        ':contractor_id': contractorId,
      },
    },
  };
}
