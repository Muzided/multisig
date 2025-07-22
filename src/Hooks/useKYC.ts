import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/context/userContext';
import { kyc_status } from '@/Web3/web3-config';
import snsWebSdk from '@sumsub/websdk';
import { generateSumsubAccessToken } from '@/services/Api/auth/auth';

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
  refreshKYCStatus: () => Promise<void>;
}

export const useKYC = (): KYCHookReturn => {
  const { user } = useUser();
  const [state, setState] = useState<KYCState>({
    isKYCMandatory: false,
    isKYCRequired: false,
    isKYCModalOpen: false,
    isKYCLoading: true,
    kycStatus: 'not_started',
    error: null,
  });

  const sumsubRef = useRef<any>(null);
  const accessTokenRef = useRef<string | null>(null);
console.log("state", state)
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
  }, [user, checkKYCRequirement]);

  // No need to load SDK dynamically since we're using npm package

  // Update user KYC status in backend
  const updateUserKYCStatus = useCallback(async (kycStatus: boolean) => {
    try {
      const response = await fetch('/api/user/update-kyc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          kyc_status: kycStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update KYC status');
      }

      console.log('KYC status updated successfully');
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  }, []);

 


    // Initialize Sumsub Web SDK
    const initializeSumsub = useCallback(async () => {
      if (!user) return;
    
      try {
        setState(prev => ({ ...prev, isKYCLoading: true, error: null })); // Set loading true before SDK loads
    
        const accessToken = await generateSumsubAccessToken();
        accessTokenRef.current = accessToken;
    
        const sdk = snsWebSdk.init(accessToken, async () => {
          setState(prev => ({
            ...prev,
            error: 'KYC session expired. Please try again.',
          }));
          return await generateSumsubAccessToken();
        })
          .withConf({
            lang: 'en',
            email: user.email,
            phone: '',
          })
          .withOptions({
            addViewportTag: true,
            adaptIframeHeight: true,
          })
          .on('idCheck.onApproved' as any, (event: any) => {
            console.log('KYC approved:', event);
            setState(prev => ({
              ...prev,
              kycStatus: 'approved',
              isKYCModalOpen: false,
              isKYCLoading: false,
            }));
            updateUserKYCStatus(true);
          })
          .on('idCheck.onRejected' as any, (event: any) => {
            console.log('KYC rejected:', event);
            
          })
          .on('idCheck.onError' as any, (event: any) => {
            console.log('KYC error:', event);
           
          })
          .on('idCheck.onApplicantLoaded' as any, (event: any) => {
            console.log('Applicant loaded:', event);
            setState(prev => ({ ...prev, isKYCLoading: false }));
          })
          .on('moduleResultPresented' as any, (event: any) => {
            console.log('Module result presented:', event);
          })
          .on('idCheck.onStepCompleted' as any, (event: any) => {
            console.log('Step completed:', event);
          })
          .on('idCheck.onDocumentAccepted' as any, (event: any) => {
            console.log('Document accepted:', event);
          })
          .on('idCheck.onDocumentRejected' as any, (event: any) => {
            console.log('Document rejected:', event);
          })
          .build();
    
        // Ensure the container exists before launching
        const container = document.getElementById('sumsub-container');
        if (!container) {
          throw new Error('Sumsub container not found');
        }

        setState(prev => ({ ...prev, isKYCLoading: true })); // Set loading true right before launching SDK

        // Launch the SDK
        sdk.launch('#sumsub-container');

        sumsubRef.current = sdk;
        
        console.log('Sumsub SDK launched successfully');
        setState(prev => ({ ...prev, isKYCLoading: false, error: null })); // Set loading false after SDK is loaded
    
      } catch (error) {
        console.error('Error initializing Sumsub:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize KYC verification',
          isKYCLoading: false,
        }));
      }
    }, [user, updateUserKYCStatus]);
    

  // Open KYC modal
  const openKYCModal = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isKYCModalOpen: true, error: null }));
    
    // Wait a bit for the modal to render and container to be available
    setTimeout(async () => {
      await initializeSumsub();
    }, 100);
  }, [user, initializeSumsub]);

  // Close KYC modal
  const closeKYCModal = useCallback(() => {
    if (sumsubRef.current) {
      sumsubRef.current.close();
    }
    setState(prev => ({ ...prev, isKYCModalOpen: false, isKYCLoading: false })); // Set loading false after closing
  }, []);

  // Refresh KYC status
  const refreshKYCStatus = useCallback(async () => {
    if (!user) return;

    try {
     // setState(prev => ({ ...prev, isKYCLoading: true }));
      
      // Call your backend to get updated KYC status
      const response = await fetch('/api/user/kyc-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          kycStatus: data.kyc_status ? 'approved' : 'not_started',
          isKYCLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error refreshing KYC status:', error);
      setState(prev => ({ ...prev, isKYCLoading: false }));
    }
  }, [user]);

  return {
    ...state,
    openKYCModal,
    closeKYCModal,
    checkKYCRequirement,
    refreshKYCStatus,
  };
}; 