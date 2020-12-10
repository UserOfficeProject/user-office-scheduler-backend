/* eslint-disable @typescript-eslint/camelcase */
import { Equipment, EquipmentAssignmentStatus } from '../../models/Equipment';
import { ScheduledEvent } from '../../models/ScheduledEvent';
import {
  EquipmentInput,
  AssignEquipmentsToScheduledEventInput,
  DeleteEquipmentAssignmentInput,
} from '../../resolvers/mutations/EquipmentMutation';
import { EquipmentDataSource } from '../EquipmentDataSource';
import database, { UNIQUE_CONSTRAINT_VIOLATION } from './database';
import {
  EquipmentRecord,
  createEquipmentObject,
  PaginatedRecord,
  EquipmentsScheduledEventsRecord,
} from './records';

export default class PostgresEquipmentDataSource
  implements EquipmentDataSource {
  readonly tableName = 'equipments';
  readonly scheduledEventsTable = 'scheduled_events';
  readonly scheduledEventsEquipmentsTable = 'scheduled_events_equipments';

  async create(userId: number, input: EquipmentInput): Promise<Equipment> {
    const [equipmentRecord] = await database<EquipmentRecord>(this.tableName)
      .insert({
        owner_id: userId,
        name: input.name,
        maintenance_starts_at: input.maintenanceStartsAt,
        maintenance_ends_at: input.maintenanceEndsAt,
        auto_accept: input.autoAccept,
      })
      .returning('*');

    return createEquipmentObject(equipmentRecord);
  }

  async update(id: number, input: EquipmentInput): Promise<Equipment | null> {
    const [equipmentRecord] = await database<EquipmentRecord>(this.tableName)
      .update({
        name: input.name,
        maintenance_starts_at: input.maintenanceStartsAt,
        maintenance_ends_at: input.maintenanceEndsAt,
        auto_accept: input.autoAccept,
      })
      .where('equipment_id', id)
      .returning('*');

    return equipmentRecord ? createEquipmentObject(equipmentRecord) : null;
  }

  async get(id: number): Promise<Equipment | null> {
    const equipmentRecord = await database<EquipmentRecord>(this.tableName)
      .select('*')
      .where('equipment_id', id)
      .first();

    return equipmentRecord ? createEquipmentObject(equipmentRecord) : null;
  }

  async getAll(): Promise<Equipment[]> {
    const equipmentRecords = await database<EquipmentRecord>(this.tableName)
      .select('*')
      .orderBy('equipment_id', 'asc');

    return equipmentRecords.map(createEquipmentObject);
  }

  async availableEquipments(
    scheduledEvent: ScheduledEvent
  ): Promise<Equipment[]> {
    /**
     * This queries tries to find every available equipments bv checking:
     *  - the equipment is not under scheduled maintenance:
     *    * maintenance_starts_at is NULL, otherwise may be indefinitely scheduled or have a scheduled interval
     *    * maintenance_ends_at ends at or before the scheduled event starts (Note: rows with NULL are filtered by postgres)
     *  - we have no relationship between the scheduled vent and the equipment
     *  - the scheduled event doesn't overlap with other assigned scheduled events
     */
    const equipmentRecords = await database<EquipmentRecord>(this.tableName)
      .select<EquipmentRecord[]>(`${this.tableName}.*`)
      .whereRaw(
        `equipment_id NOT IN (
          SELECT eq.equipment_id 
          FROM ${this.tableName} eq 
          INNER JOIN ${this.scheduledEventsEquipmentsTable} see ON see.equipment_id = eq.equipment_id 
          INNER JOIN ${this.scheduledEventsTable} se ON se.scheduled_event_id = see.scheduled_event_id 
          WHERE see.scheduled_event_id = :scheduledEventId
          OR
          (
            (se.starts_at >= :startsAt AND se.ends_at <= :endsAt) OR
            (se.starts_at < :endsAt AND se.ends_at > :startsAt)
          )
        )
      `,
        {
          scheduledEventId: scheduledEvent.id,
          startsAt: scheduledEvent.startsAt,
          endsAt: scheduledEvent.endsAt,
        }
      )
      .where(qb => {
        qb.where('maintenance_starts_at', null);
        qb.orWhere('maintenance_ends_at', '<=', scheduledEvent.startsAt);
      })
      .orderBy('equipment_id', 'asc');

    return equipmentRecords.map(createEquipmentObject);
  }

  async scheduledEventEquipments(
    scheduledEventId: number
  ): Promise<Array<Equipment & { status: EquipmentAssignmentStatus }>> {
    const equipmentRecords = await database<EquipmentRecord>(this.tableName)
      .select<Array<EquipmentRecord & { status: EquipmentAssignmentStatus }>>(
        `${this.tableName}.*`,
        `${this.scheduledEventsEquipmentsTable}.status`
      )
      .join(
        this.scheduledEventsEquipmentsTable,
        `${this.tableName}.equipment_id`,
        `${this.scheduledEventsEquipmentsTable}.equipment_id`
      )
      .where(
        `${this.scheduledEventsEquipmentsTable}.scheduled_event_id`,
        scheduledEventId
      );

    return equipmentRecords.map(record => ({
      ...createEquipmentObject(record),
      status: record.status,
    }));
  }

  async assign(input: AssignEquipmentsToScheduledEventInput): Promise<boolean> {
    try {
      const equipments = await database<EquipmentRecord>(this.tableName)
        .select('equipment_id', 'auto_accept')
        .whereIn('equipment_id', input.equipmentIds);

      const records = await database<EquipmentsScheduledEventsRecord>(
        this.scheduledEventsEquipmentsTable
      )
        .insert(
          input.equipmentIds.map(equipmentId => ({
            equipment_id: equipmentId,
            scheduled_event_id: input.scheduledEventId,
            status: equipments.find(
              equipment => equipment.equipment_id === +equipmentId
            )?.auto_accept
              ? EquipmentAssignmentStatus.ACCEPTED
              : EquipmentAssignmentStatus.PENDING,
          }))
        )
        .returning('*');

      return records.length === input.equipmentIds.length;
    } catch (e) {
      if ('code' in e && e.code === UNIQUE_CONSTRAINT_VIOLATION) {
        return false;
      }

      throw e;
    }
  }

  async deleteAssignment(
    deleteEquipmentAssignmentInput: DeleteEquipmentAssignmentInput
  ): Promise<boolean> {
    const deletedRecords = await database<EquipmentsScheduledEventsRecord>(
      this.scheduledEventsEquipmentsTable
    )
      .del()
      .where('equipment_id', deleteEquipmentAssignmentInput.equipmentId)
      .where(
        'scheduled_event_id',
        deleteEquipmentAssignmentInput.scheduledEventId
      )
      .returning('*');

    return deletedRecords.length === 1;
  }
}
