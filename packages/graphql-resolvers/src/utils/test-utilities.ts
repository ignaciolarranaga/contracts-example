import { Amplify } from '@aws-amplify/core';
import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import { Auth, CognitoUser } from '@aws-amplify/auth';

import {
  Contract,
  CreateContractInput,
  CreateJobInput,
  CreateProfileInput,
  Job,
  Mutation,
  MutationCreateContractArgs,
  MutationCreateJobArgs,
  MutationCreateProfileArgs,
  Profile,
  Query,
  QueryGetContractArgs,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

import config from '../deployment-config.json';

export function init() {
  Amplify.configure({ ...config });
}

export const SAMPLE_VALID_PASSWORD = '-TestUser1';

const CREATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation CreateProfileForTest($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      firstName
      lastName
      profession
      type
      balance
    }
  }
`;

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

const CREATE_CONTRACT_MUTATION = /* GraphQL */ `
  mutation CreateContractForTest($input: CreateContractInput!) {
    createContract(input: $input) {
      id
      contractorId
      clientId
      jobIds
      createdBy
      createdAt
      lastModifiedBy
      lastModifiedAt
    }
  }
`;

const GET_CONTRACT_QUERY = /* GraphQL */ `
  query GetContractForTest($id: ID!) {
    getContract(id: $id) {
      id
      contractorId
      clientId
      jobIds
      createdBy
      createdAt
      lastModifiedBy
      lastModifiedAt
    }
  }
`;

export async function loginWith(username: string, password: string) {
  let user: CognitoUser | any;
  try {
    user = await Auth.currentAuthenticatedUser();
  } catch (error) {
    // Ignoring we just need to login
  }
  if (user?.username !== username) {
    user = await Auth.signIn(username, password);
  }

  return user;
}

export async function createProfile(
  input: CreateProfileInput
): Promise<Profile> {
  const rawResult = (await API.graphql({
    query: CREATE_PROFILE_MUTATION,
    variables: { input } as MutationCreateProfileArgs,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })) as GraphQLResult<Mutation>;

  if (!rawResult.data?.createProfile) {
    throw Error(`It was not possible to create the required profile ${input}`);
  } else {
    return rawResult.data.createProfile;
  }
}

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

export async function createContract(
  input: CreateContractInput
): Promise<Contract> {
  const rawResult = (await API.graphql({
    query: CREATE_CONTRACT_MUTATION,
    variables: { input } as MutationCreateContractArgs,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Mutation>;

  if (!rawResult.data?.createContract) {
    throw Error(`It was not possible to create the required contract ${input}`);
  } else {
    return rawResult.data?.createContract;
  }
}

export async function getContract(id: string): Promise<Contract> {
  const rawResult = (await API.graphql({
    query: GET_CONTRACT_QUERY,
    variables: { id } as QueryGetContractArgs,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Query>;

  if (!rawResult.data?.getContract) {
    throw Error(`It was not possible to retrieve the required contract ${id}`);
  } else {
    return rawResult.data?.getContract;
  }
}
