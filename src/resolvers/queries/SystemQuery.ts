import { promises } from 'fs';
import { join } from 'path';

import { logger } from '@esss-swap/duo-logger';
import { Resolver, Query, Ctx, ObjectType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { HealthStats as HealthStatsBase } from '../../datasources/SystemDataSource';

const SCHEDULER_CONFIG_AUTH_REDIRECT = process.env
  .SCHEDULER_CONFIG_AUTH_REDIRECT as string;

if (!SCHEDULER_CONFIG_AUTH_REDIRECT) {
  console.error('SCHEDULER_CONFIG_AUTH_REDIRECT is missing');
  process.exit(1);
}

@ObjectType()
export class DbStat {
  @Field(() => Number)
  total: number;

  @Field(() => String, { nullable: true })
  state: string | null;
}

let cached: string;

@ObjectType()
export class HealthStats implements HealthStatsBase {
  @Field(() => String)
  message: string;

  @Field(() => [DbStat])
  dbStats: DbStat[];
}

@ObjectType()
export class SchedulerConfig {
  @Field(() => String)
  authRedirect: string;
}

@Resolver()
export class SystemQuery {
  @Query(() => HealthStats)
  healthCheck(@Ctx() ctx: ResolverContext) {
    return ctx.queries.system.healthCheck();
  }

  @Query(() => SchedulerConfig)
  schedulerConfig() {
    const schedulerConfig = new SchedulerConfig();

    schedulerConfig.authRedirect = SCHEDULER_CONFIG_AUTH_REDIRECT;

    return schedulerConfig;
  }

  @Query(() => String)
  async schedulerVersion() {
    try {
      const content = await promises.readFile(
        join(process.cwd(), 'build-version.txt')
      );

      cached = content.toString().trim();

      return cached;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.logException(
          'Unknown error while reading build-version.txt',
          err
        );
      }

      return '<unknown>';
    }
  }
}
