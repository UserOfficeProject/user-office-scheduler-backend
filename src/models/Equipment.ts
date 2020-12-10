export enum EquipmentAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class Equipment {
  constructor(
    public id: number,
    public owner: { id: number },
    public createdAt: Date,
    public updatedAt: Date,
    public name: string,
    public maintenanceStartsAt: Date,
    public maintenanceEndsAt: Date,
    public autoAccept: boolean
  ) {}
}
