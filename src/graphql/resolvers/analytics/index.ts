
import { statsResolvers } from './stats';
import { periodStatsResolvers } from './periodStats';
import { businessAnalyticsResolvers } from './businessAnalytics';

const analyticsResolvers = {
  Query: {
    ...statsResolvers,
    ...periodStatsResolvers,
    ...businessAnalyticsResolvers,
  },
};

export default analyticsResolvers;
