import { API, GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import {
  CreateProfileInput,
  Mutation,
  MutationCreateProfileArgs,
  ProfileType,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import { init } from 'utils/test';

const CREATE_A_PROFILE_QUERY = /* GraphQL */ `
  mutation CreateProfiles($input: CreateProfileInput!) {
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

init();

describe('createProfile', () => {
  test('must be able to create a profile', async () => {
    const input: CreateProfileInput = {
      id: uuid(),
      password: '-Secret1',
      firstName: 'John',
      lastName: 'Doe',
      profession: 'Project Manager',
      type: ProfileType.CONTRACTOR,
    };
    const rawResult = (await API.graphql({
      query: CREATE_A_PROFILE_QUERY,
      variables: { input } as MutationCreateProfileArgs,
      authMode: GRAPHQL_AUTH_MODE.API_KEY,
    })) as GraphQLResult<Mutation>;

    const profile = rawResult.data!.createProfile;

    expect(profile).toBeDefined();
    expect(profile?.id).toBe(input.id);
    expect(profile?.firstName).toBe(input.firstName);
    expect(profile?.lastName).toBe(input.lastName);
    expect(profile?.profession).toBe(input.profession);
    expect(profile?.type).toBe(input.type);
    expect(profile?.balance).toBe(0);
  });
});
