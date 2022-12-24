import { DynamoDBItem } from './DynamoDBItem';

export interface JobDynamoDBItem extends DynamoDBItem {
  clientFullName?: string;
}
