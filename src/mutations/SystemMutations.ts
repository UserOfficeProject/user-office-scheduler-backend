import { logger } from '@esss-swap/duo-logger';

import { ResolverContext } from '../context';
import { SystemDataSource } from '../datasources/SystemDataSource';
import Authorized from '../decorators/Authorized';
import { Roles } from '../types/shared';

export default class SystemMutations {
  constructor(private systemDataSource: SystemDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  async resetDb(ctx: ResolverContext): Promise<string> {
    if (process.env.NODE_ENV === 'development') {
      logger.logWarn('Resetting database', {});

      await this.systemDataSource.resetDB();

      return 'OK';
    } else {
      throw new Error('Can not reset db in non-development environment');
    }
  }
}
