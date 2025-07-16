export interface createEscrowResponse {
    success: boolean;
    escrow_contract_address: string;
    transaction_hash: string;
    admin_profit: number;
}
export interface creationFee {
    success:boolean,
    feeAmount: number
}
export interface getUserEscrowsResponse {
    escrows: UserEscrowDetails[];
    pagination: Pagination;
}
interface UserEscrowDetails {
    escrow_contract_address: string;
    creator_walletaddress: string;
    receiver_walletaddress: string;
    amount: number;
    payment_type: 'milestone' | 'escrow';
    jurisdiction_tag: string;
    status: 'pending' | 'completed' | 'disputed' | 'cancelled';
    creator_signature: boolean;
    receiver_signature: boolean;
}
export interface getLegalDocumentsResponse {
    document: string;
}

export interface EscrowDetails {
    creator_walletaddress: string;
    receiver_walletaddress: string;
    receiver_email: string;
    amount: number;
    due_date: number;
    payment_type: 'full' | 'milestone';
    jurisdiction_tag: string;
    kyc_required: boolean;
    observer_wallet: string;
    status: 'active' | 'completed' | 'disputed';
    platform_fee_type: 'percentage' | 'fixed';
    platform_fee_value: number;
    creator_signature: boolean;
    receiver_signature: boolean;
    escrow_contract_address: string;
    __v: number;
}
export interface Resolver {
    wallet_address: string,
    dispute_contract_address: string,
    _id: string
}

export interface Milestone {
    _id: string;
    amount: number;
    due_date: number;
    description: string;
    status: 'pending' | 'released' | 'disputed' | 'requested';
    createdAt: string;
    updatedAt: string;
    __v: number;
}
export interface Pagination {
    total: number;
    page: number,
    limit: number,
    totalPages: number
}
export interface getEscrowDetailsResponse {
    escrow: EscrowDetails;
    milestones: Milestone[];
    resolver: Resolver;
}


export interface getHistoryResponse {
    escrow: EscrowDetails;
    milestones: Milestone[];
}

export interface Transaction {
    amount?: number;
    transaction_hash: string;
    transaction_type: 'payment_released' | 'escrow_creation' | 'payment_requested' | 'dispute_raised';
    transaction_date: string;
}

export interface TransactionHistory {
    transactions: Transaction[];
    pagination: Pagination;
}

export interface TransactionDetails {
    _id: string;
    user_id: {
        _id: string;
        wallet_address: string;
    };
    escrow_contract_address: string;
    milestone_index: number;
    amount: number;
    transaction_hash: string;
    transaction_type: string;
    transaction_date: string;
    __v: number;
}

export interface TransactionDetailsResponse {
    success: boolean;
    transactions: TransactionDetails[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filter: {
        transaction_type: string;
        validTypes: string[];
    };
}


export interface EscrowStats {
    total: number;
    active: number;
    disputed: number;
    completed: number;
}

export interface TransactionStats {
    escrowCreationTotal: number;
    totalSent: number;
    totalReceived: number;
}

export interface DisputeStats {
    started: number;
    resolved: number;
}

export interface DashboardStats {
    escrows: EscrowStats;
    transactions: TransactionStats;
    disputes: DisputeStats;
}