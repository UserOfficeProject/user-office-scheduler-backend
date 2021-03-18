import { ResolverContext } from '../context';
import { LostTimeDataSource } from '../datasources/LostTimeDataSource';
import Authorized from '../decorators/Authorized';
import { instrumentScientistHasAccess } from '../helpers/permissionHelpers';
import { LostTime } from '../models/LostTime';
import { Roles } from '../types/shared';

export default class LostTimeQueries {
  constructor(private lostTimeDataSource: LostTimeDataSource) {}

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async proposalBookingLostTimes(
    ctx: ResolverContext,
    proposalBookingId: number
  ): Promise<LostTime[]> {
    if (!(await instrumentScientistHasAccess(ctx, proposalBookingId))) {
      return [];
    }

    return this.lostTimeDataSource.proposalBookingLostTimes(proposalBookingId);
  }
}
