import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

import {
  CreateJobInput,
  Job,
  Mutation,
  MutationCreateJobArgs,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const CREATE_JOB_MUTATION = /* GraphQL */ `
  mutation CreateJobForTest($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      description
      contractorId
      paid
      price
      paymentDate
      createdBy
      createdAt
      lastModifiedBy
      lastModifiedAt
    }
  }
`;

export async function createJob(input: CreateJobInput): Promise<Job> {
  const rawResult = (await API.graphql({
    query: CREATE_JOB_MUTATION,
    variables: { input } as MutationCreateJobArgs,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Mutation>;

  if (!rawResult.data?.createJob) {
    throw Error(`It was not possible to create the required job ${input}`);
  } else {
    return rawResult.data.createJob;
  }
}
