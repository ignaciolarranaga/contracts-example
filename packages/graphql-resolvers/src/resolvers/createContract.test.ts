import { ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
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

describe.only('createContract', () => {
  it.only('must be possible to obtain a contract of the contractor in the contract', async () => {
    const contractorProfile = await createProfile({
      id: uuid(),
      password: SAMPLE_VALID_PASSWORD,
      firstName: 'John',
      lastName: 'Doe',
      profession: 'Contractor',
      type: ProfileType.CONTRACTOR,
    });
    const clientProfile = await createProfile({
      id: uuid(),
      password: SAMPLE_VALID_PASSWORD,
      firstName: 'Jane',
      lastName: 'Doe',
      profession: 'Client',
      type: ProfileType.CLIENT,
    });
    await loginWith(contractorProfile.id, SAMPLE_VALID_PASSWORD);
    const job = await createJob({
      description: 'Sample description',
      price: 8000,
    });
    const contract = await createContract({
      clientId: clientProfile.id,
      jobIds: [job.id],
      terms: 'Sample terms',
    });

    const result = await getContract(contract.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(contract.id);
    expect(result.contractorId).toBe(contract.contractorId);
    expect(result.clientId).toBe(contract.clientId);
    expect(result.jobIds).toEqual(contract.jobIds);
    expect(result.createdAt).toBe(contract.createdAt);
    expect(result.createdBy).toBe(contract.createdBy);
    expect(result.lastModifiedAt).toBe(contract.lastModifiedAt);
    expect(result.lastModifiedBy).toBe(contract.lastModifiedBy);
  });

  it('must be possible to obtain a contract of the client in the contract', async () => {});

  it('must not be possible to return a contract when the contractor is not the one in the contract', async () => {});

  it('must not be possible to return a contract when the client is not the one in the contract', async () => {});
});
