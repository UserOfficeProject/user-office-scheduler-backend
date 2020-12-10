import { Type } from 'class-transformer';
import {
  Field,
  ID,
  ObjectType,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  Equipment as EquipmentBase,
  EquipmentAssignmentStatus,
} from '../../models/Equipment';
import { TzLessDateTime } from '../CustomScalars';
import Paginated from './Paginated';
import { ScheduledEvent } from './ScheduledEvent';
import { User } from './User';

@ObjectType()
export class Equipment implements Partial<EquipmentBase> {
  @Field(() => ID)
  id: number;

  // external type
  @Type(() => User)
  @Field()
  owner: User;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  name: string;

  @Field(() => TzLessDateTime, { nullable: true })
  maintenanceStartsAt?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  maintenanceEndsAt?: Date;

  @Field(() => Boolean)
  autoAccept: boolean;
}

@ObjectType()
export class EquipmentWithAssignmentStatus extends Equipment {
  @Field(() => EquipmentAssignmentStatus)
  status: EquipmentAssignmentStatus;
}
