import { Pagination } from "./escrow";

export interface createDisputeData {
    escrowContractAddress: string
    type: string
    disputeContractAddress: string
    milestoneIndex: number
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
    disputeContractAddress:string;
    escrowDetails: EscrowDetails;
    milestone: MilestoneDetails;
    createdByWallet: string;
    adoptedBy: string | null;
}

interface UserDisputeResponse {
    success: boolean;
    disputes: Dispute[];
    pagination: Pagination;
}

export type { UserDisputeResponse, Dispute, EscrowDetails, MilestoneDetails };

