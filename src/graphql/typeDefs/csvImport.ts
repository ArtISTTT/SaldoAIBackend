
import { gql } from 'graphql-tag';

const fileImportTypeDefs = gql`
  scalar Upload

  type ImportSession {
    id: ID!
    userId: ID!
    filename: String!
    status: String!
    processedCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ImportResult {
    session: ImportSession!
    imported: [Transaction!]!
    skipped: Int!
  }

  type Query {
    importSessions: [ImportSession!]!
  }

  type Mutation {
    startImport(file: Upload!): ImportResult!
  }
`;

export default fileImportTypeDefs;
