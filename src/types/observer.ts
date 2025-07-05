export interface ObservedDispute {
    id: string;
    type: string;
    status: string;
    createdAt: string;
    disputeContractAddress: string;
    escrowDetails: {
        contractAddress: string;
        status: string;
        amount: number;
        creatorWallet: string;
        receiverWallet: string;
    };
    milestone: {
        index: number;
        amount: number;
        description: string;
    };
    createdByWallet: string;
    adoptedBy: string | null;
}

export interface ObservedDisputeResponse {
    success: boolean;
    disputes: ObservedDispute[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filter: {
        status: string;
        validStatuses: string[];
    };
}

export interface ObservedEscrow {
    escrow_contract_address: string;
    creator_walletaddress: string;
    receiver_walletaddress: string;
    amount: number;
    payment_type: string;
    jurisdiction_tag: string;
    status: string;
}

export interface ObservedEscrowResponse {
    escrows: ObservedEscrow[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: {
        status: string[];
        payment_type: string[];
    };
}