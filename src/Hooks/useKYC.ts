import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/userContext';
import { kyc_status } from '@/Web3/web3-config';

interface KYCState {
  isKYCMandatory: boolean;
  isKYCRequired: boolean;
  isKYCModalOpen: boolean;
  isKYCLoading: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  error: string | null;
}

interface KYCHookReturn extends KYCState {
  openKYCModal: () => void;
  closeKYCModal: () => void;
  checkKYCRequirement: () => boolean;
  setKycApproved: () => void;
  accessToken: string | null;
  setState: React.Dispatch<React.SetStateAction<KYCState>>;
}

export const useKYC = (): KYCHookReturn => {
  const { user } = useUser();
  const [state, setState] = useState<KYCState>({
    isKYCMandatory: false,
    isKYCRequired: false,
    isKYCModalOpen: false,
    isKYCLoading: false,
    kycStatus: 'not_started',
    error: null,
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);


  // Check if KYC is mandatory based on config and user status
  const checkKYCRequirement = useCallback((): boolean => {
    if (!user) return false;

    // KYC is mandatory if global config is true and user's KYC status is false
    const isMandatory = kyc_status && !user.kyc_status;

    setState(prev => ({
      ...prev,
      isKYCMandatory: isMandatory,
      isKYCRequired: isMandatory,
    }));

    return isMandatory;
  }, [user]);

  // Initialize KYC status
  useEffect(() => {
    if (user) {
      checkKYCRequirement();
      // Set KYC status based on user data
      setState(prev => ({
        ...prev,
        kycStatus: user.kyc_status ? 'approved' : 'not_started',

      }));
    }
  }, [user]);



  // Handle Sumsub SDK events

  // Open KYC modal
  const openKYCModal = useCallback(async () => {
    if (!user) return;

      setState(prev => ({ ...prev, isKYCModalOpen: true }));

  }, [user]);

  // Close KYC modal
  const closeKYCModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isKYCModalOpen: false,
      error: null
    }));
    //setAccessToken(null);
  }, []);

  // Set KYC as approved and close modal
  const setKycApproved = async () => {
    setState(prev => ({
      ...prev,
      kycStatus: 'approved',
      isKYCLoading: false,
      isKYCMandatory: false,
      isKYCModalOpen: false,
    }));
  }

  return {
    ...state,
    openKYCModal,
    closeKYCModal,
    checkKYCRequirement,
    setKycApproved,
    accessToken,
    setState, // Export setState
  };
}; 