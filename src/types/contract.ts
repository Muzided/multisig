// types/contracts.ts
export interface PaymentRequest {
    escrowAddress: string;
    requester: string;
    amount: bigint;  // ✅ Use bigint instead of BigNumber
    completed: boolean;
  }
  
  export interface Receiver {
    address: string;
    amount: bigint;  // ✅ Use bigint
    paid: boolean;
  }
  
  export interface EscrowDetails {
    deadline: Date;
    completed: boolean;
    address: string;
  }
  
  export interface FactoryStats {
    totalEscrows: number;
    totalPayments: string;
  }

  export interface EscrowCreationResponse {
    message:string;
    escrow_id:string;
  }

  export interface MileStone {
    amount: string;
    dueDate: string;
    released: boolean;
    disputed: boolean;
    requested: boolean;
    requestTime: string;
  }
  
  export interface ContractMilestone {
    id: string;
    amount: string;
    dueDate: string;
    released: boolean;
    rejected: boolean;
    disputedRaised: boolean;
    requested: boolean;
    requestTime: string;
  }

  export interface ApiMilestone {
    _id: string;
    amount: number;
    due_date: number;
    description: string;
    status: 'pending' | 'released' | 'disputed' | 'requested';
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  export interface EscrowMilestones {
    contractMilestones: ContractMilestone[];
    apiMilestones: ApiMilestone[];
  }
  
export interface RequestPaymentResponse {
  transactionHash: string;
  isSuccess: boolean;
  message: string;
}