# GraphQL Queries

The following is a list of sample graphql queries that you can use

## Create a Profile
```
mutation CreateProfiles {
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

## Create a Job
```
mutation CreateAJob {
  job1: createJob(input: {description: "Develop the PoC", price: 8000}) {
    id
    description
    contractorId
    paid
    price
    paymentDate
    lastModifiedBy
    lastModifiedAt
    createdBy
    createdAt
  }

  job2: createJob(input: {description: "Add Integration Tests", price: 2000}) {
    id
    description
    contractorId
    paid
    price
    paymentDate
    lastModifiedBy
    lastModifiedAt
    createdBy
    createdAt
  }
}

```

## Create a contract
```
mutation CreateAContract {
  createContract(input: {clientId: "jane", jobId: "1", terms: "None"}) {
    id
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