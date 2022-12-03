import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';
import { Types } from 'mongoose';
import { getMongooseConnection, Models } from 'utils/mongoose';

import { Location } from '@ignaciolarranaga/graphql-model';

export default async function getCompany(
  event: AppSyncResolverEvent<any>,
  context: Context,
  callback: Callback
): Promise<Location | undefined> {
  // @see https://stackoverflow.com/questions/17223517/mongoose-casterror-cast-to-objectid-failed-for-value-object-object-at-path
  if (!Types.ObjectId.isValid(event.arguments.id)) {
    return undefined;
  }

  const connection = await getMongooseConnection(context, callback);
  const locationModel = connection.model<Location>(Models.Location);

  const location = await locationModel.findById(event.arguments.id).exec();

  console.log('Location found', JSON.stringify(location));

  return location?.toObject({ virtuals: true }); // spellchecker: disable-line
}
