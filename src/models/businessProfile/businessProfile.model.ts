
import { Schema, model, Document, Types } from 'mongoose';

export enum BusinessType {
  SELF_EMPLOYED = 'SELF_EMPLOYED', // Самозанятый
  INDIVIDUAL_ENTREPRENEUR = 'INDIVIDUAL_ENTREPRENEUR', // ИП
  LLC = 'LLC' // ООО
}

export enum TaxSystem {
  NPD = 'NPD', // Налог на профессиональный доход (НПД)
  USN_INCOME = 'USN_INCOME', // УСН Доходы
  USN_INCOME_EXPENSE = 'USN_INCOME_EXPENSE', // УСН Доходы-Расходы
  OSN = 'OSN' // ОСН
}

export interface IBusinessProfile extends Document {
  userId: Types.ObjectId;
  businessType: BusinessType;
  taxSystem: TaxSystem;
  customTaxRate?: number;
  customTaxLimits?: {
    yearly?: number;
    monthly?: number;
  };
}

const businessProfileSchema = new Schema<IBusinessProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessType: { type: String, enum: Object.values(BusinessType), required: true },
  taxSystem: { type: String, enum: Object.values(TaxSystem), required: true },
  customTaxRate: { type: Number },
  customTaxLimits: {
    yearly: { type: Number },
    monthly: { type: Number }
  }
}, { timestamps: true });

export const BusinessProfileModel = model<IBusinessProfile>('BusinessProfile', businessProfileSchema);
