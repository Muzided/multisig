"use client"

import { useEffect, useState } from "react"
import { Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
import { getUserEscrows } from "@/services/Api/escrow/escrow"
import { getUserEscrowsResponse } from "@/types/escrow"
import { toast } from "react-toastify"

import { Skeleton } from "@/components/ui/skeleton"
import { getObserverEscrow } from "@/services/Api/observer/observer"
import { ObservedEscrowResponse, ObservedEscrow } from "@/types/observer"

// Helper function to format wallet address
const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

type EscrowOverviewProps = {
    limit?: number
}

export function ObserveEscrow() {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [loadingEscrows, setLoadingEscrows] = useState<{ [key: string]: boolean }>({});

    //next-router
    const router = useRouter()

    //use-hooks

    const { address } = useAppKitAccount();
    const queryClient = useQueryClient();
    // TanStack Query for fetching escrows
    const { data: userEscrows, isLoading, error } = useQuery<ObservedEscrowResponse>({
        queryKey: ['escrows', address, currentPage, pageSize],
        queryFn: async () => {
            const response = await getObserverEscrow(currentPage, pageSize);
            return response.data;
        },
        enabled: !!address,
    });
    console.log("userEscrows", userEscrows)
    // Filter escrows based on status
    const filteredEscrows = userEscrows?.escrows || [];

    const navgateToDetailPage = (id: string) => {
        router.push(`/escrow/${id}`)
    }


    // Add pagination controls at the bottom of the table
    const renderPagination = () => {
        if (!userEscrows?.pagination) return null;
        const { total, page, totalPages } = userEscrows.pagination;

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
                                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
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
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
                                        <TableCell colSpan={8} className="h-24 text-center text-zinc-500 dark:text-zinc-500">
                                            No escrows found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEscrows.map((escrow: ObservedEscrow) => {
                                        const isReceiver = address?.toLowerCase() === escrow.receiver_walletaddress.toLowerCase();
                                        const isCreator = address?.toLowerCase() === escrow.creator_walletaddress.toLowerCase();

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
                                                        {isCreator && (
                                                            <Badge variant="secondary" className="bg-[#BB7333] text-white dark:bg-[#BB7333] dark:text-white">
                                                                You (Creator)
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {formatAddress(escrow.receiver_walletaddress)}
                                                        {isReceiver && (
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
                                                    <Button
                                                        size="sm"
                                                        disabled={loadingEscrows[escrow.escrow_contract_address] || false}
                                                        className="bg-[#BB7333] text-white hover:bg-[#965C29] my-2 w dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]"
                                                        onClick={() => navgateToDetailPage(escrow.escrow_contract_address)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        {renderPagination()}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

