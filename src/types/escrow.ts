export interface createEscrowResponse {
    success: boolean;
    escrow_contract_address: string;
    transaction_hash: string;
}

export interface getUserEscrowsResponse {
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
