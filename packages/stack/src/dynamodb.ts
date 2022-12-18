import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { Environment } from './Environment';

export enum DynamoDBIndexes {
  GSI1 = 'GSI1',
  GSI2 = 'GSI2',
  GSI3 = 'GSI3',
}

export function buildDynamoDBTable(scope: Construct, env: Environment): Table {
  const table = new Table(scope, 'ExampleTable', {
    tableName: `example-${env}`,
    partitionKey: { name: 'PK', type: AttributeType.STRING },
    sortKey: { name: 'SK', type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  table.addGlobalSecondaryIndex({
    indexName: DynamoDBIndexes.GSI1,
    partitionKey: { name: 'PK1', type: AttributeType.STRING },
    sortKey: { name: 'SK1', type: AttributeType.STRING },
  });
  table.addGlobalSecondaryIndex({
    indexName: DynamoDBIndexes.GSI2,
    partitionKey: { name: 'PK2', type: AttributeType.STRING },
    sortKey: { name: 'SK2', type: AttributeType.STRING },
  });
  table.addGlobalSecondaryIndex({
    indexName: DynamoDBIndexes.GSI3,
    partitionKey: { name: 'PK3', type: AttributeType.STRING },
    sortKey: { name: 'SK3', type: AttributeType.STRING },
  });

  return table;
}
