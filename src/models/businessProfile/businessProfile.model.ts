
import { Schema, model, Document, Types } from 'mongoose';
import { BusinessType, TaxSystem, TAX_LIMITS } from '@/constants/enums';

export interface IBusinessProfile extends Document {
  userId: Types.ObjectId;
  businessType: BusinessType;
  taxSystem: TaxSystem;
  customTaxRate?: number;
  customTaxLimits?: {
    yearly: number;
    monthly: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const businessProfileSchema = new Schema<IBusinessProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessType: { 
    type: String, 
    enum: Object.values(BusinessType), 
    required: true,
    default: BusinessType.SELF_EMPLOYED 
  },
  taxSystem: { 
    type: String, 
    enum: Object.values(TaxSystem), 
    required: true,
    default: TaxSystem.NPD 
  },
  customTaxRate: { 
    type: Number,
    validate: {
      validator: function(v: number) {
        return v > 0 && v < 1;
      },
      message: 'Tax rate must be between 0 and 1'
    }
  },
  customTaxLimits: {
    yearly: { type: Number, min: 0 },
    monthly: { type: Number, min: 0 }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

businessProfileSchema.virtual('taxConfig').get(function() {
  const baseConfig = TAX_LIMITS[this.taxSystem];
  return {
    rate: this.customTaxRate || baseConfig.rate,
    limits: this.customTaxLimits || baseConfig
  };
});

export const BusinessProfileModel = model<IBusinessProfile>('BusinessProfile', businessProfileSchema);
