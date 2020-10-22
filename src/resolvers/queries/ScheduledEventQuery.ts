import { Arg, Ctx, Field, ID, InputType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TzLessDateTime } from '../CustomScalars';
import { ScheduledEvent } from '../types/ScheduledEvent';

@InputType()
export class ScheduledEventFilter {
  @Field(() => TzLessDateTime, { nullable: true })
  startsAt: Date | null;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAt: Date | null;

  @Field(() => ID, { nullable: true })
  instrumentId: number | null;
}

@Resolver()
export class ScheduledEventQuery {
  @Query(() => [ScheduledEvent])
  scheduledEvents(
    @Ctx() ctx: ResolverContext,
    @Arg('filter', () => ScheduledEventFilter)
    filter: ScheduledEventFilter
  ) {
    return ctx.queries.scheduledEvent.scheduledEvents(ctx, filter);
  }

  @Query(() => ScheduledEvent, { nullable: true })
  scheduledEvent(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => ID)
    id: number
  ) {
    return ctx.queries.scheduledEvent.scheduledEvent(ctx, id);
  }

  @Query(() => [ScheduledEvent])
  proposalBookingScheduledEvents(
    @Ctx() ctx: ResolverContext,
    @Arg('proposalBookingId', () => ID) proposalBookingId: number
  ) {
    return ctx.queries.scheduledEvent.proposalBookingScheduledEvents(
      ctx,
      proposalBookingId
    );
  }
}