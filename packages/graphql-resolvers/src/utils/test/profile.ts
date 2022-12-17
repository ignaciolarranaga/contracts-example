import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

import {
  CreateProfileInput,
  MakeProfileDepositInput,
  Mutation,
  MutationCreateProfileArgs,
  MutationMakeProfileDepositArgs,
  Profile,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line

const CREATE_PROFILE_MUTATION = /* GraphQL */ `
  mutation CreateProfileForTest($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      firstName
      lastName
      profession
      type
      balance
      amountDue
      maxDeposit
    }
  }
`;

const MAKE_PROFILE_DEPOSIT_MUTATION = /* GraphQL */ `
  mutation MakeProfileDepositForTest($input: MakeProfileDepositInput!) {
    makeProfileDeposit(input: $input) {
      id
      firstName
      lastName
      profession
      type
      balance
      amountDue
      maxDeposit
    }
  }
`;

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

export async function makeProfileDeposit(
  input: MakeProfileDepositInput
): Promise<Profile> {
  const rawResult = (await API.graphql({
    query: MAKE_PROFILE_DEPOSIT_MUTATION,
    variables: { input } as MutationMakeProfileDepositArgs,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
  })) as GraphQLResult<Mutation>;

  if (!rawResult.data?.makeProfileDeposit) {
    throw Error(`It was not possible to make the required deposit ${input}`);
  } else {
    return rawResult.data.makeProfileDeposit;
  }
}
