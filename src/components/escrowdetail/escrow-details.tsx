"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EscrowMilestoneTracker } from "../Global/escrow-milestone-tracker"
import { EscrowDisputeChat } from "./escrow-dispute-chat"
import { EscrowGeneralInfo } from "./escrow-general-info"
import { useFactory } from "@/Hooks/useFactory"
import { ethers } from "ethers"

interface EscrowData {
  escrow: {
    id: string
    amount: string
    deadline: string
    receiver: string
    sender: string
    status: string
    createdAt: string
  }
  milestones: Array<{
    id: string
    title: string
    amount: string
    status: "completed" | "active" | "upcoming"
    dueDate: string
    completedAt: string | null
  }>
  dispute?: {
    status: string
    messages: Array<{
      id: string
      sender: string
      message: string
      timestamp: string
      attachments: string[]
    }>
  }
}
const demoEscrowData: EscrowData = {
  escrow: {
    id: "ESC-1001",
    amount: "20000000", // 5 ETH or similar if using wei
    deadline: "2025-05-30T23:59:59Z",
    receiver: "0x9aF3dE59B92E59B1A24375Bc32dD1875Bd51D4B2",
    sender: "0x84F1C7E182B3C9bF0Df4Eb1C5a6fC112FCB7A23a",
    status: "active",
    createdAt: "2025-04-15T14:33:22Z",
  },
  milestones: [
    {
      id: "ms-01",
      title: "Design Delivery",
      amount: "1.5",
      status: "completed",
      dueDate: "2025-04-20T00:00:00Z",
      completedAt: "2025-04-19T10:00:00Z",
    },
    {
      id: "ms-02",
      title: "Development Phase",
      amount: "2.0",
      status: "active",
      dueDate: "2025-05-05T00:00:00Z",
      completedAt: null,
    },
    {
      id: "ms-03",
      title: "Testing & Review",
      amount: "1.0",
      status: "upcoming",
      dueDate: "2025-05-20T00:00:00Z",
      completedAt: null,
    },
    {
      id: "ms-04",
      title: "Final Delivery",
      amount: "0.5",
      status: "upcoming",
      dueDate: "2025-05-30T00:00:00Z",
      completedAt: null,
    },
  ],
  dispute: {
    status: "open",
    messages: [
      {
        id: "msg-001",
        sender: "0x84F1C7E182B3C9bF0Df4Eb1C5a6fC112FCB7A23a",
        message: "Milestone 2 has bugs and needs to be revised.",
        timestamp: "2025-05-01T11:45:00Z",
        attachments: [],
      },
      {
        id: "msg-002",
        sender: "0x9aF3dE59B92E59B1A24375Bc32dD1875Bd51D4B2",
        message: "Acknowledged. Working on fixes.",
        timestamp: "2025-05-01T12:10:00Z",
        attachments: ["https://example.com/fix-screenshot.png"],
      },
    ],
  },
};

export function EscrowDetails({ escrowId }: { escrowId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [escrow, setEscrow] = useState<EscrowData | null>(demoEscrowData)
  //const { getEscrowDetails } = useFactory()

  // useEffect(() => {
  //   const fetchEscrowDetails = async () => {
  //     try {
  //       setIsLoading(true)
  //       const escrowData = await getEscrowDetails(escrowId)

  //       // Transform the contract data into our UI format
  //       const transformedData: EscrowData = {
  //         id: escrowId,
  //         status: escrowData.status,
  //         amount: ethers.formatEther(escrowData.amount) + " ETH",
  //         receiver: escrowData.receiver,
  //         sender: escrowData.sender,
  //         createdAt: new Date(escrowData.createdAt * 1000).toISOString(),
  //         deadline: new Date(escrowData.deadline * 1000).toISOString(),
  //         milestones: escrowData.milestones.map((milestone: any) => ({
  //           id: milestone.id.toString(),
  //           title: milestone.title,
  //           amount: ethers.formatEther(milestone.amount) + " ETH",
  //           status: milestone.status,
  //           dueDate: new Date(milestone.dueDate * 1000).toISOString(),
  //           completedAt: milestone.completedAt ? new Date(milestone.completedAt * 1000).toISOString() : null
  //         })),
  //         dispute: escrowData.dispute ? {
  //           status: escrowData.dispute.status,
  //           messages: escrowData.dispute.messages.map((msg: any) => ({
  //             id: msg.id.toString(),
  //             sender: msg.sender,
  //             message: msg.message,
  //             timestamp: new Date(msg.timestamp * 1000).toISOString(),
  //             attachments: msg.attachments
  //           }))
  //         } : undefined
  //       }

  //       setEscrow(transformedData)
  //     } catch (error) {
  //       console.error("Error fetching escrow details:", error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchEscrowDetails()
  // }, [escrowId, getEscrowDetails])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!escrow) {
    return (
      <div className="container mx-auto p-1 md:p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-lg">Escrow not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-1 md:p-4 space-y-6">
      <div className="flex flex-col gap-4 shadow-xl border border-gray-500/10 rounded-lg  md:px-4 py-6">
        {/* <CardHeader>
          <CardTitle className="text-2xl">Escrow Details</CardTitle>
        </CardHeader> */}
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger className=" " value="general">Milestones & Payments</TabsTrigger>
              <TabsTrigger className=" "  value="milestones">Messages & Files</TabsTrigger>
               
                <TabsTrigger className=" "  value="dispute">Terms & Docs</TabsTrigger>
              
            </TabsList>
            <TabsContent value="general">
              <div className="flex flex-col gap-4">
                <EscrowGeneralInfo escrow={escrow.escrow} />
                <EscrowMilestoneTracker escrow={escrow} />
              </div>
            </TabsContent>
            <TabsContent value="milestones">
              <div className="w-full ">
              <EscrowDisputeChat dispute={escrow.dispute || { status: "closed", messages: [] }} />
              </div>
            </TabsContent>
       
              <TabsContent value="dispute">
               
              </TabsContent>
            
          </Tabs>
        </CardContent>
      </div>
    </div>
  )
} 