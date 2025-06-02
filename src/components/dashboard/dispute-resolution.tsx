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
import { getUserDisputes } from "@/services/Api/dispute/dispute"
import {  Dispute, UserDisputeResponse } from "@/types/dispute"
import { useQuery, useQueryClient } from "@tanstack/react-query"
// Mock data for escrow transactions




// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}




export function DisputeResolution() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { address } = useAppKitAccount();
  const queryClient = useQueryClient();
  const { data: disputesData, isLoading, error } = useQuery<UserDisputeResponse>({
    queryKey: ['escrows', address],
    queryFn: async () => {
      const response = await getUserDisputes();
      return response.data;
    },
    enabled: !!address,
  });

  const router = useRouter()
  const navgateToDetailPage = (id: string) => {
    router.push(`/escrow/${id}`)
  }

  // Filter disputes based on status
  const filteredDisputes = disputesData?.disputes?.filter((dispute: Dispute) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return dispute.status === "active";
    if (statusFilter === "pending") return dispute.status === "pending";
    if (statusFilter === "resolved") return dispute.status === "resolved";
    return true;
  });

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
            <SelectItem value="all">All Disputes</SelectItem>
            <SelectItem value="active">Active Disputes</SelectItem>
            <SelectItem value="pending">Pending Disputes</SelectItem>
            <SelectItem value="resolved">Resolved Disputes</SelectItem>
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
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Escrow Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Disputer Address</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                  {/* <TableHead className="text-zinc-500 dark:text-zinc-400">Unread Messages</TableHead> */}
                  <TableHead className="text-zinc-500 dark:text-zinc-400">View Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow
                      key={index}
                      className="border-zinc-200 hover:bg-zinc-100/50 
                      dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                      Error loading disputes. Please try again.
                    </TableCell>
                  </TableRow>
                ) : !filteredDisputes?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
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
                      {/* <TableCell>
                        {dispute.unreadMessages || 0}
                      </TableCell> */}
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-[#BB7333] text-white hover:bg-[#965C29] my-2 w dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                          onClick={() => navgateToDetailPage(dispute.escrowDetails.creatorWallet)}
                        >
                          View Details
                        </Button>
                      </TableCell>
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

