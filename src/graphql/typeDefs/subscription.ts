import { gql } from 'graphql-tag';

const subscriptionTypeDefs = gql`
  type Subscription {
    id: ID!
    userId: ID!
    planId: ID!
    startDate: String!
    endDate: String!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    mySubscription: Subscription
  }

  type Mutation {
    subscribe(planId: ID!): Subscription!
    cancelSubscription: Boolean!
  }
`;

export default subscriptionTypeDefs;