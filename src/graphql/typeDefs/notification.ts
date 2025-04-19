import { gql } from 'graphql-tag';

const notificationTypeDefs = gql`
  type Notification {
    id: ID!
    userId: ID!
    type: String!
    message: String!
    read: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    notifications: [Notification!]!
  }

  type Mutation {
    markNotificationRead(id: ID!): Boolean!
  }
`;

export default notificationTypeDefs;