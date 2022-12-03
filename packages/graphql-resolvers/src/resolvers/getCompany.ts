import { AppSyncResolverEvent, Context, Callback } from 'aws-lambda';
import { Types } from 'mongoose';
import { getMongooseConnection, Models } from 'utils/mongoose';

import { Company } from '@ignaciolarranaga/graphql-model';

export default async function getCompany(
  event: AppSyncResolverEvent<any>,
  context: Context,
  callback: Callback
): Promise<Company | undefined> {
  // @see https://stackoverflow.com/questions/17223517/mongoose-casterror-cast-to-objectid-failed-for-value-object-object-at-path
  if (!Types.ObjectId.isValid(event.arguments.id)) {
    return undefined;
  }

  const connection = await getMongooseConnection(context, callback);
  const companyModel = connection.model<Company>(Models.Company);

  const company = await companyModel.findById(event.arguments.id).exec();

  console.log('Company found', JSON.stringify(company));

  return company?.toObject({ virtuals: true }); // spellchecker: disable-line
}
