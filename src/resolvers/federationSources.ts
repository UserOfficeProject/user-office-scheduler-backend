/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolverMap } from 'apollo-graphql';

import { ResolverContext } from '../context';

export default function federationSources(): {
  orphanedTypes: Array<{ new (): any }>;
  referenceResolvers: GraphQLResolverMap<ResolverContext>;
} {
  return {
    orphanedTypes: [],
    referenceResolvers: {
      // $Name: { __resolveReference: resolve$NameReference },
    },
  };
}
