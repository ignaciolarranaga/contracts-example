import { Job, Profile, ProfileType } from '@ignaciolarranaga/graphql-model'; // cspell:disable-line
import { v4 as uuid } from 'uuid';

import { init, loginWith, SAMPLE_VALID_PASSWORD } from 'utils/test';
import { createContract } from 'utils/test/contract';
import { createJob } from 'utils/test/job';
import { createProfile, makeProfileDeposit } from 'utils/test/profile';

init();

async function createNewSampleContract(): Promise<{
  sampleClientProfile: Profile;
  sampleJob: Job;
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
  const sampleJob = await createJob({
    description: 'Sample description',
    price: 8000,
  });
  const sampleContract = await createContract({
    contractorId: sampleContractorProfile.id,
    jobIds: [sampleJob.id],
    terms: 'Sample terms',
  });

  return { sampleClientProfile, sampleJob };
}

describe('makeProfileDeposit', () => {
  it('must allow below 25% amountDue deposits', async () => {
    // Arrange
    const { sampleJob } = await createNewSampleContract();

    // Act
    await makeProfileDeposit({ amount: sampleJob.price / 5 });
  });

  it('must NOT allow over 25% amountDue deposits', async () => {
    // Arrange
    const { sampleJob } = await createNewSampleContract();

    try {
      // Act
      await makeProfileDeposit({ amount: sampleJob.price / 3 });
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error: any) {
      // Assert
      expect(error.errors[0].message).toBe(
        'CAN_NOT_MAKE_DEPOSITS_OVER_25_PERCENT_OF_AMOUNT_DUE: ' +
        'You can not make a deposit that exceeds 25% of your current amount due ' +
        `(max deposit $${sampleJob.price / 4})`
      );
    }
  });
});
