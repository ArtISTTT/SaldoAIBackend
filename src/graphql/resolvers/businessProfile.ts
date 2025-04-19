
import { BusinessProfileModel } from '@/models/businessProfile/businessProfile.model';
import { BusinessType, TaxSystem, TAX_LIMITS } from '@/constants/enums';

const businessProfileResolvers = {
  Query: {
    businessProfile: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return BusinessProfileModel.findOne({ userId: context.user.id });
    },

    taxSystemInfo: async (_: any, { taxSystem }: { taxSystem: TaxSystem }) => {
      return TAX_LIMITS[taxSystem];
    }
  },

  Mutation: {
    updateBusinessProfile: async (
      _: any,
      { 
        businessType, 
        taxSystem, 
        customTaxRate, 
        customTaxLimits 
      }: {
        businessType: BusinessType;
        taxSystem: TaxSystem;
        customTaxRate?: number;
        customTaxLimits?: { yearly: number; monthly: number };
      },
      context: any
    ) => {
      if (!context.user) throw new Error('Unauthorized');

      const profile = await BusinessProfileModel.findOneAndUpdate(
        { userId: context.user.id },
        {
          businessType,
          taxSystem,
          customTaxRate,
          customTaxLimits
        },
        { new: true, upsert: true }
      );

      return profile;
    }
  }
};

export default businessProfileResolvers;
