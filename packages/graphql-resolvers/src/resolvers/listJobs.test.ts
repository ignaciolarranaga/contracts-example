import { Job, ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import { init, loginWith, SAMPLE_VALID_PASSWORD } from 'utils/test';
import { createContract } from 'utils/test/contract';
import { createJob, listJobs, payJob } from 'utils/test/job';
import { createProfile, makeProfileDeposit } from 'utils/test/profile';

init();

async function createNewSampleContractAndPaidSampleJob1(): Promise<{
  sampleJob1: Job;
  sampleJob2: Job;
}> {
  // Arrange
  const sampleContractorProfile = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'John',
    lastName: 'Doe',
    profession: 'Contractor',
    type: ProfileType.CONTRACTOR,
  });
  const sampleClientProfile = await createProfile({
    id: uuid(),
    password: SAMPLE_VALID_PASSWORD,
    firstName: 'Jane',
    lastName: 'Doe',
    profession: 'Client',
    type: ProfileType.CLIENT,
  });
  // The jobs and contracts can only be created by clients
  await loginWith(sampleClientProfile.id, SAMPLE_VALID_PASSWORD);
  const sampleJob1 = await createJob({
    description: 'Sample job 2k',
    price: 2000,
  });
  const sampleJob2 = await createJob({
    description: 'Sample job 8k',
    price: 8000,
  });
  await createContract({
    contractorId: sampleContractorProfile.id,
    jobIds: [sampleJob1.id, sampleJob2.id],
    terms: 'Sample terms',
  });

  await makeProfileDeposit({ amount: sampleJob1.price });

  await payJob(sampleJob1.id);

  return { sampleJob1, sampleJob2 };
}

describe('listJobs', () => {
  it('must retrieve the paid jobs correctly', async () => {
    // Arrange
    const { sampleJob1 } = await createNewSampleContractAndPaidSampleJob1();

    // Act
    const result = await listJobs({ paid: true });

    expect(result).toBeDefined();
    if (result) {
      expect(result.items).toBeDefined();
      if (result.items) {
        expect(result.items[0].id).toBe(sampleJob1.id);
      }
    }
  });

  it('must retrieve the unpaid jobs correctly', async () => {
    // Arrange
    const { sampleJob2 } = await createNewSampleContractAndPaidSampleJob1();

    // Act
    const result = await listJobs({ paid: false });

    expect(result).toBeDefined();
    if (result) {
      expect(result.items).toBeDefined();
      if (result.items) {
        expect(result.items[0].id).toBe(sampleJob2.id);
      }
    }
  });
});
