import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';

import userTypeDefs from '../typeDefs/user';
import userResolvers from '../resolvers/user';
import accountTypeDefs from '../typeDefs/account';
import accountResolvers from '../resolvers/account';
import transactionTypeDefs from '../typeDefs/transaction';
import transactionResolvers from '../resolvers/transaction';
import notificationTypeDefs from '../typeDefs/notification';
import notificationResolvers from '../resolvers/notification';
import subscriptionTypeDefs from '../typeDefs/subscription';
import subscriptionResolvers from '../resolvers/subscription';
import subscriptionPlanTypeDefs from '../typeDefs/subscriptionPlan';
import subscriptionPlanResolvers from '../resolvers/subscriptionPlan';
import csvImportTypeDefs from '../typeDefs/csvImport';
import csvImportResolvers from '../resolvers/csvImport';
import analyticsTypeDefs from '../typeDefs/analytics';
import analyticsResolvers from '../resolvers/analytics';
import commonTypeDefs from '../typeDefs/common';
import businessProfileResolvers from '../resolvers/businessProfile';
import businessProfileTypeDefs from '../typeDefs/businessProfile';

export const typeDefs = mergeTypeDefs([
  userTypeDefs,
  transactionTypeDefs,
  accountTypeDefs,
  notificationTypeDefs,
  subscriptionTypeDefs,
  subscriptionPlanTypeDefs,
  csvImportTypeDefs,
  analyticsTypeDefs,
  commonTypeDefs,
  businessProfileTypeDefs,
]);

export const resolvers = mergeResolvers([
  userResolvers,
  transactionResolvers,
  accountResolvers,
  notificationResolvers,
  subscriptionResolvers,
  subscriptionPlanResolvers,
  csvImportResolvers,
  analyticsResolvers,
  businessProfileResolvers,
]);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});