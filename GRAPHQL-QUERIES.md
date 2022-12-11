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
  createContract(input: {clientId: "jane", jobIds: ["dfeb3823-506e-4c7f-b101-31eec86019e9", "5ec222bb-32b5-40b6-a8c2-d78ae5c9e064"], terms: "None"}) {
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
**Pre-requisite**: Adjust the id below to match the one you just created.
```
query GetAContract {
  getContract(id: "7ae5051b-495c-4426-a3aa-487017251ad7") {
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