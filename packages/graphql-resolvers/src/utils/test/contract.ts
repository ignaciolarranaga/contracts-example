import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

import {
  Contract,
  ContractConnection,
  CreateContractInput,
  Mutation,
  MutationCreateContractArgs,
  Query,
  QueryGetContractArgs,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

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

const LIST_CONTRACTS_QUERY = /* GraphQL */ `
  query ListContractsForTest {
    listContracts {
      items {
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
  }
`;

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
    return rawResult.data.createContract;
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
    return rawResult.data.getContract;
  }
}

export async function listContracts(): Promise<ContractConnection> {
  const rawResult = (await API.graphql({
    query: LIST_CONTRACTS_QUERY,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Query>;

  if (!rawResult.data?.listContracts) {
    throw Error('It was not possible to list the required contracts');
  } else {
    return rawResult.data.listContracts;
  }
}
