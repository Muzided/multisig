'use client'

import { useEffect, useState, ReactNode, useCallback, createContext, useContext } from 'react';
import { KYCModal } from './kyc-modal';
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

interface KYCContextType extends KYCState {
  openKYCModal: () => void;
  closeKYCModal: () => void;
  setKycApproved: () => void;
  setKycRejected: () => void;
  updateKYCState: (updates: Partial<KYCState>) => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

interface KYCProviderProps {
  children: ReactNode;
}

export const KYCProvider = ({ children }: KYCProviderProps) => {
  const { user, isAuthenticated } = useUser();
  
  const [state, setState] = useState<KYCState>({
    isKYCMandatory: false,
    isKYCRequired: false,
    isKYCModalOpen: false,
    isKYCLoading: false,
    kycStatus: 'not_started',
    error: null,
  });

  const [showMandatoryKYC, setShowMandatoryKYC] = useState(false);

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

  // Initialize KYC status when user changes
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

  // Check KYC requirement when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const isRequired = checkKYCRequirement();
      setShowMandatoryKYC(isRequired);
    }
  }, [isAuthenticated, user]);

  // Auto-open mandatory KYC modal
  useEffect(() => {
    if (showMandatoryKYC && !state.isKYCModalOpen) {
      // Small delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        openKYCModal();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showMandatoryKYC, state.isKYCModalOpen]);

  // Open KYC modal
  const openKYCModal = useCallback(() => {
    if (!user) return;
    setState(prev => ({ ...prev, isKYCModalOpen: true, error: null }));
  }, [user]);

  // Close KYC modal
  const closeKYCModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isKYCModalOpen: false,
      error: null
    }));
  }, []);

  // Set KYC as approved and close modal
  const setKycApproved = useCallback(() => {
    setState(prev => ({
      ...prev,
      kycStatus: 'approved',
      isKYCLoading: false,
      isKYCMandatory: false,
      isKYCModalOpen: false,
    }));
    setShowMandatoryKYC(false);
  }, []);

  // Set KYC as rejected
  const setKycRejected = useCallback(() => {
    setState(prev => ({
      ...prev,
      kycStatus: 'rejected',
      isKYCLoading: false,
      isKYCModalOpen: false,
    }));
  }, []);

  // Update KYC state (for external use)
  const updateKYCState = useCallback((updates: Partial<KYCState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  console.log("KYC Provider State:", { 
    isKYCMandatory: state.isKYCMandatory, 
    kycStatus: state.kycStatus, 
    isKYCModalOpen: state.isKYCModalOpen, 
    showMandatoryKYC 
  });
  
  const handleCloseMandatoryKYC = () => {
    console.log("handleCloseMandatoryKYC called:", { 
      isKYCMandatory: state.isKYCMandatory, 
      kycStatus: state.kycStatus 
    });
    // For mandatory KYC, only allow closing if KYC is completed
    if (!state.isKYCMandatory || state.kycStatus === 'approved') {
      console.log("Closing mandatory KYC modal");
      setShowMandatoryKYC(false);
      closeKYCModal();
    } else {
      console.log("Cannot close mandatory KYC modal - not approved yet");
    }
  };

  const contextValue: KYCContextType = {
    ...state,
    openKYCModal,
    closeKYCModal,
    setKycApproved,
    setKycRejected,
    updateKYCState,
  };

  return (
    <KYCContext.Provider value={contextValue}>
      {children}
      
      {/* Mandatory KYC Modal */}
      {showMandatoryKYC && (
        <KYCModal
          isOpen={state.isKYCModalOpen}
          onClose={handleCloseMandatoryKYC}
          isMandatory={state.isKYCMandatory}
        />
      )}
    </KYCContext.Provider>
  );
}; 