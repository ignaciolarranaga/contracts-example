import {
  Contract,
  Job,
  Profile,
  ProfileType,
} from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import {
  init,
  loginWith,
  SAMPLE_VALID_PASSWORD,
} from 'utils/test';
import {
  createContract,
  listContracts,
} from 'utils/test/contract';
import { createJob } from 'utils/test/job';
import { createProfile } from 'utils/test/profile';

init();

let sampleContractorProfile1: Profile,
  sampleContractorProfile2: Profile,
  sampleClientProfile1: Profile,
  sampleClientProfile2: Profile,
  sampleJob1: Job,
  sampleJob2: Job,
  sampleContract1: Contract,
  sampleContract2: Contract;
beforeAll(async () => {
  sampleContractorProfile1 = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Contractor',
    type: ProfileType.CONTRACTOR,
  });
  sampleContractorProfile2 = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'Jess',
    lastName: 'Doe',
    profession: 'Contractor',
    type: ProfileType.CONTRACTOR,
  });
  sampleClientProfile1 = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'Jane',
    lastName: 'Doe',
    profession: 'Client',
    type: ProfileType.CLIENT,
  });
  sampleClientProfile2 = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'Jennifer',
    lastName: 'Doe',
    profession: 'Client',
    type: ProfileType.CLIENT,
  });

  // Contractor/Client 1
  await loginWith(sampleClientProfile1.id, SAMPLE_VALID_PASSWORD);
  sampleJob1 = await createJob({
    description: 'Sample job 1',
    price: 8000,
  });
  sampleContract1 = await createContract({
    contractorId: sampleContractorProfile1.id,
    jobIds: [sampleJob1.id],
    terms: 'Sample terms',
  });

  // Contractor/Client 2
  await loginWith(sampleClientProfile2.id, SAMPLE_VALID_PASSWORD);
  sampleJob2 = await createJob({
    description: 'Sample job 2',
    price: 8000,
  });
  sampleContract2 = await createContract({
    contractorId: sampleContractorProfile2.id,
    jobIds: [sampleJob2.id],
    terms: 'Sample terms',
  });
});

describe('listContracts', () => {
  it('must list only the contracts of the contractor 1 when called by the contractor 1', async () => {
    // Arrange
    await loginWith(sampleContractorProfile1.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await listContracts();

    // Assert
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    if (result.items) {
      expect(result.items).toHaveLength(1);
      if (result.items.length === 1) {
        expect(result.items[0].id).toBe(sampleContract1.id);
      }
    }
  });

  it('must list only the contracts of the client 1 when called by the client 1', async () => {
    // Arrange
    await loginWith(sampleClientProfile1.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await listContracts();

    // Assert
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    if (result.items) {
      expect(result.items).toHaveLength(1);
      if (result.items.length === 1) {
        expect(result.items[0].id).toBe(sampleContract1.id);
      }
    }
  });

  it('must list only the contracts of the contractor 2 when called by the contractor 2', async () => {
    // Arrange
    await loginWith(sampleContractorProfile2.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await listContracts();

    // Assert
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    if (result.items) {
      expect(result.items).toHaveLength(1);
      if (result.items.length === 1) {
        expect(result.items[0].id).toBe(sampleContract2.id);
      }
    }
  });

  it('must list only the contracts of the client 2 when called by the client 2', async () => {
    // Arrange
    await loginWith(sampleClientProfile2.id, SAMPLE_VALID_PASSWORD);

    // Act
    const result = await listContracts();

    // Assert
    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    if (result.items) {
      expect(result.items).toHaveLength(1);
      if (result.items.length === 1) {
        expect(result.items[0].id).toBe(sampleContract2.id);
      }
    }
  });
});
