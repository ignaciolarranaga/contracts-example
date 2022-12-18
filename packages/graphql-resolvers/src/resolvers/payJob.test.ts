import { Job, Profile, ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import { init, loginWith, SAMPLE_VALID_PASSWORD } from 'utils/test';
import { createContract } from 'utils/test/contract';
import { createJob, payJob } from 'utils/test/job';
import { createProfile, makeProfileDeposit } from 'utils/test/profile';

init();

async function createNewSampleContract(): Promise<{
  sampleJob1: Job,
  sampleJob2: Job,
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

  return { sampleJob1, sampleJob2 };
}

describe('payJob', () => {
  it('must be able to pay a job when having funds', async () => {
    // Arrange
    const { sampleJob1 } = await createNewSampleContract();
    await makeProfileDeposit({ amount: 2000 });

    // Act
    const job = await payJob(sampleJob1.id);

    // Assert
    expect(job).toBeDefined();
    if (job) {
      expect(job.paid).toBe(true);
      expect(job.paymentDate).toBeDefined();
    }
  });
});
