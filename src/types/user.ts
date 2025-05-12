export interface User {
    id: string;
    email: string;
    kyc_status: boolean;
    wallet_address: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegistrationVerificationResponse {
    message: string;
    toSign: string;
    requiresRegistration: boolean;
}

export interface EscrowCreationData {
    receiver_walletaddress: string;
    receiver_email: string;
    amount: number;
    due_date: number;
    payment_type: "full" | "milestone";
    jurisdiction_tag: string;
    document_html: string;
    kyc_required: boolean;
    observer_wallet: string;
    platform_fee_type: "percentage" | "fixed";
    platform_fee_value: number;
    creator_signature: boolean;
    receiver_signature: boolean;
    escrow_contract_address: string;
    transaction_hash: string;
    milestones?: {
        amount: number;
        due_date: number;
        description: string;
    }[];
}

// {
//     "message": "User not found. Please sign this key to verify and register.",
//     "toSign": "681de1d3c9bf75ae61b38678",
//     "requiresRegistration": true
// }
