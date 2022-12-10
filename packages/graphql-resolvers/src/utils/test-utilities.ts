import { Amplify } from '@aws-amplify/core';
import { Auth, CognitoUser } from '@aws-amplify/auth';

import config from '../deployment-config.json';

export function init() {
  Amplify.configure({ ...config });
}

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
