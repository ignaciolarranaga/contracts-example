import { Contract, Job, Profile, ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import {
  createContract,
  createJob,
  createProfile,
  getContract,
  init,
  loginWith,
  SAMPLE_VALID_PASSWORD,
} from 'utils/test-utilities';

init();

let sampleContractorProfile: Profile, sampleClientProfile: Profile, sampleJob: Job, sampleContract: Contract;
beforeAll(async () => {
  sampleContractorProfile = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Contractor',
    type: ProfileType.CONTRACTOR,
  });
  sampleClientProfile = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'Jane',
    lastName: 'Doe',
    profession: 'Client',
    type: ProfileType.CLIENT,
  });
  await loginWith(sampleContractorProfile.id, SAMPLE_VALID_PASSWORD);
  sampleJob = await createJob({
    description: 'Sample description',
    price: 8000,
  });
  sampleContract = await createContract({
    clientId: sampleClientProfile.id,
    jobIds: [sampleJob.id],
    terms: 'Sample terms',
  });
});

describe.only('createContract', () => {
  it('must be possible to obtain a contract of the contractor in the contract', async () => {
    // Arrange
    await loginWith(sampleContractorProfile.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await getContract(sampleContract.id);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(sampleContract.id);
    expect(result.contractorId).toBe(sampleContract.contractorId);
    expect(result.clientId).toBe(sampleContract.clientId);
    expect(result.jobIds).toEqual(sampleContract.jobIds);
    expect(result.createdAt).toBe(sampleContract.createdAt);
    expect(result.createdBy).toBe(sampleContract.createdBy);
    expect(result.lastModifiedAt).toBe(sampleContract.lastModifiedAt);
    expect(result.lastModifiedBy).toBe(sampleContract.lastModifiedBy);
  });

  it('must be possible to obtain a contract of the client in the contract', async () => {
    // Arrange
    await loginWith(sampleClientProfile.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await getContract(sampleContract.id);

    // Assert
    expect(result).toBeDefined();
  });

  it('must not be possible to return a contract when the contractor is not the one in the contract', async () => {});

  it('must not be possible to return a contract when the client is not the one in the contract', async () => {});
});
