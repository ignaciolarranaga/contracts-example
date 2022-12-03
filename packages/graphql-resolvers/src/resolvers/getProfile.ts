import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';

/**
 * Retrieves a profile by id
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 * @returns The profile retrieved
 */
 export async function getProfile(event: AppSyncResolverEvent<any>,
  context: Context, callback: Callback): Promise<any> {
  return null;
}