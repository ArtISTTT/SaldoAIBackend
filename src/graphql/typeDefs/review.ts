
import { gql } from 'graphql-tag';

const reviewTypeDefs = gql`
  type Review {
    id: ID!
    userId: ID!
    stars: Int!
    text: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    reviews: [Review!]!
  }

  input ReviewInput {
    stars: Int!
    text: String!
  }

  type Mutation {
    addReview(input: ReviewInput!): Review!
  }
`;

export default reviewTypeDefs;
