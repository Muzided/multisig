"use client"

import { useEffect, useState, useMemo } from "react"
import { Check, Clock, ExternalLink, Filter, MoreHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { address } = useAppKitAccount();

  const { data: transactionHistory, isLoading } = useQuery<TransactionHistory>({
    queryKey: ['transactionHistory', address, currentPage, pageSize, statusFilter],
    queryFn: async () => {
      const response = await fetchTransactionHistory(statusFilter, currentPage, pageSize);
      return response.data;
    },
    enabled: !!address,
  });
  const filteredTransactions = useMemo(() => {
    if (!transactionHistory?.transactions) return [];
    return transactionHistory.transactions;
  }, [transactionHistory]);

  // Add pagination controls
  const renderPagination = () => {
    if (!transactionHistory?.pagination) return null;
    const { total, page, totalPages } = transactionHistory.pagination;

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
                <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
            <SelectItem value="dispute_initiated">Dispute Raised</SelectItem>
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
              <TableHead className="text-zinc-500 dark:text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Transaction Hash</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Type</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-500 dark:text-zinc-400">View on Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
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
        {renderPagination()}
      </div>
    </div>
  )
}

