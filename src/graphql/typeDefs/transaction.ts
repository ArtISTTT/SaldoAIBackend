import { gql } from 'graphql-tag';

const transactionTypeDefs = gql`  
  enum TransactionSortField {
    date
    amount
  }
  
  input TransactionSortByInput {
    field: TransactionSortField!
    order: SortOrder!
  }

  enum TransactionCategory {
    INCOME_FROM_CLIENTS
    ONLINE_SALES
    ADVERTISING_EXPENSES
    SUBSCRIPTIONS
    TRANSPORT
    PAYROLL
    TRAVEL
    OFFICE
    UTILITIES
    TAXES
    OTHER
  }

  type Transaction {
    id: ID!
    userId: ID!
    accountId: ID!
    amount: Float!
    type: String!
    category: TransactionCategory!
    description: String
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    transactions(
      search: String
      category: TransactionCategory
      dateFrom: String
      dateTo: String
      sortBy: TransactionSortByInput
    ): [Transaction!]!
  }

  input TransactionInput {
    accountId: ID!
    amount: Float!
    type: String!
    category: String!
    description: String
    date: String!
  }

  type Mutation {
    addTransaction(input: TransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
    updateTransaction(id: ID!, input: TransactionInput!): Transaction!
  }
`;

export default transactionTypeDefs;