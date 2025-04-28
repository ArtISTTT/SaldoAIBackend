
import { BusinessProfileModel } from '@/models/businessProfile/businessProfile.model';
import { BusinessType, TaxSystem, TAX_LIMITS } from '@/constants/enums';

const businessProfileResolvers = {
  Query: {
    businessProfile: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
    
      let profile = await BusinessProfileModel.findOne({ userId: context.user.id });
    
      if (!profile) {
        profile = await BusinessProfileModel.create({
          userId: context.user.id,
          taxSystem: TaxSystem.USN_INCOME,
          businessType: BusinessType.INDIVIDUAL_ENTREPRENEUR,
        });
      }
    
      // Fix: sanitize customTaxLimits before returning
      const plainProfile = profile.toObject(); // превращаем в обычный объект
      if (plainProfile.customTaxLimits) {
        const { yearly, monthly } = plainProfile.customTaxLimits;
        if (yearly == null || monthly == null) {
          plainProfile.customTaxLimits = null as any;
        }
      }
    
      return plainProfile;
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
