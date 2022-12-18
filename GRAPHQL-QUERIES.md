# GraphQL Queries

The following is a list of sample graphql queries that you can use

## Create Sample Profiles
```
mutation CreateSampleProfiles {
  contractor: createProfile(input: {firstName: "John", lastName: "Doe", profession: "Project Manager", type: CLIENT, id: "john", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }

  client: createProfile(input: {firstName: "Jane", lastName: "Doe", profession: "Engineer", type: CONTRACTOR, id: "jane", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }
}
```

## Get Profile
**Pre-requisite**: Login with john.
```
query GetProfile {
  getProfile(id: "john") {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }
}
```

## Create Jobs
**Pre-requisite**: Login with john.
```
mutation CreateSampleJobs {
  job1: createJob(input: {description: "Develop the PoC", price: 8000}) {
    id
    description
    clientId
    contractorId
    contractId
    price
    paid
    paymentDate
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }

  job2: createJob(input: {description: "Add Integration Tests", price: 2000}) {
    id
    description
    clientId
    contractorId
    contractId
    price
    paid
    paymentDate
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }
}
```

## Create a contract
**Pre-requisites**:
* Login with john.
* Adjust the jobIds below to match the ones you just created.
```
mutation CreateAContract {
  createContract(input: {contractorId: "jane", jobIds: ["d6a701ad-f8e6-491c-b6e8-557fb9f5a022", "1acab9a9-0cb5-4841-9eb5-da69cf3993fd"], terms: "None"}) {
    id
    clientId
    contractorId
    jobIds
    terms
    status
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }
}
```

## List contracts
**Pre-requisite**: Login with john or jane.
```
query ListContracts {
  listContracts(filter: { unterminated: true }) {
    items {
      id
      clientId
      contractorId
      terms
      status
      jobIds
      createdAt
      createdBy
      lastModifiedAt
      lastModifiedBy
    }
  }
}
```

## Get a contract
**Pre-requisites**:
* Login with john.
* Adjust the id below to match the one you just created.
```
query GetAContract {
  getContract(id: "6447ba79-9616-44ee-aa86-294372f20517") {
    createdBy
    createdAt
    id
    lastModifiedAt
    lastModifiedBy
    status
    terms
  }
}
```

## List unpaid jobs
**Pre-requisite**: Login with john or jane.
```
query ListUnpaidJobs {
  listJobs(filter: {paid: false}) {
    items {
      id
      description
      clientId
      price
      paid
      paymentDate
      createdBy
      createdAt
      lastModifiedBy
      lastModifiedAt
    }
  }
}
```

## Make a deposit
**Pre-requisite**: Login with john.
```
mutation MakeADeposit {
  makeProfileDeposit(input: {amount: 2500}) {
    id
    firstName
    lastName
    profession
    type
    balance
  }
}
```

## Pay for a Job
**Pre-requisites**:
* Login with john and made a deposit of almost 2000.
* Adjust the jobId below to match the priced on 2000.
```
mutation PayJob {
  payJob(id: "c3841675-8c30-4724-a4f8-83533d9323d7") {
    id
    description
    clientId
    contractorId
    price
    paid
    paymentDate
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }
}
```