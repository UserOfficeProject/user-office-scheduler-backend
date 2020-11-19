import { ScheduledEvent } from '../models/ScheduledEvent';
import {
  BulkUpsertScheduledEventsInput,
  NewScheduledEventInput,
} from '../resolvers/mutations/ScheduledEventMutation';
import { ScheduledEventFilter } from '../resolvers/queries/ScheduledEventQuery';

export interface ScheduledEventDataSource {
  create(
    newScheduledEvent: NewScheduledEventInput,
    scheduledById: number
  ): Promise<ScheduledEvent>;
  bulkUpsert(
    scheduledById: number,
    instrumentId: number,
    bulkUpsertScheduledEvents: BulkUpsertScheduledEventsInput
  ): Promise<ScheduledEvent[]>;
  delete(): Promise<null>;
  scheduledEvent(id: number): Promise<ScheduledEvent | null>;
  scheduledEvents(filter: ScheduledEventFilter): Promise<ScheduledEvent[]>;
  proposalBookingScheduledEvents(
    proposalBookingId: number
  ): Promise<ScheduledEvent[]>;
}
