'use client'

import { useEffect, useState, ReactNode, useCallback, createContext, useContext } from 'react';
import { KYCModal } from './kyc-modal';
import { useUser } from '@/context/userContext';
import { useTab } from '@/context/TabContext';
import { checkKYCStatus } from '@/services/Api/auth/auth';

interface KYCState {
  isKYCMandatory: boolean;
  isKYCRequired: boolean;
  isKYCModalOpen: boolean;
  isKYCLoading: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  error: string | null;
  isCheckingKYC: boolean;
  isKYCStatusInitialized: boolean;
}

interface KYCContextType extends KYCState {
  openKYCModal: () => void;
  closeKYCModal: () => void;
  setKycApproved: () => void;
  setKycRejected: () => void;
  resetKycStatus: () => void;
  updateKYCState: (updates: Partial<KYCState>) => void;
  refreshKYCRequirement: () => Promise<void>;
  kyc_status: boolean;
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
  const { activeTab, setActiveTab } = useTab();
  const [kyc_status, setKycStatus] = useState<boolean>(false);

  const [state, setState] = useState<KYCState>({
    isKYCMandatory: false,
    isKYCRequired: false,
    isKYCModalOpen: false,
    isKYCLoading: false,
    kycStatus: 'not_started',
    error: null,
    isCheckingKYC: false,
    isKYCStatusInitialized: false,
  });



  // Check if KYC is mandatory based on API and user status
  const checkKYCRequirement = useCallback((): boolean => {
    if (!user) return false;

    try {
      setState(prev => ({ ...prev, isCheckingKYC: true, error: null }));

      // KYC is mandatory if API returns true (kyc_required) and user's KYC status is false (not completed)
      
      const isMandatory = kyc_status && !user.kyc_status;
      console.log("isMandatory result:", isMandatory,kyc_status,!user.kyc_status)

      setState(prev => ({
        ...prev,
        isKYCMandatory: isMandatory,
        isKYCRequired: isMandatory,
        isCheckingKYC: false,
        isKYCStatusInitialized: true,
      }));

      return isMandatory;
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check KYC requirement',
        isCheckingKYC: false,
        isKYCStatusInitialized: true,
      }));
      return false;
    }
  }, [user, kyc_status]);

  // Refresh KYC requirement manually
  const refreshKYCRequirement = useCallback(async () => {
    setState(prev => ({ ...prev, isKYCStatusInitialized: false }));
    await fetchKYCStatus();
    checkKYCRequirement();
  }, [checkKYCRequirement]);

  //fetch kyc status from api
  const fetchKYCStatus = async () => {
    try {
      const response = await checkKYCStatus()
      console.log("kyc-response", response, "type:", typeof response)
      setKycStatus(response)
    } catch (error) {
      console.log("error while fetching kyc status", error)
      // Set to false if API fails
      setKycStatus(false)
    }
  }

  useEffect(() => {
    fetchKYCStatus()

  }, [user])

  // Initialize KYC status when user is authenticated and API data is available
  useEffect(() => {
    if (isAuthenticated && user && !state.isKYCStatusInitialized && kyc_status !== undefined) {
      checkKYCRequirement();
    }
  }, [isAuthenticated, user, state.isKYCStatusInitialized, kyc_status, checkKYCRequirement]);


  // Initialize KYC status when user changes
  useEffect(() => {
    if (user) {
      // Set KYC status based on user data
      setState(prev => ({
        ...prev,
        kycStatus: user.kyc_status ? 'approved' : 'not_started',
      }));
    }
  }, [user]);

  // Check KYC requirement when user tries to access create tab (only if already initialized)
  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'create' && state.isKYCStatusInitialized) {
      // If KYC is required and user hasn't completed it, show modal
      if (state.isKYCMandatory && !user.kyc_status && !state.isKYCModalOpen) {
        setState(prev => ({
          ...prev,
          isKYCModalOpen: true,
        }));
      }
    } else {
      // If user is not on create tab, close the modal if it's open
      if (state.isKYCModalOpen && activeTab !== 'create') {
        setState(prev => ({
          ...prev,
          isKYCModalOpen: false
        }));
      }
    }
  }, [isAuthenticated, user, activeTab, state.isKYCMandatory, state.isKYCModalOpen, state.isKYCStatusInitialized]);

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

    // If user was on create tab and KYC is now approved, they can stay on create tab
    // The CreateTab component will automatically show the form now
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

  // Reset KYC status
  const resetKycStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      kycStatus: 'not_started',
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
    activeTab,
    isCheckingKYC: state.isCheckingKYC,
    error: state.error,
    isKYCStatusInitialized: state.isKYCStatusInitialized
  });

  const handleCloseMandatoryKYC = () => {
    console.log("handleCloseMandatoryKYC called:", {
      isKYCMandatory: state.isKYCMandatory,
      kycStatus: state.kycStatus
    });
    // For mandatory KYC, only allow closing if KYC is completed
    if (!state.isKYCMandatory || state.kycStatus === 'approved') {
      console.log("Closing mandatory KYC modal");
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
    resetKycStatus,
    updateKYCState,
    refreshKYCRequirement,
    kyc_status
  };

  return (
    <KYCContext.Provider value={contextValue}>
      {children}

      {/* KYC Modal - only show when modal is open */}
      {state.isKYCModalOpen && (
        <KYCModal
          isOpen={state.isKYCModalOpen}
          onClose={handleCloseMandatoryKYC}
          isMandatory={state.isKYCMandatory}
        />
      )}
    </KYCContext.Provider>
  );
}; 