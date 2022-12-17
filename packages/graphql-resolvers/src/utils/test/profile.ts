import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';

import {
  CreateProfileInput,
  Mutation,
  MutationCreateProfileArgs,
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
