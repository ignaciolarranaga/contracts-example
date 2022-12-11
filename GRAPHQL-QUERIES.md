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
**Pre-requisite**: Login with john.
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
**Pre-requisite**: Adjust the jobIds below to match the ones you just created.
```
mutation CreateAContract {
  createContract(input: {clientId: "jane", jobIds: ["4f887f9e-caa0-431a-afe3-61d3d88beb59", "6e710083-3a9e-4616-809b-dc82ce0e28e6"], terms: "None"}) {
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