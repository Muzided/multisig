"use client"

import { useEffect, useState, useMemo } from "react"
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
import { userTransactionHistory } from "../../../public/Data/Ecsrows"
import { getStatusStyles } from "../../../utils/helper"
import { useRouter } from "next/navigation"
import PageHeading from "../ui/pageheading"
import { fetchTransactionHistory } from "@/services/Api/user/user"
import { useQuery } from "@tanstack/react-query"
import { Transaction, TransactionHistory } from "@/types/escrow"





export function TransactionsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { address } = useAppKitAccount();

  const { data: transactionHistory, isLoading } = useQuery<TransactionHistory>({
    queryKey: ['transactionHistory', address],
    queryFn: async () => {
      const response = await fetchTransactionHistory("all");
      return response.data;
    },
    enabled: !!address,
  });

  const filteredTransactions = useMemo(() => {
    if (!transactionHistory?.transactions) return [];
    
    switch (statusFilter) {
      case 'payment_released':
        return transactionHistory.transactions.filter(tx => tx.transaction_type === 'payment_released');
      case 'escrow_creation':
        return transactionHistory.transactions.filter(tx => tx.transaction_type === 'escrow_creation');
      case 'payment_requested':
        return transactionHistory.transactions.filter(tx => tx.transaction_type === 'payment_requested');
      case 'dispute_raised':
        return transactionHistory.transactions.filter(tx => tx.transaction_type === 'dispute_raised');
      default:
        return transactionHistory.transactions;
    }
  }, [transactionHistory, statusFilter]);
  console.log("transactionHistory", transactionHistory)
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
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent
            className="border-zinc-200 bg-white text-zinc-900 
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="payment_released">Payment Released</SelectItem>
            <SelectItem value="escrow_creation">Escrow Creation</SelectItem>
            <SelectItem value="payment_requested">Payment Requested</SelectItem>
            <SelectItem value="dispute_raised">Dispute Raised</SelectItem>
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
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Transaction Hash</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Type</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-500 dark:text-zinc-400">View on Scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.transaction_hash}
                      className="border-zinc-200 hover:bg-zinc-100/50 
                      dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-zinc-900 dark:text-white">
                        {transaction.amount ? `${transaction.amount} USDT` : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.transaction_hash}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {transaction.transaction_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transaction.transaction_hash}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
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

