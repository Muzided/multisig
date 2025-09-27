import { Pagination } from "./escrow";

export interface createDisputeData {
    escrowContractAddress: string
    type: string
    disputeContractAddress: string
    milestoneIndex: number
    transaction_hash: string
}

interface EscrowDetails {
    contractAddress: string;
    status: string;
    amount: number;
    creatorWallet: string;
    receiverWallet: string;
}

interface MilestoneDetails {
    index: number;
    amount: number;
    description: string;
}

interface Dispute {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    disputeContractAddress: string;
    escrowDetails: EscrowDetails;
    milestone: MilestoneDetails;
    createdByWallet: string;
    adoptedBy: string | null;
    conversationId: string | null;
    unreadCount: number;
    creatorVote: boolean | null;
    receiverVote: boolean | null;
    decisionInitiated: string | null;
    decisionInFavorOf: string | null;
}

interface UserDisputeResponse {
    success: boolean;
    disputes: Dispute[];
    pagination: Pagination;
}

export interface AffectedMilestone {
    index: number;
    amount: number;
    _id: string;
}

export interface DisputeResolution {
    dispute_contract_address: string;
    escrow_creator_walletaddress: string;
    escrow_receiver_walletaddress: string;
    resolved_in_favor_of_walletaddress: string;
    continue_work: boolean;
    is_milestone_dispute: boolean;
    affected_milestones: AffectedMilestone[];
    receiver_returned_amount: number;
    creator_returned_amount: number;
    total_returned_amount: number;
    tx_hash: string;
    resolution_date: string;
}

interface DisputeResolutionResponse {
    success: boolean;
    resolution: DisputeResolution;
}



export type { UserDisputeResponse, DisputeResolutionResponse, Dispute, EscrowDetails, MilestoneDetails };



