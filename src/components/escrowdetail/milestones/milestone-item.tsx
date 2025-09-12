"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { ContractMilestone } from "@/types/contract"
import type { ReactNode } from "react"
import { CountdownTimer } from "./countdown-timer"
import { formatDate, isDueDatePassed, isDisputePeriodOver } from "../../../../utils/escrowUtils"

/**
 * Single milestone row: status dot, header, body, and action buttons.
 * This keeps the main file clean and testable.
 */
export const MilestoneItem = ({
  milestone,
  index,
  isOpen,
  toggle,
  // status helpers
  getStatusBadge,
  // action helpers
  renderActionButtons,
  // misc
  escrowDetails,
  escrowOnChainDetails,
}: {
  milestone: ContractMilestone
  index: number
  isOpen: boolean
  toggle: () => void
  getStatusBadge: (status: string, m: ContractMilestone, index: number) => ReactNode
  renderActionButtons: (m: ContractMilestone) => ReactNode
  escrowDetails: any
  escrowOnChainDetails: ContractMilestone[]
}) => {
  // icon logic extracted for clarity
  const getStatusIcon = () => {
    if (milestone.released) return <CheckCircle2 className="h-6 w-6 text-green-500" />
    if (milestone.disputedRaised) return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />

    const anyDisputed = escrowOnChainDetails.some(m => m.disputedRaised && !m.released)
    if (anyDisputed) return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />

    if (index > 0) {
      const prev = escrowOnChainDetails[index - 1]
      if (!prev.released) return <Clock className="h-6 w-6 text-gray-400" />
    }

    if (!isDueDatePassed(milestone.dueDate)) {
      if (index === 0) return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      const prev = escrowOnChainDetails[index - 1]
      return prev.released ? (
        <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      ) : (
        <Clock className="h-6 w-6 text-gray-400" />
      )
    }

    return <Clock className="h-6 w-6 text-gray-400" />
  }

  return (
    <div className="relative pl-12 pb-8">
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
        {getStatusIcon()}
      </div>

      <Collapsible open={isOpen} onOpenChange={toggle}>
        <Card className="relative">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {escrowDetails?.milestones[index].description || `Milestone ${index + 1}`}
                  </CardTitle>
                  {getStatusBadge(escrowDetails?.milestones[index].status, milestone, index)}
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                    <span className="font-medium">{formatDate(milestone.dueDate)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {renderActionButtons(milestone)}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
