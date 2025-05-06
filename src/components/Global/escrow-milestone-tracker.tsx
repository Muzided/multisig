"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { useFactory } from "@/Hooks/useFactory"

interface Milestone {
  id: string
  title: string
  amount: string
  status: "completed" | "active" | "upcoming"
  dueDate: string
  completedAt: string | null
}

interface EscrowMilestoneTrackerProps {
  escrow: {
    milestones: Milestone[]
  
  }
}

export function EscrowMilestoneTracker({ escrow }: EscrowMilestoneTrackerProps) {
  const { milestones } = escrow
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})
  const [loadingPayout, setLoadingPayout] = useState<Record<string, boolean>>({})
  const [refresh, setRefresh] = useState(false)
  const { requestPayment } = useFactory()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case "active":
        return <Circle className="h-6 w-6 text-blue-500 animate-pulse" />
      case "upcoming":
        return <Clock className="h-6 w-6 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "active":
        return <Badge variant="default">Active</Badge>
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>
      default:
        return null
    }
  }

  const toggleMilestone = (milestoneId: string) => {
    setOpenMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }))
  }

  const handlePayout = async (milestoneId: string) => {
    try {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
    //  await requestPayment(escrowAddress, setLoadingPayout, setRefresh)
    } catch (error) {
      console.error("Error requesting payment:", error)
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative pl-12 pb-8">
            <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white">
              {getStatusIcon(milestone.status)}
            </div>
            <Collapsible
              open={openMilestones[milestone.id]}
              onOpenChange={() => toggleMilestone(milestone.id)}
            >
              <Card className="relative">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        {getStatusBadge(milestone.status)}
                      </div>
                      {openMilestones[milestone.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-medium">{milestone.amount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due Date:</span>
                          <span className="font-medium">
                            {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        {milestone.completedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Completed:</span>
                            <span className="font-medium">
                              {format(new Date(milestone.completedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                      {milestone.status === "active" && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePayout(milestone.id)
                          }}
                          disabled={loadingPayout[milestone.id]}
                        >
                          {loadingPayout[milestone.id] ? "Processing..." : "Request Payout"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  )
} 