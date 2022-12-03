import { Schema } from 'mongoose';
import { Location } from '@ignaciolarranaga/graphql-model';

const LocationSchema = new Schema<Location>({
  timezone: { type: String, required: true },
});

LocationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default LocationSchema;
