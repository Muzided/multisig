"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Receipt, Calendar, Hash, User, DollarSign, ArrowRight, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { TransactionDetailsResponse } from "@/types/escrow"

/** Read-only modal to show released-payment transaction details */
export const TransactionModal = ({
  open,
  onOpenChange,
  loading,
  details,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  loading: boolean
  details: TransactionDetailsResponse | null
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#BB7333]" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ) : details ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300">Payment Receipt</h3>
              <p className="text-sm text-gray-300">
                {(() => {
                  const rawType = details.transactions[0]?.transaction_type
                  if (!rawType) return null
                  const normalized = rawType.replace(/_/g, " ").toUpperCase()
                  if (normalized === "PAYMENT RECLAIMED") return "Payment reclaimed by the creator"
                  return normalized
                })()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {details.transactions.map((tx) => (
                <div key={tx._id} className="space-y-4">
                  <div className="text-center py-4 border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">${tx.amount}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Amount Paid</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                      </div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1 transition-colors"
                      >
                        {tx.transaction_hash.substring(0, 8)}...
                        {tx.transaction_hash.substring(tx.transaction_hash.length - 8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Date</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {format(new Date(tx.transaction_date), "MMM d, yyyy 'at' hh:mm a")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">User</span>
                      </div>
                      <span className="text-sm text-gray-900 font-mono">
                        {tx.user_id.wallet_address.substring(0, 6)}...
                        {tx.user_id.wallet_address.substring(tx.user_id.wallet_address.length - 4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Milestone</span>
                      </div>
                      <span className="text-sm text-gray-900">#{tx.milestone_index + 1}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Escrow Contract</span>
                      <span className="text-sm text-gray-900 font-mono">
                        {tx.escrow_contract_address.substring(0, 6)}...
                        {tx.escrow_contract_address.substring(tx.escrow_contract_address.length - 4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">Transaction ID: {details.transactions[0]?._id}</p>
              <p className="text-xs text-gray-400">
                This receipt serves as proof of payment for the milestone
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transaction details found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
