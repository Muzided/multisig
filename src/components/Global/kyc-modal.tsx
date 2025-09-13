'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import SumsubWebSdk from '@sumsub/websdk-react';
import { generateSumsubAccessTokens } from '@/services/Api/auth/auth';
import { useUser } from '@/context/userContext';
import { useKYC } from './kyc-provider';
import { useTab } from '@/context/TabContext';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export const KYCModal = ({ 
  isOpen, 
  onClose, 
  isMandatory = false
}: KYCModalProps) => {
  const { user } = useUser();
  const { kycStatus, setKycApproved, setKycRejected, resetKycStatus } = useKYC();
  const { setActiveTab } = useTab();

  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isApplicantLoading, setIsApplicantLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showStatusContent, setShowStatusContent] = useState<boolean>(false);

  // Fetch access token when modal opens
  useEffect(() => { 
    if (isOpen && !accessToken) {
      fetchAccessToken();
    }
  }, [isOpen]);

  const fetchAccessToken = async () => {
    try {
      const token = await generateSumsubAccessTokens();
      setAccessToken(token);
    } catch (error) {
      console.error('Error generating access token:', error);
    }
  }

  // Handle modal close
  const handleClose = useCallback(() => {
    console.log("handleClose-kycmodal", isMandatory, kycStatus)
    if (!isMandatory || kycStatus === 'approved') {
      onClose();
    } else {
      // If KYC is mandatory and not approved, redirect to overview tab
      setActiveTab('overview');
      onClose();
    }
  }, [isMandatory, kycStatus, onClose, setActiveTab]);

  // Handle Try Again functionality
  const handleTryAgain = useCallback(async () => {
    // Reset all states
    setShowStatusContent(false);
    setSdkError(null);
    setIsApplicantLoading(true);
    setAccessToken(null);
    
    // Reset KYC status in context
    if (resetKycStatus) {
      resetKycStatus();
    }
    
    // Re-fetch access token
    await fetchAccessToken();
  }, [resetKycStatus]);

  // Auto-close modal when KYC is approved
  useEffect(() => {
    console.log('KYC Status changed:', kycStatus, 'Modal open:', isOpen);
    if (kycStatus === 'approved' && isOpen) {
      console.log('Auto-closing modal in 2 seconds...');
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [kycStatus, isOpen, handleClose]);

  // Show status content with smooth transition
  useEffect(() => {
    if (kycStatus === 'approved' || kycStatus === 'rejected' || kycStatus === 'pending') {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setShowStatusContent(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowStatusContent(false);
    }
  }, [kycStatus]);

  // Handle SDK errors
  const handleError = (error: any) => {
    console.error('Sumsub SDK error:', error);
    setSdkError('Failed to load verification interface. Please try again.');
  };

  // Handle SDK messages
  const handleMessage = (type: string, payload: any) => {
    console.log('Sumsub SDK message:', type, payload);
    if (type === 'idCheck.onApplicantLoaded') {
      setIsApplicantLoading(false);
    }
    if (type === 'idCheck.onApplicantVerificationCompleted') {
      console.log('Verification completed:', payload?.reviewResult?.reviewAnswer);
      if (payload?.reviewResult?.reviewAnswer === 'GREEN') {
        console.log('Setting KYC as approved...');
        setKycApproved();
      } else {
        console.log('Setting KYC as rejected...');
        setKycRejected();
      }
    }
  };

  const getStatusContent = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <div className="text-center space-y-4 animate-in fade-in duration-500">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">KYC Verification Approved!</h3>
            <p className="text-gray-600">
              Your identity has been successfully verified. You can now access all features.
            </p>
          </div>
        );
      case 'rejected':
        return (
          <div className="text-center space-y-4 animate-in fade-in duration-500">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700">KYC Verification Rejected</h3>
            <p className="text-gray-600">
              Your verification was not approved. Please try again with valid documents.
            </p>
            <Button 
              onClick={handleTryAgain} 
              className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </Button>
          </div>
        );
      case 'pending':
        return (
          <div className="text-center space-y-4 animate-in fade-in duration-500">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />
            <h3 className="text-lg font-semibold text-blue-700">KYC Verification in Progress</h3>
            <p className="text-gray-600">
              Your verification is being reviewed. This may take a few minutes.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
console.log("access token ",accessToken)
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal>
        {/* Custom darker backdrop */}
        <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#BB7333]" />
              {isMandatory ? 'Required Identity Verification' : 'Identity Verification'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            
            {/* Status Content with Smooth Transition */}
            {showStatusContent && getStatusContent()}

            {/* Sumsub Container with Fade Out */}
            {!showStatusContent && (
              <div className={`space-y-4 transition-opacity duration-500 ${showStatusContent ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Complete Your Identity Verification</h3>
                  <p className="text-gray-600 text-sm">
                    Please provide your identification documents to continue.
                    {isMandatory && ' This verification is required to use our services.'}
                  </p>
                </div>

                {/* Loading State */}
                {!accessToken && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#BB7333]" />
                    <span className="ml-2 text-gray-600">Loading verification...</span>
                  </div>
                )}

                {/* Sumsub React SDK Component */}
                {accessToken && (
                  <>
                    {isApplicantLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#BB7333]" />
                        <span className="ml-2 text-gray-600">Loading applicant...</span>
                      </div>
                    )}
                    <div className={isApplicantLoading ? 'opacity-50 pointer-events-none' : ''}>
                      <SumsubWebSdk
                        accessToken={accessToken}
                        expirationHandler={async () => {
                          try {
                            const newToken = await generateSumsubAccessTokens();
                            return newToken || '';
                          } catch (error) {
                            console.error('Error refreshing token:', error);
                            setSdkError('Session expired. Please try again.');
                            return '';
                          }
                        }}
                        config={{
                          lang: 'en',
                          email: user?.email || '',
                          phone: '',
                        }}
                        options={{
                          addViewportTag: true,
                          adaptIframeHeight: true,
                        }}
                        onMessage={handleMessage}
                        onError={handleError}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Footer Actions */}
            {!isMandatory && kycStatus !== 'approved' && !showStatusContent && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}; 