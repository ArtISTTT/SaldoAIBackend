import { gql } from 'graphql-tag';

const subscriptionPlanTypeDefs = gql`
  type SubscriptionPlan {
    id: ID!
    name: String!
    price: Float!
    period: String!
    features: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    subscriptionPlans: [SubscriptionPlan!]!
  }
`;

export default subscriptionPlanTypeDefs;