# GraphQL Queries

The following is a list of sample graphql queries that you can use

## Create Sample Profiles
```
mutation CreateSampleProfiles {
  contractor: createProfile(input: {firstName: "John", lastName: "Doe", profession: "Project Manager", type: CONTRACTOR, id: "john", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
  }

  client: createProfile(input: {firstName: "Jane", lastName: "Doe", profession: "Engineer", type: CLIENT, id: "jane", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
  }
}
```

## Create Jobs
```
mutation CreateSampleJobs {
  job1: createJob(input: {description: "Develop the PoC", price: 8000}) {
    id
    description
    contractorId
    paid
    price
    paymentDate
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }

  job2: createJob(input: {description: "Add Integration Tests", price: 2000}) {
    id
    description
    contractorId
    paid
    price
    paymentDate
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }
}

```

## Create a contract
```
mutation CreateAContract {
  createContract(input: {clientId: "jane", jobIds: ["fe75d4e6-debe-46c2-8e36-26df0a532759", "5dddda8c-30f2-454d-9cc9-3c7079d61876"], terms: "None"}) {
    id
    contractorId
    clientId
    jobIds
    createdBy
    createdAt
    lastModifiedBy
    lastModifiedAt
  }
}
```

## List contracts
```
query ListContracts {
  listContracts {
    items {
      id
    }
  }
}
```

## Get a contract
```
query GetAContract {
  getContract(id: "01GKCQQ015V4NG6A1Q10H93WG2") {
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