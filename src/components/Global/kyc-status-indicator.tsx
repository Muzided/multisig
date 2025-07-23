'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKYC } from '@/components/Global/kyc-provider';
import { AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react';

interface KYCStatusIndicatorProps {
  showButton?: boolean;
  className?: string;
}

export const KYCStatusIndicator = ({ showButton = true, className = '' }: KYCStatusIndicatorProps) => {
  const { kycStatus, isKYCMandatory } = useKYC();
  
  console.log("kycStatus-indicator", kycStatus, isKYCMandatory);
  const getStatusDisplay = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'KYC Verified',
          variant: 'default' as const,
          color: 'text-green-700',
        };
      default:
        return {
          icon: <Shield className="h-4 w-4 text-gray-500" />,
          text: isKYCMandatory ? 'KYC Required' : 'KYC Not Verified',
          variant: 'secondary' as const,
          color: 'text-gray-700',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={status.variant} className="flex items-center gap-1">
        {status.icon}
        <span className={status.color}>{status.text}</span>
      </Badge>

      {/* {showButton && kycStatus !== 'approved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={openKYCModal}
          className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
        >
          {isKYCMandatory ? 'Complete KYC' : 'Verify Identity'}
        </Button>
      )} */}
    </div>
  );
}; 