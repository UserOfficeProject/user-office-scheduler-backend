import {
  ProposalBooking,
  ProposalBookingFinalizeAction,
} from '../models/ProposalBooking';
import { ProposalProposalBookingFilter } from '../resolvers/types/Proposal';

export interface ProposalBookingDataSource {
  // TODO
  upsert(event: any): Promise<void>;
  get(id: number): Promise<ProposalBooking | null>;
  getByProposalId(
    proposalId: number,
    filter?: ProposalProposalBookingFilter
  ): Promise<ProposalBooking | null>;
  instrumentProposalBookings(instrumentId: number): Promise<ProposalBooking[]>;
  finalize(
    action: ProposalBookingFinalizeAction,
    id: number
  ): Promise<ProposalBooking>;
  activate(id: number): Promise<ProposalBooking>;
}
