
import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const ReviewModel = model('Review', reviewSchema);
