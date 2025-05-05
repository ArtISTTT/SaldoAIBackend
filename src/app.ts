import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { typeDefs, resolvers } from './graphql/schema';
import { buildContext } from './middlewares/auth';
import { Context } from './types';
import { graphqlUploadExpress } from 'graphql-upload';

dotenv.config();
export const startServer = async () => {
  const app = express(); // Уточнение типа Express

  app.use(cors());
  app.use(json());
  app.use(graphqlUploadExpress());

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
  });

  await server.start();

  const middleware = expressMiddleware<Context>(server, {
    context: async ({ req }) => buildContext(req),
  })

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    middleware,
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}/graphql`);
  });
};