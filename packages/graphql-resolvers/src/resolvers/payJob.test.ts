import { Contract, Job, Profile, ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import { init, loginWith, logout, SAMPLE_VALID_PASSWORD } from 'utils/test';
import { createContract } from 'utils/test/contract';
import { createJob, payJob } from 'utils/test/job';
import { createProfile, getProfile, makeProfileDeposit } from 'utils/test/profile';

init();

async function createNewSampleContract(): Promise<{
  sampleJob1: Job,
  sampleJob2: Job,
  sampleContract: Contract,
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
  const sampleContract = await createContract({
    contractorId: sampleContractorProfile.id,
    jobIds: [sampleJob1.id, sampleJob2.id],
    terms: 'Sample terms',
  });

  return { sampleJob1, sampleJob2, sampleContract };
}

describe('payJob', () => {
  it('must be able to pay a job when having funds', async () => {
    // Arrange
    const { sampleJob1, sampleJob2, sampleContract } = await createNewSampleContract();
    await makeProfileDeposit({ amount: sampleJob1.price });

    // Act
    const job = await payJob(sampleJob1.id);

    // Assert
    expect(job).toBeDefined();
    if (job) {
      expect(job.paid).toBe(true);
      expect(job.paymentDate).toBeDefined();

      const clientProfile = await getProfile(sampleContract.clientId);
      expect(clientProfile).toBeDefined();
      if (clientProfile) {
        expect(clientProfile.balance).toBe(0);
        expect(clientProfile.amountDue).toBe(sampleJob2.price);
        expect(clientProfile.maxDeposit).toBe(sampleJob2.price / 4);
      }

      // The profiles can only be retrieved by the same user
      await loginWith(sampleContract.contractorId, SAMPLE_VALID_PASSWORD);
      const contractorProfile = await getProfile(sampleContract.contractorId);
      expect(contractorProfile).toBeDefined();
      if (contractorProfile) {
        expect(contractorProfile.balance).toBe(sampleJob1.price);
        expect(contractorProfile.amountDue).toBe(0);
        expect(contractorProfile.maxDeposit).toBe(0);
      }
    }
  });
});
