
import { ReviewModel } from '@/models/review/review.model';

const reviewResolvers = {
  Query: {
    reviews: async () => {
      return ReviewModel.find().sort({ createdAt: -1 });
    },
  },

  Mutation: {
    addReview: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');

      const review = new ReviewModel({
        ...input,
        userId: context.user.id,
      });

      return review.save();
    },
  },
};

export default reviewResolvers;
