"use client"

import { useEffect, useState } from "react"
import { Check, Clock, ExternalLink, Filter, MoreHorizontal, X } from "lucide-react"

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

export function DisputeResolution() {
  const [statusFilter, setStatusFilter] = useState<string>("creator-escrows")
  const [loadingEscrows] = useState<{ [key: string]: boolean }>({});
  const [escrows, setEscrows] = useState<any[]>([])
  const [refresh, setRefresh] = useState(false)
  const [createdEscrows, setCreatedEscrows] = useState<any[]>([])

  //next-router
  const router = useRouter()



  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }

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
  const limit = 5;

  // Filter escrows based on status
  const filteredEscrows = disputesDemoData;






  console.log("filtered-escrows", filteredEscrows)


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
            <SelectItem value="creator-escrows">All Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Active Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Pedning Disputes</SelectItem>
            <SelectItem value="claimable-escrows">Resolved Disputes</SelectItem>
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
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Dispute Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Escrow Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Disputer Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Status</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">	Unread Messages</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>

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
                      key={escrow.disputeAddress}
                      className="border-zinc-200 hover:bg-zinc-100/50 
                      dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-white">
                        {escrow.disputeAddress?.slice(0, 8)}...{escrow.disputeAddress?.slice(-7)}
                      </TableCell>



                      <TableCell>
                        {escrow.escrowAddress?.slice(0, 8)}...{escrow.escrowAddress?.slice(-7)}

                      </TableCell>


                      {escrow.disputerAddress ?
                        <TableCell>
                          {escrow.disputerAddress?.slice(0, 8)}...{escrow.disputerAddress?.slice(-7)}
                        </TableCell> :
                        <TableCell>
                          "Not Adopted"
                        </TableCell>}

                      <TableCell>
                        <Badge variant="outline" className={getStatusStyles(escrow.status)}>
                          {escrow.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {escrow.unreadMessages}
                      </TableCell>



                      {/* viewEscrow details */}


                      <Button
                        size="sm"
                        // disabled={loadingEscrows[escrow.escrowAddress] || false}
                        className="bg-blue-600 text-white hover:bg-blue-700 my-2 w dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
                        onClick={() => navgateToDetailPage("3f4#fsd4")}
                      >
                        View Details
                      </Button>







                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>




      </Tabs>
    </div>
  )
}

