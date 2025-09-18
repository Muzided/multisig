import  CreateEscrowForm  from "@/components/escrowcreation/create-escrow-form"
import { useKYC } from "@/components/Global/kyc-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertCircle, Loader2, RefreshCw } from "lucide-react"

export function CreateTab() {
  const { kycStatus, isKYCMandatory, isCheckingKYC, isKYCStatusInitialized, error, openKYCModal, refreshKYCRequirement } = useKYC();

  // Show loading state only when KYC status hasn't been initialized yet
  if (!isKYCStatusInitialized || isCheckingKYC) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl font-semibold text-blue-700">
              Checking Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Please wait while we verify your account requirements...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if KYC check failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-red-700">
              Verification Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error}
            </p>
            <Button 
              onClick={refreshKYCRequirement}
              className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If KYC is mandatory and not approved, show KYC requirement message
  if (isKYCMandatory && kycStatus !== 'approved') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-200">
              Identity Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-500">
              To create escrows, you need to complete your identity verification first. 
              This helps ensure the security and compliance of all transactions.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>KYC verification is mandatory for escrow creation</span>
            </div>
            <Button 
              onClick={openKYCModal}
              className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            >
              Complete Identity Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If KYC is approved or not required, show the create escrow form
  return <CreateEscrowForm />
}

