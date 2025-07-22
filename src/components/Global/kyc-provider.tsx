'use client'

import { useEffect, useState, ReactNode } from 'react';
import { useKYC } from '@/Hooks/useKYC';
import { KYCModal } from './kyc-modal';
import { useUser } from '@/context/userContext';

interface KYCProviderProps {
  children: ReactNode;
}

export const KYCProvider = ({ children }: KYCProviderProps) => {
  const { user, isAuthenticated } = useUser();
  const {
    isKYCMandatory,
    isKYCRequired,
    isKYCModalOpen,
    kycStatus,
    openKYCModal,
    closeKYCModal,
    checkKYCRequirement,
  } = useKYC();

  const [showMandatoryKYC, setShowMandatoryKYC] = useState(false);

  // Check KYC requirement when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const isRequired = checkKYCRequirement();
      setShowMandatoryKYC(isRequired);
    }
  }, [isAuthenticated, user, checkKYCRequirement]);

  // Auto-open mandatory KYC modal
  useEffect(() => {
    if (showMandatoryKYC && !isKYCModalOpen) {
      // Small delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        openKYCModal();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showMandatoryKYC, isKYCModalOpen, openKYCModal]);


  console.log("KYC Provider State:", { 
    isKYCMandatory, 
    kycStatus, 
    isKYCModalOpen, 
    showMandatoryKYC 
  });
  
  const handleCloseMandatoryKYC = () => {
    console.log("handleCloseMandatoryKYC called:", { isKYCMandatory, kycStatus });
    // For mandatory KYC, only allow closing if KYC is completed
    if (!isKYCMandatory || kycStatus === 'approved') {
      console.log("Closing mandatory KYC modal");
      setShowMandatoryKYC(false);
    } else {
      console.log("Cannot close mandatory KYC modal - not approved yet");
    }
  };

  return (
    <>
      {children}
      
      {/* Mandatory KYC Modal */}
      {showMandatoryKYC && (
        <KYCModal
          isOpen={isKYCModalOpen}
          onClose={handleCloseMandatoryKYC}
          isMandatory={isKYCMandatory}
          setShowMandatoryKYC={setShowMandatoryKYC}
        />
      )}
    </>
  );
}; 