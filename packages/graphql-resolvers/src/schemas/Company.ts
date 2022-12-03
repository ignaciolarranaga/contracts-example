import { Schema } from 'mongoose';
import { Company } from '@ignaciolarranaga/graphql-model';

const CompanySchema = new Schema<Company>({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

CompanySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export default CompanySchema;
