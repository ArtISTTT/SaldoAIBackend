import { gql } from 'graphql-tag';

const csvImportTypeDefs = gql`
  type CsvImportSession {
    id: ID!
    userId: ID!
    filename: String!
    status: String!
    processedCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CsvImportResult {
    session: CsvImportSession!
    imported: [Transaction!]!
    skipped: Int!
  }

  type Query {
    csvImportSessions: [CsvImportSession!]!
  }

  type Mutation {
    startImport(filename: String!, base64: String!): CsvImportResult!
  }
`;

export default csvImportTypeDefs;