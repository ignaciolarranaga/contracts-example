import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

import {
  CreateJobInput,
  Job,
  Mutation,
  MutationCreateJobArgs,
  MutationPayJobArgs,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const CREATE_JOB_MUTATION = /* GraphQL */ `
  mutation CreateJobForTest($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      description
      contractorId
      price
      paid
      paymentDate
      createdBy
      createdAt
      lastModifiedBy
      lastModifiedAt
    }
  }
`;

const PAY_JOB_MUTATION = /* GraphQL */ `
  mutation PayJobForTest($id: ID!) {
    payJob(id: $id) {
      id
      description
      contractorId
      price
      paid
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

export async function payJob(id: string): Promise<Job> {
  const rawResult = (await API.graphql({
    query: PAY_JOB_MUTATION,
    variables: { id } as MutationPayJobArgs,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Mutation>;

  if (!rawResult.data?.payJob) {
    throw Error(`It was not possible to pay the required job ${id}`);
  } else {
    return rawResult.data.payJob;
  }
}
