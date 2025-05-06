"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEther } from "viem"
import { formatDistanceToNow } from "date-fns"

interface EscrowGeneralInfoProps {
  escrow: {
    amount: string
    deadline: string
    receiver: string
    sender: string
    status: string
    createdAt: string
  }
}

export function EscrowGeneralInfo({ escrow }: EscrowGeneralInfoProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="default">Pending</Badge>
      case "Approved":
        return <Badge variant="secondary">Approved</Badge>
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "Expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (timestamp: string) => {
    //return formatDate("2025-05-30T23:59:59Z");
  }



  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <DetailCard title="Status" value={escrow.status} />
      <DetailCard title="Amount" value={escrow.amount} />
      <DetailCard title="Deadline" value={escrow.deadline} />
      <DetailCard title="Receiver" value={escrow.receiver.slice(0, 6) + "..." + escrow.receiver.slice(-4)} />
      <DetailCard title="Sender" value={escrow.sender.slice(0, 6) + "..." + escrow.sender.slice(-4)} />
      <DetailCard title="Created" value={escrow.createdAt} />
     
    </div>
  )
} 


const DetailCard = ({title, value}: {title: string, value: string}) => {
  return(
    <div className="flex flex-col gap-2 py-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
