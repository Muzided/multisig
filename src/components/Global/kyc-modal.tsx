'use client'

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useKYC } from '@/Hooks/useKYC';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export const KYCModal = ({ isOpen, onClose, isMandatory = false }: KYCModalProps) => {
  const {
    isKYCLoading,
    kycStatus,
    error,
    closeKYCModal,
  } = useKYC();

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle modal close
  const handleClose = () => {
    if (!isMandatory || kycStatus === 'approved') {
      closeKYCModal();
      onClose();
    }
  };

  // Auto-close modal when KYC is approved
  useEffect(() => {
    if (kycStatus === 'approved' && isOpen) {
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [kycStatus, isOpen]);

  // Initialize Sumsub container when modal opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Ensure the container has the correct ID for Sumsub
      containerRef.current.id = 'sumsub-container';
      
      // Clear any existing content
      containerRef.current.innerHTML = '';
      
      // Add a loading indicator
      containerRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BB7333] mx-auto mb-2"></div>
            <p class="text-gray-600">Loading verification...</p>
          </div>
        </div>
      `;
    }
  }, [isOpen]);

  const getStatusContent = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">KYC Verification Approved!</h3>
            <p className="text-gray-600">
              Your identity has been successfully verified. You can now access all features.
            </p>
          </div>
        );
      case 'rejected':
        return (
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-700">KYC Verification Rejected</h3>
            <p className="text-gray-600">
              Your verification was not approved. Please try again with valid documents.
            </p>
            <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        );
      case 'pending':
        return (
          <div className="text-center space-y-4">
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-[#BB7333]" />
            {isMandatory ? 'Required Identity Verification' : 'Identity Verification'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Status Content */}
          {getStatusContent()}

          {/* Sumsub Container */}
          {!getStatusContent() && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Complete Your Identity Verification</h3>
                <p className="text-gray-600 text-sm">
                  Please provide your identification documents to continue.
                  {isMandatory && ' This verification is required to use our services.'}
                </p>
              </div>

              {/* Loading State */}
              {isKYCLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#BB7333]" />
                  <span className="ml-2 text-gray-600">Loading verification...</span>
                </div>
              )
              }

              {/* Sumsub Container */}
              <div 
                ref={containerRef}
                id="sumsub-container"
                className="w-full   rounded-lg overflow-hidden bg-transparent"
                style={{ 
                  minWidth: '100%',
                  position: 'relative'
                }}
              />
              
              {/* Fallback if SDK fails to load */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    Failed to load verification interface. Please refresh the page and try again.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {!isMandatory && kycStatus !== 'approved' && (
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
    </Dialog>
  );
}; 