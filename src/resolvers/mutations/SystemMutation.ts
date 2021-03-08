import { Mutation, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';

export class SystemMutations {
  @Mutation(() => String)
  resetSchedulerDb(@Ctx() ctx: ResolverContext) {
    return ctx.mutations.system.resetDb(ctx);
  }
}
