"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEther } from "viem"
import { formatDistanceToNow } from "date-fns"
import { EscrowDetails } from "@/types/escrow"
import { ReactNode } from "react"

export function EscrowGeneralInfo(escrow: EscrowDetails) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <DetailCard title="Status" value={getStatusBadge(escrow.status)} />
      <DetailCard title="Amount" value={escrow.amount.toString()} />
      <DetailCard title="Deadline" value={new Date(escrow.due_date * 1000).toLocaleDateString()} />
      <DetailCard title="Receiver" value={escrow.receiver_walletaddress.slice(0, 6) + "..." + escrow.receiver_walletaddress.slice(-4)} />
      <DetailCard title="Creator" value={escrow.creator_walletaddress.slice(0, 6) + "..." + escrow.creator_walletaddress.slice(-4)} />
      <DetailCard title="Payment Type" value={escrow.payment_type} />
    </div>
  )
} 

const DetailCard = ({title, value}: {title: string, value: string | ReactNode}) => {
  return(
    <div className="flex flex-col gap-2 py-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
