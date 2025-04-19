import { gql } from 'graphql-tag';

const userTypeDefs = gql`
  type User {
    _id: ID!
    id: ID!
    email: String!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Me {
    user: User
    account: Account
  }

  type Query {
    me: Me
    getUser(id: ID!): User
  }

  type Mutation {
    register(email: String!, name: String!, password: String!): User
    login(email: String!, password: String!): String
  }
`;

export default userTypeDefs;