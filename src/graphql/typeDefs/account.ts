import { gql } from 'graphql-tag';

const accountTypeDefs = gql`
  type Account {
    id: ID!
    userId: ID!
    name: String!
    type: String!
    balance: Float!
    currency: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    accounts: [Account!]!
  }

  type Mutation {
    createAccount(name: String!, type: String!, currency: String!): Account!
  }
`;

export default accountTypeDefs;