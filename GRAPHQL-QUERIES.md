# GraphQL Queries

The following is a list of sample graphql queries that you can use

## Create Sample Profiles
```
mutation CreateSampleProfiles {
  client: createProfile(input: {firstName: "John", lastName: "Doe", profession: "Business Manager", type: CLIENT, id: "john", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }

  contractor1: createProfile(input: {firstName: "Jane", lastName: "Doe", profession: "Software Engineer", type: CONTRACTOR, id: "jane", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }

  contractor2: createProfile(input: {firstName: "Jess", lastName: "Doe", profession: "Tester", type: CONTRACTOR, id: "jess", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
    amountDue
  }

  contractor3: createProfile(input: {firstName: "Jennifer", lastName: "Doe", profession: "Project Manager", type: CONTRACTOR, id: "jennifer", password: "-TestUser1"}) {
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
  createContract(input: {contractorId: "jane", jobIds: ["cf046741-f176-4b14-8407-26a73f9aa622", "8e90f8c1-06fb-43f3-bc54-b6907466ec8c"], terms: "None"}) {
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
  payJob(id: "9fc0146f-6c53-490e-8707-03d9be0f0b1a") {
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

## Get best profession
**Pre-requisite**: You need to be using the API KEY
```
query GetBestProfession {
  bestProfession(filter: {
    start: "2022-01-01T00:00:00.000Z",
    end:"2022-12-31T23:59:59.999Z"
  })
}
```

## Get best profession
**Pre-requisite**: You need to be using the API KEY
```
query GetBestClients {
  bestClients(filter: {
    start: "2022-01-01T00:00:00.000Z",
    end:"2022-12-31T23:59:59.999Z"
  })
}
```