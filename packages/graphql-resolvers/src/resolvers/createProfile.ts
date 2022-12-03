import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';

/**
 * Creates a new profile
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 * @returns The profile created
 */
 export default async function createProfile(event: AppSyncResolverEvent<any>,
  context: Context, callback: Callback): Promise<any> {
  return null;
}