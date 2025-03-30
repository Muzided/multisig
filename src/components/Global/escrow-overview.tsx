"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, MoreHorizontal, X } from "lucide-react"

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
// Mock data for escrow transactions
const mockEscrows = [
  {
    id: "ESC-001",
    amount: "1.5 ETH",
    diputed: false,
    requested: false,
    status: "active",
    receiver: "0x2b3c4d5e6f7g8h9i0j1a",
    reversal: "0x3c4d5e6f7g8h9i0j1a2b",
    createdAt: "2023-11-15",
  },
  {
    id: "ESC-002",
    amount: "0.75 ETH",
    diputed: false,
    requested: false,
    status: "completed",
    receiver: "0x4d5e6f7g8h9i0j1a2b3c",
    reversal: "0x5e6f7g8h9i0j1a2b3c4d",
    createdAt: "2023-11-10",
  },
  {
    id: "ESC-003",
    amount: "2.0 ETH",
    diputed: false,
    requested: false,
    status: "pending",
    receiver: "0x6f7g8h9i0j1a2b3c4d5e",
    reversal: "0x7g8h9i0j1a2b3c4d5e6f",
    createdAt: "2023-11-20",
  },
  {
    id: "ESC-004",
    amount: "0.5 ETH",
    diputed: false,
    requested: false,
    status: "expired",
    receiver: "0x8h9i0j1a2b3c4d5e6f7g",
    reversal: "0x9i0j1a2b3c4d5e6f7g8h",
    createdAt: "2023-10-25",
  },
  {
    id: "ESC-005",
    amount: "3.2 ETH",
    diputed: false,
    requested: false,
    status: "active",
    receiver: "0x0j1a2b3c4d5e6f7g8h9i",
    reversal: "0x1a2b3c4d5e6f7g8h9i0j",
    createdAt: "2023-11-25",
  },
]


type FormattedEscrow = {
  id: string;
  amount: string;
  escrowAddress: string;
  disputed: boolean;
  requested: boolean;
  status: string;
  receiver: string;
  reversal: string;
  createdAt: string;
};
// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}


interface EscrowDetails {
  amount: string;
  deadline: string;
}
type EscrowOverviewProps = {
  limit?: number
}

export function EscrowOverview({ limit }: EscrowOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("creator-escrows")
  const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [escrows, setEscrows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState<any>()
  const [refresh, setRefresh] = useState(false)
  const [openDialog, setOpenDialog] = useState(false);
  const [openEscrowDetails, setOpenEscrowDetails] = useState(false);
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [resolveApproved, setResolveApproved] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [createdEscrows, setCreatedEscrows] = useState<any[]>([])
  const [disputeDetails, setDisputeDetails] = useState<any>()
  const { fetchCreatorEscrows, fetchReceiverEscrows, fetchPaymentRequest, requestPayment, releaseFunds, approvePayment, initaiteDispute, resolveDispute } = useFactory();
  const { fetchEscrowDetails } = useEscrow();
  const { fetchDisputeDetails } = useDispute()
  const { address } = useAppKitAccount();

  useEffect(() => {
    if (!address) return;
    fetchCreatedEscrows(address)
    fetchClaimAbleEscrows(address)

  }, [address, refresh])

  //user created escrows
  const fetchCreatedEscrows = async (userAddress: string) => {
    try {
      const blockchainEscrows = await fetchCreatorEscrows(userAddress)
      console.log("ecrow-created-by-user", blockchainEscrows)
      if (!blockchainEscrows || blockchainEscrows.length === 0) {
        setCreatedEscrows([]);
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch and format data in one step
      const formattedEscrows: FormattedEscrow[] = await Promise.all(
        blockchainEscrows.map(async (escrow: any, index: number) => {
          const escrowRequest = await fetchPaymentRequest(escrow);

          return {
            id: `ESC-${(index + 1).toString().padStart(3, "0")}`,
            amount: `${escrowRequest?.amountRequested} USDT`,
            escrowAddress: escrow,
            disputed: escrowRequest?.isDisputed,
            requested: escrowRequest?.isPayoutRequested,
            status: escrowRequest?.completed
              ? "completed"
              : escrowRequest?.isDisputed
                ? "disputed"
                : "active",
            receiver: userAddress,
            reversal: `0x${Math.random().toString(16).substr(2, 40)}`,
            createdAt: currentDate,
          };
        })
      );
      console.log("formattedEscrows", formattedEscrows)

      setCreatedEscrows(formattedEscrows);
    } catch (error) {
      console.error("Error fetching escrow payment requests", error);
      setCreatedEscrows([]); // Ensure state consistency in case of an error
    }
  };
  //user claimable escrows
  const fetchClaimAbleEscrows = async (userAddress: string) => {
    try {
      const blockchainEscrows = await fetchReceiverEscrows(userAddress);


      if (!blockchainEscrows || blockchainEscrows.length === 0) {
        setEscrows([]);
        return;
      }
      console.log("ecrow-received-by-user", blockchainEscrows)

      const currentDate = new Date().toISOString().split("T")[0];

      // Fetch and format data in one step
      const formattedEscrows: FormattedEscrow[] = await Promise.all(
        blockchainEscrows.map(async (escrow: any, index: number) => {
          const escrowRequest = await fetchPaymentRequest(escrow);


          return {
            id: `ESC-${(index + 1).toString().padStart(3, "0")}`,
            amount: `${escrowRequest?.amountRequested} USDT`,
            disputed: escrowRequest?.isDisputed,
            escrowAddress: escrow,
            requested: escrowRequest?.isPayoutRequested,
            status: escrowRequest?.completed
              ? "completed"
              : escrowRequest?.isDisputed
                ? "disputed"
                : "active",
            receiver: userAddress,
            reversal: `0x${Math.random().toString(16).substr(2, 40)}`,
            createdAt: currentDate,
          };
        })
      );

      setEscrows(formattedEscrows);
    } catch (error) {
      console.error("Error fetching escrow payment requests", error);
      setEscrows([]); // Ensure state consistency in case of an error
    }
  };

  // Filter escrows based on status
  const filteredEscrows =
    statusFilter === "creator-escrows" ? createdEscrows : escrows

  // Apply limit if provided
  const displayEscrows = limit ? filteredEscrows.slice(0, limit) : filteredEscrows



  const getStatusStyles = (status: string) => {
    const baseClasses = "border bg-opacity-10 dark:bg-opacity-10"

    switch (status) {
      case "active":
        return `${baseClasses} border-green-500 bg-green-500/10 text-green-600 dark:border-green-500 dark:text-green-500`
      case "pending":
        return `${baseClasses} border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:border-yellow-500 dark:text-yellow-500`
      case "completed":
        return `${baseClasses} border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-500 dark:text-blue-500`
      case "expired":
        return `${baseClasses} border-red-500 bg-red-500/10 text-red-600 dark:border-red-500 dark:text-red-500`
      default:
        return `${baseClasses} border-gray-500 bg-gray-500/10 text-gray-600 dark:border-gray-500 dark:text-gray-500`
    }
  }

  const handleOpenDialog = async (escrow: any) => {


    setSelectedEscrow(escrow);
    setOpenDialog(true);
  };
  const handleOpenEscrow = async (escrow: any) => {
    setLoading(true);
    setSelectedEscrow(null);
    setDisputeDetails(null);

    try {
      // Fetch the escrow details here 
      const escrowDetails = await fetchEscrowDetails(escrow.escrowAddress);
      console.log("run-address", escrowDetails);

      if (escrowDetails?.isEscrowDisputed) {
        const disputedDetails = await fetchDisputeDetails(escrowDetails?.disputeContract);
        console.log("dispute-details", disputedDetails);
        setDisputeDetails(disputedDetails);
      }

      setEscrowDetails(escrowDetails);
      // Set the selected escrow to display in the dialog
      setSelectedEscrow(escrow);
      setOpenEscrowDetails(true);
    } catch (error) {
      console.error("Error fetching escrow details:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeEscrowDetailModal = () => {
    setSelectedEscrow(null)
    setDisputeDetails(null)
    setOpenEscrowDetails(false);
  }


  const handleSubmitDispute = () => {
    if (selectedEscrow) {
      console.log("Dispute reason:", disputeReason);
      // Here you would call your dispute initiation function
      setOpenDialog(false);
      setDisputeReason("");
    }
  };
  const handleOpenResolveDialog = (escrow: any) => {
    setSelectedEscrow(escrow);
    setOpenResolveDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <SelectItem value="creator-escrows">My Escrows</SelectItem>
            <SelectItem value="claimable-escrows">Calimable Escrows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800 mb-4">
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 
            dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white"
          >
            Table
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 
            dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-white"
          >
            Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                <TableRow
                  className="border-zinc-200 hover:bg-zinc-100/50 
                  dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <TableHead className="text-zinc-500 dark:text-zinc-400">ID</TableHead>

                  {/* <TableHead className="text-zinc-500 dark:text-zinc-400">Signees</TableHead> */}
                  {/* <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute</TableHead> */}
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Claim Status</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Escrow Details</TableHead>
                  <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEscrows.length === 0 ? (
                  <TableRow
                    className="border-zinc-200 hover:bg-zinc-100/50 
                    dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                      No escrows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEscrows.map((escrow) => (
                    <TableRow
                      key={escrow.id}
                      className="border-zinc-200 hover:bg-zinc-100/50 
                      dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-white">
                        {escrow.escrowAddress?.slice(0, 8)}...{escrow.escrowAddress?.slice(-7)}
                      </TableCell>


                      {/* <TableCell className="text-zinc-500 dark:text-zinc-400">
                        {escrow.diputed ?
                          <Badge variant="outline" className={getStatusStyles("expired")}>
                            {"Disputed"}
                          </Badge> :
                          <Badge variant="outline" className={getStatusStyles("pending")}>
                            {"---"}
                          </Badge>}
                      </TableCell> */}
                      <TableCell>
                        <Badge variant="outline" className={getStatusStyles(escrow.status)}>
                          {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                        </Badge>
                      </TableCell>



                      <TableCell>
                        {escrow.requested ?
                          <Badge variant="outline" className={getStatusStyles("active")}>
                            {"Requested"}
                          </Badge> :
                          <Badge variant="outline" className={getStatusStyles("pending")}>
                            {statusFilter === "creator-escrows" ? "Not requested" : "Claimable"}
                          </Badge>
                        }
                      </TableCell>

                      {/* viewEscrow details */}

                      <Dialog open={openEscrowDetails} onOpenChange={setOpenEscrowDetails}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={loadingEscrows[escrow.escrowAddress] || false}
                            className="bg-blue-600 text-white hover:bg-blue-700 my-2 w dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                            onClick={() => handleOpenEscrow(escrow)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <div className="flex justify-between items-center pt-2">
                              <DialogTitle>Escrow Details</DialogTitle>
                              <TableCell>
                                <span className="text-zinc-500 dark:text-zinc-400"> Status : </span>
                                <Badge variant="outline" className={getStatusStyles(escrowDetails?.isEscrowDisputed ? "Disputed" : "Active")}>
                                  {escrowDetails?.isEscrowDisputed ? "Disputed" : "Active"}
                                </Badge>
                              </TableCell>
                            </div>
                          </DialogHeader>

                          {loading ? (
        <div className="space-y-2">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-60 h-6" />
          <Skeleton className="w-80 h-6" />
        </div>
      ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-zinc-500 dark:text-zinc-400">Amount: {escrowDetails?.escrowAmount} USDT</p>
                            <p className="text-zinc-500 dark:text-zinc-400">Deadline: {escrowDetails?.deadline}</p>
                            {escrowDetails?.isEscrowDisputed && <p className="text-zinc-500 dark:text-zinc-400">Dispute Reason: {disputeDetails?.reason}</p>}
                          </div>)}
                          <DialogFooter>

                          </DialogFooter>
                        </DialogContent>
                      </Dialog>




                      {/* action buttons */}
                      <TableCell className="text-right ">
                        <div className="flex justify-end gap-2">

                          {!escrow.disputed && escrow.requested && statusFilter === 'creator-escrows' && <Button
                            size="sm"
                            disabled={loadingEscrows[escrow.escrowAddress] || false}
                            className="bg-blue-600 text-white hover:bg-blue-700 
                                dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                            onClick={() => approvePayment(escrow.escrowAddress, setLoadingEscrows, setRefresh)}
                          >
                            {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Release Funds"}
                          </Button>}
                          {!escrow.disputed && !escrow.requested && statusFilter === 'claimable-escrows' && <Button
                            size="sm"
                            disabled={loadingEscrows[escrow.escrowAddress] || false}
                            className="bg-blue-600 text-white hover:bg-blue-700 
                                dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                            onClick={() => requestPayment(escrow.escrowAddress, setLoadingEscrows, setRefresh)}
                          >
                            {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Request Claim"}
                          </Button>}
                          {!escrow.disputed && escrow.requested && statusFilter === 'claimable-escrows' && (
                            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  disabled={loadingEscrows[escrow.escrowAddress] || false}
                                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                                  onClick={() => handleOpenDialog(escrow)}
                                >
                                  Initiate Dispute
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Initiate Dispute</DialogTitle>
                                </DialogHeader>
                                <textarea
                                  placeholder="Enter reason for dispute..."
                                  rows={6}
                                  value={disputeReason}
                                  onChange={(e) => setDisputeReason(e.target.value)}
                                  className="mt-2 p-2"
                                />
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                  <Button
                                    disabled={loadingEscrows[escrow.escrowAddress] || false}
                                    onClick={(() => {
                                      initaiteDispute(escrow.escrowAddress, disputeReason, setLoadingEscrows, setRefresh)
                                    })}
                                    className="bg-red-600 text-white hover:bg-red-700">
                                    {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Submit Dispute"}

                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          {/* {escrow.disputed && statusFilter === 'creator-escrows' && (
                            <Dialog open={openResolveDialog} onOpenChange={setOpenResolveDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleOpenResolveDialog(escrow)}>
                                  Resolve Dispute
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Dispute</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center gap-2 mt-2">
                                  <Switch checked={resolveApproved} onCheckedChange={setResolveApproved} />
                                  <span>{resolveApproved ? "Approve Resolution" : "Reject Resolution"}</span>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setOpenResolveDialog(false)}>Cancel</Button>
                                  <Button onClick={(() => { resolveDispute(escrow.escrowAddress, resolveApproved, setLoadingEscrows, setRefresh) })} className="bg-green-600 text-white hover:bg-green-700">
                                    Submit Resolution
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )} */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-zinc-900 
                                dark:text-zinc-400 dark:hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="border-zinc-200 bg-white text-zinc-900 
                              dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                              <DropdownMenuItem className="flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {escrow.status === "active" && (
                                <DropdownMenuItem
                                  className="flex items-center text-red-600 hover:bg-zinc-100 hover:text-red-600 
                                  dark:text-red-500 dark:hover:bg-zinc-800 dark:hover:text-red-500 cursor-pointer"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Escrow
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Cards */}

        <TabsContent value="cards" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayEscrows.length === 0 ? (
              <Card
                className="col-span-full border-zinc-200 bg-white text-zinc-900 
                dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <CardContent className="flex h-40 items-center justify-center">
                  <p className="text-zinc-500 dark:text-zinc-500">No escrows found.</p>
                </CardContent>
              </Card>
            ) : (
              displayEscrows.map((escrow) => (
                <Card
                  key={escrow.id}
                  className="border-zinc-200 bg-white text-zinc-900 
                  dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-zinc-900 dark:text-white">{escrow.id}</CardTitle>
                      <Badge variant="outline" className={getStatusStyles(escrow.status)}>
                        {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                      </Badge>
                    </div>
                    {/* <CardDescription className="text-zinc-500 dark:text-zinc-400">
                      Created on {new Date(escrow.createdAt).toLocaleDateString()}
                    </CardDescription> */}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Escrow Details:</span>
                      <Dialog open={openEscrowDetails} onOpenChange={setOpenEscrowDetails}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={loadingEscrows[escrow.escrowAddress] || false}
                            className="bg-blue-600 text-white hover:bg-blue-700 my-2 w dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                            onClick={() => handleOpenEscrow(escrow)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <div className="flex justify-between items-center pt-2">
                              <DialogTitle>Escrow Details</DialogTitle>
                              <TableCell>
                                <span className="text-zinc-500 dark:text-zinc-400"> Status : </span>
                                <Badge variant="outline" className={getStatusStyles(escrowDetails?.isEscrowDisputed ? "Disputed" : "Active")}>
                                  {escrowDetails?.isEscrowDisputed ? "Disputed" : "Active"}
                                </Badge>
                              </TableCell>
                            </div>
                          </DialogHeader>
                          <div className="flex flex-col gap-2">
                            <p className="text-zinc-500 dark:text-zinc-400">Amount: {escrowDetails?.escrowAmount} USDT</p>
                            <p className="text-zinc-500 dark:text-zinc-400">Deadline: {escrowDetails?.deadline}</p>
                            {escrowDetails?.isEscrowDisputed && <p className="text-zinc-500 dark:text-zinc-400">Dispute Reason: {disputeDetails?.reason}</p>}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenEscrowDetails(false)}>Close</Button>
                            {/* <Button
                              disabled={loadingEscrows[escrow.escrowAddress] || false}
                              onClick={(() => {
                                initaiteDispute(escrow.escrowAddress, disputeReason, setLoadingEscrows, setRefresh)
                              })}
                              className="bg-red-600 text-white hover:bg-red-700">
                              {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Submit Dispute"}

                            </Button> */}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Claim Status:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {escrow.requested ?
                          <Badge variant="outline" className={getStatusStyles("active")}>
                            {"Requested"}
                          </Badge> :
                          <Badge variant="outline" className={getStatusStyles("pending")}>
                            {statusFilter === "creator-escrows" ? "Not requested" : "Claimable"}
                          </Badge>
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Expiry:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">

                      </span>
                    </div>
                    {/* Action buttons */}
                    <div className="pt-2">
                      {!escrow.disputed && escrow.requested && statusFilter === 'creator-escrows' && <Button
                        size="sm"
                        disabled={loadingEscrows[escrow.escrowAddress] || false}
                        className="bg-blue-600 text-white hover:bg-blue-700 w-full
                                dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                        onClick={() => approvePayment(escrow.escrowAddress, setLoadingEscrows, setRefresh)}
                      >
                        {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Release Funds"}
                      </Button>}
                      {!escrow.disputed && !escrow.requested && statusFilter === 'claimable-escrows' && <Button
                        size="sm"
                        disabled={loadingEscrows[escrow.escrowAddress] || false}
                        className="bg-blue-600 text-white hover:bg-blue-700 w-full 
                                dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                        onClick={() => requestPayment(escrow.escrowAddress, setLoadingEscrows, setRefresh)}
                      >
                        {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Request Claim"}
                      </Button>}
                      {!escrow.disputed && escrow.requested && statusFilter === 'claimable-escrows' && (
                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              disabled={loadingEscrows[escrow.escrowAddress] || false}
                              className="bg-red-600 text-white w-full hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
                              onClick={() => handleOpenDialog(escrow)}
                            >
                              Initiate Dispute
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Initiate Dispute</DialogTitle>
                            </DialogHeader>
                            <textarea
                              placeholder="Enter reason for dispute..."
                              rows={6}
                              value={disputeReason}
                              onChange={(e) => setDisputeReason(e.target.value)}
                              className="mt-2 p-2"
                            />
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                              <Button
                                disabled={loadingEscrows[escrow.escrowAddress] || false}
                                onClick={(() => {
                                  initaiteDispute(escrow.escrowAddress, disputeReason, setLoadingEscrows, setRefresh)
                                })}
                                className="bg-red-600 text-white hover:bg-red-700">
                                {loadingEscrows[escrow.escrowAddress] ? "processing..." : "Submit Dispute"}

                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

