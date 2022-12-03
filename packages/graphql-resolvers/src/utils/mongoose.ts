import { Callback, Context } from 'aws-lambda';
import { createConnection, Connection } from 'mongoose';

import CompanySchema from 'schemas/Company';
import LocationSchema from 'schemas/Location';
import errorCodes from 'error-codes';

let connection: Connection | null = null;

export enum Models {
  Company = 'Company',
  Location = 'Location',
}

const schemas = {
  [Models.Company]: CompanySchema,
  [Models.Location]: LocationSchema,
};

export async function getMongooseConnection(
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: Callback
): Promise<Connection> {
  const uri = process.env.MONGO_DATABASE_URI;
  if (!uri) {
    throw new Error(errorCodes.UNDEFINED_MONGO_DATABASE_URI);
  }

  // Make sure to add this so you can re-use `connection` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  // Because `connection` is in the global scope, Lambda may retain it between
  // function calls thanks to `callbackWaitsForEmptyEventLoop`.
  // This means your Lambda function doesn't have to go through the
  // potentially expensive process of connecting to MongoDB every time.
  if (connection == null) {
    connection = createConnection(uri, {
      // and tell the MongoDB driver to not wait more than 5 seconds
      // before erroring out if it isn't connected
      serverSelectionTimeoutMS: 5000,
    });

    // `await`ing connection after assigning to the `connection` variable
    // to avoid multiple function calls creating new connections
    await connection.asPromise();

    createModels(connection);
  }

  return connection;
}

function createModels(connection: Connection) {
  for (const model of Object.values(Models)) {
    connection.model(model, schemas[model]);
  }
}
