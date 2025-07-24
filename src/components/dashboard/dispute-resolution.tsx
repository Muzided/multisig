"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MoreHorizontal, X, ChevronLeft, ChevronRight,CheckCircle, XCircle, DollarSign, Hash, Calendar, User, Users, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFactory } from "@/Hooks/useFactory"
import { useAppKitAccount } from "@reown/appkit/react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

import { Switch } from "@/components/ui/switch"
import { useEscrow } from "@/Hooks/useEscrow"
import { useDispute } from "@/Hooks/useDispute"
import { Skeleton } from "../ui/skeleton"
import { disputesDemoData } from "../../../public/Data/Ecsrows"
import { getStatusStyles } from "../../../utils/helper"
import { useRouter } from "next/navigation"
import PageHeading from "../ui/pageheading"
import { getDisputedResolutionHistory, getUserDisputes } from "@/services/Api/dispute/dispute"
import {  Dispute, DisputeResolutionResponse, UserDisputeResponse } from "@/types/dispute"
import { useQuery, useQueryClient } from "@tanstack/react-query"
// Mock data for escrow transactions




// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}




export function DisputeResolution() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [selectedResolution, setSelectedResolution] = useState<DisputeResolutionResponse | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const { address } = useAppKitAccount();
  const queryClient = useQueryClient();
  const { data: disputesData, isLoading, error } = useQuery<UserDisputeResponse>({
    queryKey: ['userdisputes', address, currentPage, pageSize, statusFilter],
    queryFn: async () => {
      const response = await getUserDisputes(currentPage, pageSize, statusFilter);
      return response.data;
    },
    enabled: !!address,
  });

  const router = useRouter()
  const navgateToDetailPage = (id: string,tab:string) => {
   tab==='chat' ? router.push(`/escrow/${id}?tab=chat`) : router.push(`/escrow/${id}`)
  }

  // Filter disputes based on status
  const filteredDisputes = disputesData?.disputes;

  // Add pagination controls
  const renderPagination = () => {
    if (!disputesData?.pagination) return null;
    const { total, page, totalPages } = disputesData.pagination;

    // Function to get visible page numbers (show current page and neighbors)
    const getVisiblePages = () => {
      const delta = 2; // Number of pages to show on each side
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
        range.push(i);
      }

      if (page - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (page + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
        {/* Results info - Mobile: centered, Desktop: left */}
        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Showing</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {(page - 1) * pageSize + 1}
          </span>
          <span>to</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {Math.min(page * pageSize, total)}
          </span>
          <span>of</span>
          <span className="font-medium text-zinc-900 dark:text-white">{total}</span>
          <span>results</span>
        </div>

        {/* Pagination controls - Mobile: centered, Desktop: right */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page - 1)}
            disabled={page === 1}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page numbers - Mobile: limited, Desktop: full */}
          <div className="flex items-center gap-1">
            {/* Mobile: Show only current page and total */}
            <div className="flex sm:hidden items-center gap-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>
            </div>

            {/* Desktop: Show full pagination */}
            <div className="hidden sm:flex items-center gap-1">
              {getVisiblePages().map((pageNum, index) => (
                <div key={index}>
                  {pageNum === '...' ? (
                    <span className="px-2 text-zinc-500 dark:text-zinc-400">...</span>
                  ) : (
                    <Button
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={pageNum === page 
                        ? "bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                      }
                    >
                      {pageNum}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page + 1)}
            disabled={page === totalPages}
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
console.log("disputesData",filteredDisputes)
  // Show skeleton loading while fetching data
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
              <TableRow>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const handleViewResolutionDetails = async (disputeContractAddress: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [disputeContractAddress]: true }));
      
      const response = await getDisputedResolutionHistory(disputeContractAddress);
      setSelectedResolution(response.data);
      setIsResolutionModalOpen(true);
      
    } catch (error) {
      console.error("Error fetching resolution details:", error);
     
    } finally {
      setLoadingStates(prev => ({ ...prev, [disputeContractAddress]: false }));
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEtherscanUrl = (address: string, type: 'address' | 'tx' = 'address') => {
    // You can change this to your preferred network (mainnet, testnet, etc.)
    const baseUrl = 'https://etherscan.io';
    return type === 'address' ? `${baseUrl}/address/${address}` : `${baseUrl}/tx/${address}`;
  };

  const handleEtherscanClick = (address: string, type: 'address' | 'tx' = 'address') => {
    const url = getEtherscanUrl(address, type);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getResolutionStatusIcon = (resolution: DisputeResolutionResponse) => {
    const { continue_work, resolved_in_favor_of_walletaddress, escrow_creator_walletaddress } = resolution.resolution;
    
    if (continue_work) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getResolutionStatusText = (resolution: DisputeResolutionResponse) => {
    const { continue_work, resolved_in_favor_of_walletaddress, escrow_creator_walletaddress } = resolution.resolution;
    
    if (continue_work) {
      return "Project Continued";
    } else {
      return "Project Stopped";
    }
  };

  const getWinnerText = (resolution: DisputeResolutionResponse) => {
    const { resolved_in_favor_of_walletaddress, escrow_creator_walletaddress, escrow_receiver_walletaddress } = resolution.resolution;
    
    if (resolved_in_favor_of_walletaddress.toLowerCase() === escrow_creator_walletaddress.toLowerCase()) {
      return "Creator";
    } else if (resolved_in_favor_of_walletaddress.toLowerCase() === escrow_receiver_walletaddress.toLowerCase()) {
      return "Receiver";
    } else {
      return "Unknown";
    }
  };

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
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1); // Reset to first page when filter changes
        }}>
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
            <SelectItem value="all">All Disputes</SelectItem>
            <SelectItem value="active">Active Disputes</SelectItem>
            <SelectItem value="pending">Pending Disputes</SelectItem>
            <SelectItem value="resolved">Resolved Disputes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
            <TableRow
              className="border-zinc-200 hover:bg-zinc-100/50 
              dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute Address</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Escrow Address</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Disputer Address</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Chat</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-red-500">
                  Error loading disputes. Please try again.
                </TableCell>
              </TableRow>
            ) : !filteredDisputes?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                  No disputes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDisputes.map((dispute) => (
                <TableRow
                  key={dispute.disputeContractAddress}
                  className="border-zinc-200 hover:bg-zinc-100/50 
                  dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <TableCell className="font-medium text-zinc-900 dark:text-white">
                    {formatAddress(dispute.disputeContractAddress)}
                  </TableCell>
                  <TableCell>
                    {formatAddress(dispute.escrowDetails.contractAddress)}
                  </TableCell>
                  <TableCell>
                    {dispute.createdByWallet ? formatAddress(dispute.createdByWallet) : "Not Adopted"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusStyles(dispute.status)}>
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dispute.status === 'resolved' ? (
                      <Button
                        size="sm"
                        className=" my-2 bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29] cursor-not-allowed"
                        onClick={() => {}}
                        disabled={!dispute.conversationId}
                      >
                        
                          <div
                          className="cursor-not-allowed flex items-center gap-2">
                         <MessageSquare className="h-4 w-4" />
                            <span>Chat</span>
                          </div>
                        
                      </Button>
                    ) : (
                      <div className={`relative ${ dispute.conversationId  ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <Button
                          size="sm"
                          className={`my-2  ${
                            dispute.conversationId 
                              ? "bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]" 
                              : "bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29] cursor-not-allowed"
                          }`}
                          onClick={() => dispute.conversationId && navgateToDetailPage(dispute.escrowDetails.contractAddress,"chat")}
                          disabled={!dispute.conversationId}
                        >
                          <div className="flex items-center  gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                          </div>
                        </Button>
                        {dispute.unreadCount > 0 && (
                          <div className="absolute top-0 left-0">
                            <span  
                              className="h-5 w-5 rounded-full p-0 text-white text-xs flex items-center justify-center min-w-0 border-2 bg-red-500 border-white dark:border-gray-300/60 shadow-2xl font-medium"
                            >
                              {dispute.unreadCount > 99 ? '99+' : dispute.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {dispute.status === 'resolved' ? (
                      <Button
                        size="sm"
                        className="bg-[#9C5F2A] text-white hover:bg-[#9C5F2A] my-2 w dark:bg-[#9C5F2A] dark:text-white dark:hover:bg-[#9C5F2A]"
                        onClick={() => handleViewResolutionDetails(dispute.disputeContractAddress)}
                        disabled={loadingStates[dispute.disputeContractAddress]}
                      >
                        {loadingStates[dispute.disputeContractAddress] ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          "View Resolution"
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#BB7333] text-white hover:bg-[#965C29] my-2 w dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                        onClick={() => navgateToDetailPage(dispute.escrowDetails.contractAddress,"escrow")}
                      >
                        View Escrow
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {renderPagination()}
      </div>

       {/* Resolution Details Modal */}
       <Dialog open={isResolutionModalOpen} onOpenChange={setIsResolutionModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              Resolution Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedResolution && (
            <div className="space-y-4 sm:space-y-6">
              {/* Resolution Summary */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Resolution Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
                      <span className="text-xs">{getResolutionStatusText(selectedResolution)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolved in favor of:</span>
                      <span className="text-xs font-semibold text-green-600">{getWinnerText(selectedResolution)}</span>
                    </div>
                   { getWinnerText(selectedResolution) === "Creator" && <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total returned amount:</span>
                      <span className="text-xs font-semibold">{selectedResolution.resolution.total_returned_amount} USDT</span>
                    </div>}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolution date:</span>
                      <span className="text-xs">{formatDate(selectedResolution.resolution.resolution_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Addresses */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contract Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Dispute Contract:</span>
                    <button
                      onClick={() => handleEtherscanClick(selectedResolution.resolution.dispute_contract_address, 'address')}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 break-all w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedResolution.resolution.dispute_contract_address}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Creator:</span>
                      <button
                        onClick={() => handleEtherscanClick(selectedResolution.resolution.escrow_creator_walletaddress, 'address')}
                        className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                      >
                        <span>{formatAddress(selectedResolution.resolution.escrow_creator_walletaddress)}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                      </button>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Receiver:</span>
                      <button
                        onClick={() => handleEtherscanClick(selectedResolution.resolution.escrow_receiver_walletaddress, 'address')}
                        className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                      >
                        <span>{formatAddress(selectedResolution.resolution.escrow_receiver_walletaddress)}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affected Milestones */}
              {selectedResolution.resolution.affected_milestones && selectedResolution.resolution.affected_milestones.length > 0 && (
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      Affected Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Index</TableHead>
                            <TableHead className="text-xs sm:text-sm">Amount (USDT)</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedResolution.resolution.affected_milestones.map((milestone, index) => (
                            <TableRow key={milestone._id}>
                              <TableCell className="text-xs sm:text-sm">{milestone.index}</TableCell>
                              <TableCell className="text-xs sm:text-sm">{milestone.amount}</TableCell>
                              <TableCell className="font-mono text-xs hidden sm:table-cell">
                                {milestone._id}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Hash */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                    Transaction Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Transaction Hash:</span>
                    <button
                      onClick={() => handleEtherscanClick(selectedResolution.resolution.tx_hash, 'tx')}
                      className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-1 break-all w-full text-left hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-between group"
                    >
                      <span>{selectedResolution.resolution.tx_hash}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

