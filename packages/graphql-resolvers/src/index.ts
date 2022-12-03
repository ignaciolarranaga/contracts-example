import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';

import errorCodes from 'error-codes';
import createProfile from 'resolvers/createProfile';

const resolvers: {
  [type: string]: {
    [field: string]: (
      event: AppSyncResolverEvent<any>,
      context: Context,
      callback: Callback
    ) => any;
  };
} = {
  Mutation: {
    createProfile,
  },
};

/**
 * @param event The AppSync event received
 * @param context The context of the invocation
 * @param callback The invocation callback to report errors
 */
export async function handler(
  event: AppSyncResolverEvent<any>,
  context: Context,
  callback: Callback
) {
  //console.log('Event received', JSON.stringify(event));

  const typeHandler = resolvers[event.info.parentTypeName];
  if (typeHandler) {
    const resolver = typeHandler[event.info.fieldName];
    if (resolver) {
      try {
        return await resolver(event, context, callback);
      } catch (error) {
        callback(String(error));
      }
    } else {
      callback('Error: ' + errorCodes.FIELD_RESOLVER_NOT_FOUND);
    }
  } else {
    callback('Error: ' + errorCodes.TYPE_RESOLVER_NOT_FOUND);
  }
}
