"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EscrowMilestoneTracker } from "../Global/escrow-milestone-tracker"
import { EscrowDisputeChat } from "./escrow-dispute-chat"
import { EscrowGeneralInfo } from "./escrow-general-info"
import { useQuery } from "@tanstack/react-query"

import { getEscrowDetailsResponse } from "@/types/escrow"
import { fetchEscrowDetails, getLegalDocuments } from "@/services/Api/escrow/escrow"
import { useEscrow } from "@/Hooks/useEscrow"
import { ContractMilestone } from "@/types/contract"
import { useAppKitAccount } from "@reown/appkit/react"
import DOMPurify from 'dompurify'
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { useEscrowRefresh } from "@/context/EscrowContext"




export function EscrowDetails({ escrowId }: { escrowId: string }) {
  const { refreshTrigger } = useEscrowRefresh();
  const { getMileStones } = useEscrow();
  const [escrowOnChainDetails, setEscrowOnChainDetails] = useState<ContractMilestone[]>([]);
  const [showContractTerms, setShowContractTerms] = useState(false);
  const [contractContent, setContractContent] = useState("");
  const [originalContractContent, setOriginalContractContent] = useState("");

  const { address } = useAppKitAccount();

  const fetchEscrowDetailsFromBlockchain = useCallback(async (escrowId: string) => {
    const response = await getMileStones(escrowId);
    setEscrowOnChainDetails(response);
  }, [getMileStones]);

  useEffect(() => {
    if (escrowId) {
      fetchEscrowDetailsFromBlockchain(escrowId);
    }
  }, [escrowId, refreshTrigger]);

  const { data: escrowDetails, isLoading, error } = useQuery<getEscrowDetailsResponse>({
    queryKey: ['escrowDetails', escrowId],
    queryFn: async () => {
      const response = await fetchEscrowDetails(escrowId);
      return response.data;
    },
    enabled: !!escrowId, // Only run query when address is available
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!escrowDetails) {
    return (
      <div className="container mx-auto p-1 md:p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-lg">Escrow not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignContract = async (escrowAddress: string) => {
    try {
      const legalDocs = await getLegalDocuments(escrowAddress);
      const sanitizedContent = DOMPurify.sanitize(legalDocs?.data?.document || "");
      setOriginalContractContent(sanitizedContent);
      setContractContent(sanitizedContent);
      setShowContractTerms(true);
    } catch (error) {
      console.error("Error fetching legal documents:", error);
      toast.error("Failed to fetch contract document");
    }
  };

  console.log("shaka", escrowDetails,escrowOnChainDetails);
  return (
    <div className="container mx-auto p-1 md:p-4 space-y-6">
      <div className="flex flex-col gap-4 shadow-xl border border-gray-500/10 rounded-lg md:px-4 py-6">
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger className="data-[state=active]:bg-[#BB7333] data-[state=active]:text-white" value="general">Milestones & Payments</TabsTrigger>
              {escrowDetails.resolver && <TabsTrigger className="data-[state=active]:bg-[#BB7333] data-[state=active]:text-white" value="chat">Chat</TabsTrigger>}

              <TabsTrigger className="data-[state=active]:bg-[#BB7333] data-[state=active]:text-white" value="dispute">Terms & Docs</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <div className="flex flex-col gap-4">
                {escrowDetails?.escrow && <EscrowGeneralInfo {...escrowDetails.escrow} />}
                {escrowDetails?.escrow && escrowOnChainDetails && escrowOnChainDetails.length > 0 && escrowOnChainDetails[0].id !== '' &&
                  <EscrowMilestoneTracker
                    //  escrow={escrowDetails} 
                    escrowOnChainDetails={escrowOnChainDetails}
                    escrowDetails={escrowDetails}
                    userType={escrowDetails.escrow.creator_walletaddress.toLowerCase() === String(address).toLowerCase() ? "creator" : "receiver"}
                  />}
              </div>
            </TabsContent>
            {escrowDetails.resolver && <TabsContent value="chat">
              <EscrowDisputeChat
                escrowDetails={escrowDetails}
              />
            </TabsContent>}
            <TabsContent value="dispute">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Contract Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="space-y-1">
                            <h3 className="font-medium">Escrow Contract</h3>
                            <p className="text-sm text-gray-500">View the complete contract terms and conditions</p>
                          </div>
                          <Button
                            onClick={() => handleSignContract(escrowDetails?.escrow?.escrow_contract_address || '')}
                            variant="outline"
                            className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                          >
                            View Contract
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Dialog open={showContractTerms} onOpenChange={setShowContractTerms}>
                <DialogContent className="w-full lg:min-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Contract Terms</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div
                      className="prose max-w-none p-4 border rounded-lg min-h-[400px] overflow-y-auto bg-white dark:bg-zinc-900"
                      dangerouslySetInnerHTML={{ __html: contractContent }}
                      style={{ pointerEvents: 'none' }}
                      contentEditable={false}
                      suppressContentEditableWarning={true}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </div>
  );
} 