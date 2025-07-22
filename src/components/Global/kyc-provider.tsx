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

  const handleCloseMandatoryKYC = () => {
    // For mandatory KYC, only allow closing if KYC is completed
    if (!isKYCMandatory) {
      setShowMandatoryKYC(false);
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
        />
      )}
    </>
  );
}; 