
import { Schema, model, Document, Types } from 'mongoose';

export interface IImportSession extends Document {
  userId: Types.ObjectId;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const importSchema = new Schema<IImportSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'error'], default: 'pending' },
    processedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ImportModel = model<IImportSession>('ImportSession', importSchema);
