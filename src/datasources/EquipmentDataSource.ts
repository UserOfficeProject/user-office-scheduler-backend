import { Equipment, EquipmentAssignmentStatus } from '../models/Equipment';
import { ScheduledEvent } from '../models/ScheduledEvent';
import {
  EquipmentInput,
  AssignEquipmentsToScheduledEventInput,
  DeleteEquipmentAssignmentInput,
  ConfirmEquipmentAssignmentInput,
} from '../resolvers/mutations/EquipmentMutation';

export interface EquipmentDataSource {
  create(userId: number, newEquipmentInput: EquipmentInput): Promise<Equipment>;
  update(
    id: number,
    updateEquipmentInput: EquipmentInput
  ): Promise<Equipment | null>;
  get(id: number): Promise<Equipment | null>;
  getAll(): Promise<Equipment[]>;
  scheduledEventEquipments(
    scheduledEventId: number
  ): Promise<Array<Equipment & { status: EquipmentAssignmentStatus }>>;
  equipmentAssignmentStatus(
    scheduledEventId: number,
    equipmentId: number
  ): Promise<EquipmentAssignmentStatus | null>;
  availableEquipments(scheduledEvent: ScheduledEvent): Promise<Equipment[]>;
  assign(
    assignEquipmentsToScheduledEventInput: AssignEquipmentsToScheduledEventInput
  ): Promise<boolean>;
  deleteAssignment(
    deleteEquipmentAssignmentInput: DeleteEquipmentAssignmentInput
  ): Promise<boolean>;
  confirmAssignment(
    confirmEquipmentAssignmentInput: ConfirmEquipmentAssignmentInput
  ): Promise<boolean>;
}
