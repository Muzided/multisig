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
  