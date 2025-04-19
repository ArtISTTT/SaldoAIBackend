
import { gql } from 'graphql-tag';

export default gql`
  enum BusinessType {
    SELF_EMPLOYED
    INDIVIDUAL_ENTREPRENEUR
    LLC
  }

  enum TaxSystem {
    NPD
    USN_INCOME
    USN_INCOME_EXPENSE
    OSN
  }

  type TaxLimits {
    yearly: Float!
    monthly: Float!
    rate: Float!
  }

  type BusinessProfile {
    id: ID!
    businessType: BusinessType!
    taxSystem: TaxSystem!
    customTaxRate: Float
    customTaxLimits: TaxLimits
    taxConfig: TaxLimits!
    createdAt: String!
    updatedAt: String!
  }

  input TaxLimitsInput {
    yearly: Float!
    monthly: Float!
  }

  extend type Query {
    businessProfile: BusinessProfile
    taxSystemInfo(taxSystem: TaxSystem!): TaxLimits!
  }

  extend type Mutation {
    updateBusinessProfile(
      businessType: BusinessType!
      taxSystem: TaxSystem!
      customTaxRate: Float
      customTaxLimits: TaxLimitsInput
    ): BusinessProfile!
  }
`;
