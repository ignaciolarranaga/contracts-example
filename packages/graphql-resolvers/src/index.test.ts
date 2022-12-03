import { AppSyncResolverEvent, Context } from 'aws-lambda';

import createProfile from 'resolvers/createProfile';
import { handler } from '.';
import errorCodes from 'error-codes';

// https://instil.co/blog/typescript-testing-tips-mocking-functions-with-jest/
export function mockFunction<T extends (...args: any[]) => any>(
  fn: T
): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

jest.mock('./resolvers/createProfile.ts');
const createProfileHandlerMock = mockFunction(createProfile);

// The test does not need to have a maximum number of lines
/* eslint max-lines-per-function: ["off"] */
describe('handler', () => {
  const SAMPLE_HANDLER_INPUT_EVENT = {
    info: {
      fieldName: 'createProfile',
      parentTypeName: 'Mutation',
      variables: {},
    },
    arguments: {
      input: {
        firstName: 'John',
        lastName: 'Doe',
        profession: 'Engineer',
        type: 'CONTRACTOR'
      },
    },
  } as AppSyncResolverEvent<any>;
  const SAMPLE_CONTEXT = {} as Context;

  it('should call the handler when asked to do so', () => {
    const callbackMock = jest.fn();

    handler(SAMPLE_HANDLER_INPUT_EVENT, SAMPLE_CONTEXT, callbackMock);

    expect(createProfileHandlerMock.mock.calls.length).toBe(1);
  });

  it('should callback with the correct error when the type is not found', () => {
    const SAMPLE_INPUT_EVENT = {
      ...SAMPLE_HANDLER_INPUT_EVENT,
      info: {
        ...SAMPLE_HANDLER_INPUT_EVENT.info,
        parentTypeName: 'UNKNOWN',
      },
    } as AppSyncResolverEvent<any>;
    const callbackMock = jest.fn();

    handler(SAMPLE_INPUT_EVENT, SAMPLE_CONTEXT, callbackMock);

    expect(callbackMock).toHaveBeenCalledWith(
      `Error: ${errorCodes.TYPE_RESOLVER_NOT_FOUND}`
    );
  });

  it('should callback with the correct error when the field is not found', () => {
    const SAMPLE_INPUT_EVENT = {
      ...SAMPLE_HANDLER_INPUT_EVENT,
      info: {
        ...SAMPLE_HANDLER_INPUT_EVENT.info,
        fieldName: 'UNKNOWN',
      },
    } as AppSyncResolverEvent<any>;
    const callbackMock = jest.fn();

    handler(SAMPLE_INPUT_EVENT, SAMPLE_CONTEXT, callbackMock);

    expect(callbackMock).toHaveBeenCalledWith(
      `Error: ${errorCodes.FIELD_RESOLVER_NOT_FOUND}`
    );
  });

  it('should callback with the correct error when the resolver found an error', () => {
    const callbackMock = jest.fn();
    const SAMPLE_ERROR = 'Sample unexpected error';
    createProfileHandlerMock.mockImplementation(() => {
      throw new Error(SAMPLE_ERROR);
    });

    handler(SAMPLE_HANDLER_INPUT_EVENT, SAMPLE_CONTEXT, callbackMock);

    expect(callbackMock).toHaveBeenCalledWith(`Error: ${SAMPLE_ERROR}`);
  });
});
