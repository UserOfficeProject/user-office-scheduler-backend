import { logger } from '@esss-swap/duo-logger';
import { ApolloServerPluginInlineTraceDisabled } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express, Request as ExpressRequest } from 'express';
import 'reflect-metadata';

import baseContext from '../buildContext';
import { ResolverContext } from '../context';
import initGraphQLClient from '../graphql/client';
import federationSources from '../resolvers/federationSources';
import { registerEnums } from '../resolvers/registerEnums';
import { AuthJwtPayload, AuthJwtApiTokenPayload } from '../types/shared';
import { buildFederatedSchema } from '../utils/buildFederatedSchema';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Request extends ExpressRequest {}

export const PATH = '/graphql';

const apolloServer = async (app: Express) => {
  registerEnums();

  const { orphanedTypes, referenceResolvers } = federationSources();

  const schema = await buildFederatedSchema(
    {
      resolvers: [
        __dirname + '/../resolvers/**/*Query.{ts,js}',
        __dirname + '/../resolvers/**/*Mutation.{ts,js}',
        __dirname + '/../resolvers/**/*Resolver.{ts,js}',
      ],
      orphanedTypes: [...orphanedTypes],
    },
    {
      ...referenceResolvers,
    }
  );

  const server = new ApolloServer({
    schema,
    tracing: false,
    playground: {
      settings: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore-line igore until https://github.com/prisma-labs/graphql-playground/pull/1212 is merged
        'schema.polling.enable': false,
      },
    },
    plugins: [ApolloServerPluginInlineTraceDisabled()],

    context: async ({ req }: { req: Request }) => {
      const context: ResolverContext = {
        ...baseContext,
        clients: { userOffice: initGraphQLClient(req.headers.authorization) },
      };

      try {
        const authJwtPayloadString = req.header('x-auth-jwt-payload');
        if (authJwtPayloadString) {
          const authJwtPayload = JSON.parse(
            Buffer.from(authJwtPayloadString, 'base64').toString()
          ) as AuthJwtPayload | AuthJwtApiTokenPayload;

          if (authJwtPayload && 'accessTokenId' in authJwtPayload) {
            throw new Error(
              'Accessing the Scheduler with API token is not supported yet'
            );
          }

          context.user = authJwtPayload?.user;
          context.roles = authJwtPayload?.roles;
        }
      } catch (error) {
        logger.logException('failed to parse x-auth-jwt-payload', error);
        throw error;
      }

      return context;
    },
  });
  server.applyMiddleware({ app: app, path: PATH });
};

export default apolloServer;
