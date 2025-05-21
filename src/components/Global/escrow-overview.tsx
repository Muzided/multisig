"use client"

import { useEffect, useState } from "react"
import { Filter } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SignaturePadComponent } from './signature-pad'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useFactory } from "@/Hooks/useFactory"
import { useAppKitAccount } from "@reown/appkit/react"
import { useEscrow } from "@/Hooks/useEscrow"
import { useDispute } from "@/Hooks/useDispute"
import { getStatusStyles } from "../../../utils/helper"
import { useRouter } from "next/navigation"
import { getUserEscrows, getLegalDocuments, signLegalDocument } from "@/services/Api/escrow/escrow"
import { getUserEscrowsResponse } from "@/types/escrow"
import { toast } from "react-toastify"
import DOMPurify from 'dompurify'

// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

type EscrowOverviewProps = {
  limit?: number
}

export function EscrowOverview({ limit }: EscrowOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [showContractTerms, setShowContractTerms] = useState(false);
  const [contractContent, setContractContent] = useState("");
  const [originalContractContent, setOriginalContractContent] = useState("");
  const [receiverSignature, setReceiverSignature] = useState("");
  const [currentEscrowAddress, setCurrentEscrowAddress] = useState("");

  //next-router
  const router = useRouter()

  //use-hooks

  const { address } = useAppKitAccount();
  const queryClient = useQueryClient();
  // TanStack Query for fetching escrows
  const { data: escrows, isLoading, error } = useQuery<getUserEscrowsResponse[]>({
    queryKey: ['escrows', address],
    queryFn: async () => {
      const response = await getUserEscrows();
      return response.data;
    },

    enabled: !!address, // Only run query when address is available
  });

  // Filter escrows based on status
  const filteredEscrows = escrows || [];

  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }

  const handleSignContract = async (escrowAddress: string) => {
    try {
      setCurrentEscrowAddress(escrowAddress);
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

  const handleReceiverSignature = async (signature: string) => {
    setReceiverSignature(signature);
    // Update contract content with the new signature
    let updatedContent = originalContractContent;
    const receiverSignaturePlaceholder = '<div id="receiver-signature-canvas"></div>';
    const receiverSignatureImg = `<img src="${signature}" alt="Provider Signature" style="max-width: 100%; height: auto;" />`

    if (updatedContent.includes(receiverSignaturePlaceholder)) {
      updatedContent = updatedContent.replace(receiverSignaturePlaceholder, receiverSignatureImg);
    } else {
      // If there's already a signature, replace it
      const existingSignature = updatedContent.match(/<div class="mt-8 border-t pt-4">[\s\S]*?Receiver's Signature[\s\S]*?<\/div>/);
      if (existingSignature) {
        updatedContent = updatedContent.replace(existingSignature[0], receiverSignatureImg);
      } else {
        // If no placeholder or existing signature, append at the end
        updatedContent += receiverSignatureImg;
      }
    }

    setContractContent(updatedContent);
    toast.success("Signature added to contract");
    
  };
  console.log("contractContent", contractContent)

  const handleSaveChanges = async () => {
    if (!receiverSignature) {
      toast.error("Please sign the contract first");
      return;
    }

    try {
      const isSigned = await signLegalDocument(currentEscrowAddress, contractContent);
      console.log("isSigned", isSigned)
      if (isSigned) {
        // Refetch escrows after successful signature
        toast.success("Contract signed successfully");
        setShowContractTerms(false);
        // Reset states
        setReceiverSignature("");
        setContractContent("");
        setOriginalContractContent("");
        await queryClient.invalidateQueries({ queryKey: ['escrows'] });
        setShowContractTerms(false);
      } else {
        toast.error("Failed to add signature to contract");
      }
  
      // Refresh the escrows list
      // queryClient.invalidateQueries(['escrows']);
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading escrows...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Error loading escrows</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-zinc-200 bg-white shadow-sm text-zinc-700 
            hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md transition-all duration-200
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
            dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-[180px] border-zinc-200 bg-white text-zinc-900 
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent
            className="border-zinc-200 bg-white text-zinc-900 
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <SelectItem value="all">All Escrows</SelectItem>
            {/* <SelectItem value="active">Active Escrows</SelectItem> */}
            {/* <SelectItem value="disputed">Disputed Escrows</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                <TableRow
                  className="border-zinc-200 hover:bg-zinc-100/50 
                  dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Contract Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Creator</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Receiver</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Payment Type</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Jurisdiction</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEscrows.length === 0 ? (
                  <TableRow
                    className="border-zinc-200 hover:bg-zinc-100/50 
                    dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                      No escrows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEscrows.map((escrow) => {
                    const isReceiver = address?.toLowerCase() === escrow.receiver_walletaddress.toLowerCase();
                    // Only lock if user is receiver AND creator has signed BUT receiver hasn't signed
                    const needsSignature = isReceiver && escrow.creator_signature && !escrow.receiver_signature;

                    return (
                      <TableRow
                        key={escrow.escrow_contract_address}
                        className="border-zinc-200 hover:bg-zinc-100/50 
                        dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <TableCell className="font-medium text-zinc-900 dark:text-white">
                          {formatAddress(escrow.escrow_contract_address)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatAddress(escrow.creator_walletaddress)}
                            {address?.toLowerCase() === escrow.creator_walletaddress.toLowerCase() && (
                              <Badge variant="secondary" className="bg-[#BB7333] text-white dark:bg-[#BB7333] dark:text-white">
                                You (Creator)
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatAddress(escrow.receiver_walletaddress)}
                            {address?.toLowerCase() === escrow.receiver_walletaddress.toLowerCase() && (
                              <Badge variant="secondary" className="bg-[#BB7333] text-white dark:bg-[#BB7333] dark:text-white">
                                You (Receiver)
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {escrow.amount}
                        </TableCell>
                        <TableCell>
                          {escrow.payment_type}
                        </TableCell>
                        <TableCell>
                          {escrow.jurisdiction_tag}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusStyles(escrow.status)}>
                            {escrow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {needsSignature ? (
                            // <div className="flex flex-col items-center gap-2">
                              // <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              //   Signature Required
                              // </p> 
                              <Button
                                size="sm"
                                className="bg-[#BB7333] text-white hover:bg-[#965C29] my-2 w dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                                onClick={() => handleSignContract(escrow.escrow_contract_address)}
                              >
                                Sign Contract
                              </Button>
                            // </div>
                          ) : (
                            <Button
                              size="sm"
                              disabled={loadingEscrows[escrow.escrow_contract_address] || false}
                              className="bg-[#BB7333] text-white hover:bg-[#965C29] my-2 w dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                              onClick={() => navgateToDetailPage(escrow.escrow_contract_address)}
                            >
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

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
            <div className="mt-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Signature</h3>
                <SignaturePadComponent
                  onSave={handleReceiverSignature}
                  canvasId="receiver-signature-canvas"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSaveChanges}
                className="flex items-center gap-2"
                disabled={!receiverSignature}
              >
                Sign Contract
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

