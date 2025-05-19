"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, addHours, differenceInHours, differenceInMinutes } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useFactory } from "@/Hooks/useFactory"
import { ContractMilestone } from "@/types/contract"
import { getEscrowDetailsResponse } from "@/types/escrow"
import { useEscrow } from "@/Hooks/useEscrow"
import { handleError } from "../../../utils/errorHandler"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const formatDate = (timestamp: string | number | undefined) => {
  if (!timestamp) return "N/A"
  try {
    const date = new Date(Number(timestamp) * 1000)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, "MMM d, yyyy")
  } catch (error) {
    return "Invalid Date"
  }
}

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
  escrowDetails: getEscrowDetailsResponse
  escrowOnChainDetails: ContractMilestone[]
  userType: string
}

// Separate component for countdown timer
const CountdownTimer = ({ dueDate }: { dueDate: string | number }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const currentDate = Math.floor(Date.now() / 1000);
      const disputeEndTime = Number(dueDate) + (48 * 60 * 60);
      const remainingSeconds = disputeEndTime - currentDate;
      
      if (remainingSeconds <= 0) {
        setTimeLeft("Dispute period ended");
        return;
      }
      
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = Math.floor(remainingSeconds % 60);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [dueDate]);

  return <span>{timeLeft}</span>;
};

export function EscrowMilestoneTracker({ escrow, escrowDetails, escrowOnChainDetails, userType }: EscrowMilestoneTrackerProps) {
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})
  const [loadingPayout, setLoadingPayout] = useState<Record<string, boolean>>({})
  const [refresh, setRefresh] = useState(false)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<ContractMilestone | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const { requestPayment, releasePayment, claimUnRequestedAmounts, raiseDispute } = useEscrow()

  const isDueDatePassed = useCallback((dueDate: string | number) => {
    const currentDate = Math.floor(Date.now() / 1000);
    return Number(dueDate) < currentDate;
  }, []);

  const isDisputePeriodOver = useCallback((dueDate: string | number) => {
    const currentDate = Math.floor(Date.now() / 1000);
    const disputeEndTime = Number(dueDate) + (48 * 60 * 60);
    return currentDate > disputeEndTime;
  }, []);

  const getClaimButtonState = useCallback((milestone: ContractMilestone) => {
    if (!isDueDatePassed(milestone.dueDate)) {
      return {
        text: "Not Requested",
        disabled: true,
        message: "Waiting for due date"
      };
    }

    if (!isDisputePeriodOver(milestone.dueDate)) {
      return {
        text: "In Dispute Period",
        disabled: true,
        message: <CountdownTimer dueDate={milestone.dueDate} />
      };
    }

    return {
      text: "Claim Amount",
      disabled: false,
      message: "Dispute period ended"
    };
  }, [isDueDatePassed, isDisputePeriodOver]);

  const handleClaimAmount = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
      const res = await claimUnRequestedAmounts(escrowAddress, milestoneId)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error claiming amount:", error)
      handleError(error);
    }
  }, [claimUnRequestedAmounts]);

  const handlePayout = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
      const res = await requestPayment(escrowAddress, milestoneId)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error requesting payment:", error)
      handleError(error);
    }
  }, [requestPayment]);

  const handlePaymentRelease = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
      const res = await releasePayment(escrowAddress, milestoneId)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error requesting payment:", error)
      handleError(error);
    }
  }, [releasePayment]);

  const handleRaiseDispute = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      if (!disputeReason.trim()) {
        toast.error("Please provide a reason for the dispute");
        return;
      }
      
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }));
      await raiseDispute(escrowAddress, milestoneId, disputeReason);
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }));
      setDisputeModalOpen(false);
      setDisputeReason("");
      
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }));
      console.error("Error raising dispute:", error);
      handleError(error);
    }
  }, [raiseDispute, disputeReason]);

  const openDisputeModal = (milestone: ContractMilestone) => {
    setSelectedMilestone(milestone);
    setDisputeModalOpen(true);
  };

  const renderDisputeButton = (milestone: ContractMilestone) => {
    // Don't show dispute button if dispute is already raised
    if (milestone.disputedRaised) {
      return null;
    }

    // Show dispute button during dispute period (only for receiver)
    if (isDueDatePassed(milestone.dueDate) && !isDisputePeriodOver(milestone.dueDate)) {
      // Only show dispute button to receiver during dispute period
      if (userType === "receiver") {
        return (
          <Button
            size="sm"
            variant="destructive"
            className="w-full mt-2 bg-[#BB7333] hover:bg-[#965C29] text-white"
            onClick={(e) => {
              e.stopPropagation();
              openDisputeModal(milestone);
            }}
            disabled={loadingPayout[milestone.id]}
          >
            Raise Dispute
          </Button>
        );
      }
      return null;
    }

    // Show dispute button for active milestones (both creator and receiver)
    if (!isDueDatePassed(milestone.dueDate)) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            openDisputeModal(milestone);
          }}
          disabled={loadingPayout[milestone.id]}
        >
          Raise Dispute
        </Button>
      );
    }

    return null;
  };

  const toggleMilestone = useCallback((milestoneId: string) => {
    setOpenMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }))
  }, []);

  const getStatusIcon = (status: string, milestone: ContractMilestone, index: number) => {
    // If any milestone is disputed, show disputed icon
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if milestone is completed
    if (milestone.requested && milestone.released) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />
    }

    // Check if milestone is in dispute
    if (milestone.disputedRaised) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if milestone is pending
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.requested || !previousMilestone.released) {
        return <Clock className="h-6 w-6 text-gray-400" />
      }
    }

    // Check if milestone is active or upcoming
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone
      if (index === 0) {
        return <Circle className="h-6 w-6 text-primary animate-pulse" />
      }

      // For other milestones, check previous milestone's due date
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (isDueDatePassed(previousMilestone.dueDate)) {
        return <Circle className="h-6 w-6 text-primary animate-pulse" />
      }
      
      return <Clock className="h-6 w-6 text-gray-400" />
    }

    // Default case (pending)
    return <Clock className="h-6 w-6 text-gray-400" />
  }

  const getStatusBadge = (status: string, milestone: ContractMilestone, index: number) => {
    // If any milestone is disputed, all milestones should show disputed status
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if milestone is completed (receiver requested and creator released)
    if (milestone.requested && milestone.released) {
      return <Badge variant="default">Completed</Badge>;
    }

    // Check if milestone is in dispute
    if (milestone.disputedRaised) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if milestone is pending (previous milestone is not completed)
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.requested || !previousMilestone.released) {
        return <Badge variant="secondary">Pending</Badge>;
      }
    }

    // Check if milestone is upcoming or active based on due dates
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone, check if it's active
      if (index === 0) {
        return <Badge className="bg-primary text-white">Active</Badge>;
      }

      // For other milestones, check if previous milestone's due date has passed
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (isDueDatePassed(previousMilestone.dueDate)) {
        return <Badge className="bg-primary dark:text-green-800 text-white">Active</Badge>;
      }
      
      // If previous milestone's due date hasn't passed, it's upcoming
      return <Badge variant="secondary">Upcoming</Badge>;
    }

    // Default case
    return <Badge variant="secondary">Pending</Badge>;
  }

  const getEscrowStatusBadge = (status: string) => {
    // If any milestone is disputed, show disputed status
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // For full escrow, check if the single milestone is completed
    if (escrowOnChainDetails[0]?.requested && escrowOnChainDetails[0]?.released) {
      return <Badge variant="default">Completed</Badge>;
    }

    // If due date hasn't passed, it's active
    if (!isDueDatePassed(escrowOnChainDetails[0]?.dueDate)) {
      return <Badge className="bg-primary text-white">Active</Badge>;
    }

    // Default case
    return <Badge variant="secondary">Pending</Badge>;
  }

  console.log("escrowDetails-gotem-details", escrowDetails, escrowOnChainDetails, escrow)

  return (
    <>
      <div className="space-y-6 pt-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#BB7333]/20" />
          {escrowDetails?.escrow?.payment_type === "full" ? (

            <div key={escrowDetails?.escrow?.__v} className="relative pl-12 pb-8">
              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
                {getStatusIcon(escrowDetails?.escrow?.status, escrowOnChainDetails[0], 0)}
              </div>
              <Collapsible
                open={openMilestones[escrowDetails?.escrow?.__v]}
                onOpenChange={() => toggleMilestone(escrowDetails.escrow.__v?.toString())}
              >
                <Card className="relative">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{"Escrow"}</CardTitle>
                          {getEscrowStatusBadge(escrowDetails?.escrow?.status)}
                        </div>
                        {openMilestones['1'] ? (
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
                            <span className="font-medium">{escrowOnChainDetails[0]?.amount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Due Date:</span>
                            <span className="font-medium">
                              {formatDate(escrowOnChainDetails[0]?.dueDate)}
                            </span>
                          </div>
                          {/* {milestone.completedAt && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completed:</span>
                                <span className="font-medium">
                                  {format(new Date(milestone.completedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            )} */}
                        </div>
                        {!escrowOnChainDetails[0].requested ? (
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (userType === "creator") {
                                  if (isDueDatePassed(escrowOnChainDetails[0].dueDate) && isDisputePeriodOver(escrowOnChainDetails[0].dueDate)) {
                                    handleClaimAmount(escrowDetails.escrow.escrow_contract_address, escrowOnChainDetails[0].id)
                                  }
                                } else {
                                  handlePayout(escrowDetails.escrow.escrow_contract_address, escrowOnChainDetails[0].id)
                                }
                              }}
                              disabled={userType === "creator" && (!isDueDatePassed(escrowOnChainDetails[0].dueDate) || !isDisputePeriodOver(escrowOnChainDetails[0].dueDate)) || loadingPayout[escrowOnChainDetails[0].id]}
                            >
                              {loadingPayout[escrowOnChainDetails[0].id] ? "Processing..." : 
                               userType === "creator" ? 
                                 getClaimButtonState(escrowOnChainDetails[0]).text
                                 : "Request Payout"}
                            </Button>
                            {userType === "creator" && !escrowOnChainDetails[0].requested && (
                              <p className="text-sm text-gray-500 text-center">
                                {getClaimButtonState(escrowOnChainDetails[0]).message}
                              </p>
                            )}
                            {renderDisputeButton(escrowOnChainDetails[0])}
                          </div>
                        ) : escrowOnChainDetails[0].requested && !escrowOnChainDetails[0].released && !escrowOnChainDetails[0].rejected && userType === "creator" ? (
                          <Button
                            size="sm"
                            className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePaymentRelease(escrowDetails.escrow.escrow_contract_address, escrowOnChainDetails[0].id)
                            }}
                            disabled={loadingPayout[escrowOnChainDetails[0].id]}
                          >
                            {loadingPayout[escrowOnChainDetails[0].id] ? "Processing..." : "Release Payment"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full bg-gray-400 cursor-not-allowed"
                          >
                            {escrowOnChainDetails[0].released ? "Payment Released" : 
                             escrowOnChainDetails[0].rejected ? "Payment Rejected" : 
                             escrowOnChainDetails[0].requested ? "Payment Requested" : "Payment Released"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

          ) : (
            escrowOnChainDetails.map((milestone: ContractMilestone, index: number) => (
              <div key={milestone.id} className="relative pl-12 pb-8">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
                  {getStatusIcon(escrowDetails?.milestones[index].status, milestone, index)}
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
                            <CardTitle className="text-lg">
                              {escrowDetails?.milestones[index].description ? 
                                escrowDetails?.milestones[index].description : 
                                `Milestone ${index + 1}`}
                            </CardTitle>
                            {getStatusBadge(escrowDetails?.milestones[index].status, milestone, index)}
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
                                {formatDate(milestone.dueDate)}
                              </span>
                            </div>
                            {escrowDetails?.milestones[index].createdAt && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completed:</span>
                                <span className="font-medium">
                                  {escrowDetails?.milestones[index].createdAt}
                                </span>
                              </div>
                            )}
                          </div>
                          {!milestone.requested ? (
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (userType === "creator") {
                                    if (isDueDatePassed(milestone.dueDate) && isDisputePeriodOver(milestone.dueDate)) {
                                      handleClaimAmount(escrowDetails.escrow.escrow_contract_address, milestone.id)
                                    }
                                  } else {
                                    handlePayout(escrowDetails.escrow.escrow_contract_address, milestone.id)
                                  }
                                }}
                                disabled={userType === "creator" && (!isDueDatePassed(milestone.dueDate) || !isDisputePeriodOver(milestone.dueDate)) || loadingPayout[milestone.id]}
                              >
                                {loadingPayout[milestone.id] ? "Processing..." : 
                                 userType === "creator" ? 
                                   getClaimButtonState(milestone).text
                                   : "Request Payout"}
                              </Button>
                              {userType === "creator" && !milestone.requested && (
                                <p className="text-sm text-gray-500 text-center">
                                  {getClaimButtonState(milestone).message}
                                </p>
                              )}
                              {renderDisputeButton(milestone)}
                            </div>
                          ) : milestone.requested && !milestone.released && !milestone.rejected && userType === "creator" ? (
                            <Button
                              size="sm"
                              className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePaymentRelease(escrowDetails.escrow.escrow_contract_address, milestone.id)
                              }}
                              disabled={loadingPayout[milestone.id]}
                            >
                              {loadingPayout[milestone.id] ? "Processing..." : "Release Payment"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full bg-gray-400 cursor-not-allowed"
                            >
                              {milestone.released ? "Payment Released" : 
                               milestone.rejected ? "Payment Rejected" : 
                               milestone.requested ? "Payment Requested" : "Payment Released"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter the reason for dispute..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="min-h-[100px] border-[#BB7333]/50 focus:ring-[#BB7333] focus:border-[#BB7333]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisputeModalOpen(false);
                setDisputeReason("");
              }}
              className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMilestone) {
                  handleRaiseDispute(escrowDetails.escrow.escrow_contract_address, selectedMilestone.id);
                }
              }}
              disabled={!disputeReason.trim() || loadingPayout[selectedMilestone?.id || '']}
              className="bg-[#BB7333] hover:bg-[#965C29] text-white"
            >
              {loadingPayout[selectedMilestone?.id || ''] ? "Processing..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 