import { gql } from 'graphql-tag';

const commonTypeDefs = gql`
  enum SortOrder {
    ASC
    DESC
  }
`;

export default commonTypeDefs;