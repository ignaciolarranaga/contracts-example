# GraphQL Queries

The following is a list of sample graphql queries that you can use

## Create a Profile
```
mutation CreateAProfile {
  createProfile(input: {firstName: "John", lastName: "Doe", profession: "Engineer", type: CONTRACTOR, id: "john", password: "-TestUser1"}) {
    id
    firstName
    lastName
    profession
    type
    balance
  }
}
```

## Create a contract
```
mutation CreateAContract {
  createContract(input: {terms: "None"}) {
    id
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