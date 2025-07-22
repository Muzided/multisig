export interface KYCState {
    isKYCMandatory: boolean;
    isKYCRequired: boolean;
    isKYCModalOpen: boolean;
    isKYCLoading: boolean;
    kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
    error: string | null;
  }