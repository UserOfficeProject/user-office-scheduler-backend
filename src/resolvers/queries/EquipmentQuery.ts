import { Resolver, Query, Ctx, Arg, ID, InputType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Equipment } from '../types/Equipment';

@Resolver()
export class EquipmentQueries {
  @Query(() => [Equipment])
  equipments(@Ctx() ctx: ResolverContext): Promise<Equipment[]> {
    return ctx.queries.equipment.getEquipments(ctx);
  }

  @Query(() => [Equipment])
  availableEquipments(
    @Ctx() ctx: ResolverContext,
    @Arg('scheduledEventId', () => ID) scheduledEventId: number
  ): Promise<Equipment[]> {
    return ctx.queries.equipment.availableEquipments(ctx, scheduledEventId);
  }

  @Query(() => Equipment, { nullable: true })
  equipment(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => ID) id: number
  ): Promise<Equipment | null> {
    return ctx.queries.equipment.getEquipment(ctx, id);
  }
}
