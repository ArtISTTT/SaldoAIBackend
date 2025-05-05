
import { chatQueries } from './query';
import { chatMutations } from './mutation';

const chatResolvers = {
  Query: chatQueries,
  Mutation: chatMutations,
};

export default chatResolvers;
