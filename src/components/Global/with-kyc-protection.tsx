'use client'

import { ReactNode, useEffect, useState } from 'react';
import { useKYC } from '@/Hooks/useKYC';
import { useUser } from '@/context/userContext';
import { KYCModal } from './kyc-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield } from 'lucide-react';

interface WithKYCProtectionProps {
  children: ReactNode;
  requireKYC?: boolean;
  fallback?: ReactNode;
}

export const WithKYCProtection = ({ 
  children, 
  requireKYC = true, 
  fallback 
}: WithKYCProtectionProps) => {
  const { user, isAuthenticated } = useUser();
  const {
    isKYCMandatory,
    isKYCRequired,
    kycStatus,
    openKYCModal,
  } = useKYC();

  const [showKYCModal, setShowKYCModal] = useState(false);

  // Check if KYC is required for this component
  const isKYCRequiredForComponent = requireKYC && (isKYCMandatory || isKYCRequired);
  const isKYCCompleted = kycStatus === 'approved';

  // Show KYC modal if required and not completed
  useEffect(() => {
    if (isAuthenticated && user && isKYCRequiredForComponent && !isKYCCompleted) {
      setShowKYCModal(true);
    }
  }, [isAuthenticated, user, isKYCRequiredForComponent, isKYCCompleted]);

  // If KYC is not required or already completed, show children
  if (!requireKYC || isKYCCompleted) {
    return <>{children}</>;
  }

  // If user is not authenticated, show children (let auth handle it)
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // If KYC is required but not completed, show fallback or default KYC prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {/* KYC Required Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">Identity Verification Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              To access this feature, you need to complete your identity verification first.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setShowKYCModal(true);
                  openKYCModal();
                }}
                className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
              >
                Complete KYC Verification
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Modal */}
      {showKYCModal && (
        <KYCModal
          isOpen={showKYCModal}
          onClose={() => setShowKYCModal(false)}
          isMandatory={isKYCMandatory}
        />
      )}
    </>
  );
};

// Higher-order component for easier usage
export const withKYCProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requireKYC: boolean = true,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <WithKYCProtection requireKYC={requireKYC} fallback={fallback}>
      <Component {...props} />
    </WithKYCProtection>
  );

  WrappedComponent.displayName = `withKYCProtection(${Component.displayName || Component.name})`;
  return WrappedComponent;
}; 