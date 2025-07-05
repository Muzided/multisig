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
import { dateToUnix } from "../../../utils/helper"
import { fetchTransactionDetails } from "@/services/Api/escrow/escrow"
import { TransactionDetailsResponse } from "@/types/escrow"
import { Skeleton } from "@/components/ui/skeleton"
import { Receipt, Calendar, Hash, User, DollarSign, ArrowRight, ExternalLink } from "lucide-react"

const formatDate = (timestamp: string | number | undefined) => {
  if (!timestamp) return "N/A"
  try {
    const date = new Date(Number(timestamp) * 1000)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, "MMM d, yyyy hh:mm a")
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

export function EscrowMilestoneTracker({ escrowDetails, escrowOnChainDetails, userType }: EscrowMilestoneTrackerProps) {
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})
  const [loadingPayout, setLoadingPayout] = useState<Record<string, boolean>>({})

  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [releasePaymentModalOpen, setReleasePaymentModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<ContractMilestone | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [nextMilestoneDueDate, setNextMilestoneDueDate] = useState<Date | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetailsResponse | null>(null)
  const [loadingTransaction, setLoadingTransaction] = useState(false)
  //use hooks
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
      await claimUnRequestedAmounts(escrowAddress, milestoneId)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error claiming amount:", error)
      handleError(error);
    }
  }, [claimUnRequestedAmounts]);

  const handlePayout = useCallback(async (escrowAddress: string, milestoneId: string, amount: string, receiver_wallet_address: string, escrowType: string) => {
    try {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
      const res = await requestPayment(escrowAddress, milestoneId, amount, receiver_wallet_address, escrowType)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error requesting payment:", error)
      handleError(error);
    }
  }, [requestPayment]);

  const handlePaymentRelease = useCallback(async (escrowAddress: string, milestoneId: string, amount: string, receiver_wallet_address: string, escrowType: string) => {
    try {
      if (!nextMilestoneDueDate) {
        toast.error("Please select a due date for the next milestone");
        return;
      }

      // Convert the date to Unix timestamp (seconds)
      const unixTimestamp = Math.floor(nextMilestoneDueDate.getTime() / 1000).toString();
      console.log("unixTimestamp", unixTimestamp)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
      const res = await releasePayment(escrowAddress, milestoneId, amount, unixTimestamp, receiver_wallet_address, escrowType)
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      setReleasePaymentModalOpen(false)
      setNextMilestoneDueDate(null)
    } catch (error) {
      setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
      console.error("Error requesting payment:", error)
      handleError(error);
    }
  }, [releasePayment, nextMilestoneDueDate]);

  const handleRaiseDispute = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      if (!disputeReason.trim()) {
        toast.error("Please provide a reason for the dispute");
        return;
      }

      setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }));
      await raiseDispute(escrowAddress, milestoneId, disputeReason, escrowDetails.escrow.payment_type);
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

  const openReleasePaymentModal = (milestone: ContractMilestone) => {
    setSelectedMilestone(milestone);
    // Set default date to 24 hours from now
    const defaultDate = new Date();
    //defaultDate.setHours(defaultDate.getHours() + 24);
    defaultDate.setHours(defaultDate.getHours());
    setNextMilestoneDueDate(defaultDate);
    setReleasePaymentModalOpen(true);
  };

  const openTransactionModal = async (milestone: ContractMilestone, index: number) => {
    setSelectedMilestone(milestone);
    setTransactionModalOpen(true);
    setLoadingTransaction(true);
    setTransactionDetails(null);

    try {
      const response = await fetchTransactionDetails(
        escrowDetails.escrow.escrow_contract_address,
        index,
        "payment_released"
      );
      setTransactionDetails(response.data);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      toast.error("Failed to fetch transaction details");
    } finally {
      setLoadingTransaction(false);
    }
  };



  const toggleMilestone = useCallback((milestoneId: string) => {
    setOpenMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }))
  }, []);

  const getStatusIcon = (status: string, milestone: ContractMilestone, index: number) => {
    // Check if milestone is completed (released)
    if (milestone.released) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />
    }

    // Check if milestone is in dispute
    if (milestone.disputedRaised) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if any milestone is disputed - show dispute icon for all milestones after dispute
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
    }

    // Check if milestone is pending (previous milestone is not completed)
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.released) {
        return <Clock className="h-6 w-6 text-gray-400" />
      }
    }

    // Check if milestone is active or upcoming based on due dates and previous milestone status
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone
      if (index === 0) {
        return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      }

      // For other milestones, check if previous milestone is released
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (previousMilestone.released) {
        return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
      }

      return <Clock className="h-6 w-6 text-gray-400" />
    }

    // Default case (pending)
    return <Clock className="h-6 w-6 text-gray-400" />
  }

  const getStatusBadge = (status: string, milestone: ContractMilestone, index: number) => {
    // Check if milestone is completed (released)
    if (milestone.released) {
      return <Badge variant="default">Payment Released</Badge>;
    }

    // Check if milestone is in dispute
    if (milestone.disputedRaised) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if any milestone is disputed - show dispute status for all milestones after dispute
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return <Badge variant="destructive">Disputed</Badge>;
    }

    // Check if milestone is pending (previous milestone is not completed)
    if (index > 0) {
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (!previousMilestone.released) {
        return <Badge variant="secondary">Pending</Badge>;
      }
    }

    // Check if milestone is upcoming or active based on due dates
    if (!isDueDatePassed(milestone.dueDate)) {
      // For first milestone, check if it's active
      if (index === 0) {
        return <Badge>Active</Badge>;
      }

      // For other milestones, check if previous milestone is released
      const previousMilestone = escrowOnChainDetails[index - 1];
      if (previousMilestone.released) {
        return <Badge className="bg-primary dark:text-green-800 text-white">Active</Badge>;
      }

      // If previous milestone is not released, it's upcoming
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

    // For full escrow, check if the single milestone is completed (released)
    if (escrowOnChainDetails[0]?.released) {
      return <Badge variant="default">Payment Released</Badge>;
    }

    // If due date hasn't passed, it's active
    if (!isDueDatePassed(escrowOnChainDetails[0]?.dueDate)) {
      return <Badge className="">Active</Badge>;
    }

    // Default case
    return <Badge variant="secondary">Pending</Badge>;
  }
  const renderDisputeButton = (milestone: ContractMilestone) => {
    // Don't show dispute button if dispute is already raised
    if (milestone.disputedRaised) {
      return null;
    }
    if (milestone.released) {
      return null
    }

    // Show dispute button if due date has passed and dispute period hasn't ended
    if (isDueDatePassed(milestone.dueDate) && !isDisputePeriodOver(milestone.dueDate)) {
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
  };
  const renderActionButtons = (milestone: ContractMilestone) => {
    // If milestone is released, show payment released status
    if (milestone.released) {
      return (
        <Button
          size="sm"
          className="w-full bg-gray-400 cursor-not-allowed"
        >
          Payment Released
        </Button>
      );
    }

    // Check if any milestone is disputed
    const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
    if (isAnyMilestoneDisputed) {
      return (
        <Button
          size="sm"
          className="w-full bg-gray-400 cursor-not-allowed"
        >
          Escrow in Dispute
        </Button>
      );
    }

    // If milestone is not active yet (dueDate is 0), don't show any action buttons
    if (Number(milestone.dueDate) === 0) {
      return (
        <Button
          size="sm"
          className="w-full bg-gray-400 cursor-not-allowed"
        >
          Not Active Yet
        </Button>
      );
    }
    // user forgot to request payment and due date has passed
    if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && !milestone.requested) {
      return (
        <div className="space-y-2">
          {renderDisputeButton(milestone)}
          {!milestone.requested && isDueDatePassed(milestone.dueDate) && (
            <p className="text-sm text-gray-500 text-center">
              {getClaimButtonState(milestone).message}
            </p>
          )}
        </div>
      )
    }
    // user requested the payment but the creator has not released the payment
    else if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
      return (
        <div className="space-y-2">
          {renderDisputeButton(milestone)}
          {!milestone.released && isDueDatePassed(milestone.dueDate) && (
            <p className="text-sm text-gray-500 text-center">
              {getClaimButtonState(milestone).message}
            </p>
          )}
        </div>
      )
    }
    else if (userType === "creator" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
      return (
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
                handlePayout(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.amount, escrowDetails.escrow.receiver_walletaddress, escrowDetails.escrow.payment_type)
              }
            }}
            disabled={userType === "creator" && (!isDueDatePassed(milestone.dueDate) || !isDisputePeriodOver(milestone.dueDate)) || loadingPayout[milestone.id]}
          >
            {loadingPayout[milestone.id] ? "Processing..." :
              userType === "creator" ?
                getClaimButtonState(milestone).text
                : "Request Payout"}
          </Button>
          {milestone.requested && isDueDatePassed(milestone.dueDate) && (
            <p className="text-sm text-gray-500 text-center">
              {getClaimButtonState(milestone).message}
            </p>
          )}

        </div>
      );
    }
    else if (!milestone.requested && !milestone.released) {
      return (
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
                handlePayout(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.amount, escrowDetails.escrow.receiver_walletaddress, escrowDetails.escrow.payment_type)
              }
            }}
            disabled={userType === "creator" && (!isDueDatePassed(milestone.dueDate) || !isDisputePeriodOver(milestone.dueDate)) || loadingPayout[milestone.id]}
          >
            {loadingPayout[milestone.id] ? "Processing..." :
              userType === "creator" ?
                getClaimButtonState(milestone).text
                : "Request Payout"}
          </Button>
          {!milestone.requested && isDueDatePassed(milestone.dueDate) && (
            <p className="text-sm text-gray-500 text-center">
              {getClaimButtonState(milestone).message}
            </p>
          )}

        </div>
      );
    } else if (milestone.requested && !milestone.released && !isDueDatePassed(milestone.dueDate) && !milestone.rejected && userType === "creator") {
      return (
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            onClick={(e) => {
              e.stopPropagation()
              openReleasePaymentModal(milestone)
            }}
            disabled={loadingPayout[milestone.id]}
          >
            {loadingPayout[milestone.id] ? "Processing..." : "Release Payment"}
          </Button>
          {/* {renderDisputeButton(milestone)} */}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-gray-400 cursor-not-allowed"
          >
            {milestone.rejected ? "Payment Rejected" :
              milestone.requested ? "Payment Requested" :
                isDueDatePassed(milestone.dueDate) ? "In Dispute Period" : "Payment Released"}
          </Button>
          {renderDisputeButton(milestone)}
        </div>
      );
    }
  };

  console.log("escrowDetails-gotem-details", escrowOnChainDetails, escrowDetails)

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
                          {escrowOnChainDetails[0]?.released && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Released:</span>
                              <span className="font-medium text-green-600">
                                {formatDate(escrowOnChainDetails[0]?.requestTime || escrowOnChainDetails[0]?.dueDate)}
                              </span>
                            </div>
                          )}
                          {/* {milestone.completedAt && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Completed:</span>
                                <span className="font-medium">
                                  {format(new Date(milestone.completedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            )} */}
                        </div>
                        <div className="flex flex-col gap-2">
                          {renderActionButtons(escrowOnChainDetails[0])}
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 py-1.5 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTransactionModal(escrowOnChainDetails[0], 0);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
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
                          {milestone.released && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Released:</span>
                              <span className="font-medium text-green-600">
                                {formatDate(milestone.requestTime || milestone.dueDate)}
                              </span>
                            </div>
                          )}

                          </div>
                          <div className="flex flex-col gap-2">
                            {renderActionButtons(milestone)}
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 py-1.5 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTransactionModal(milestone, index);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
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

      <Dialog open={releasePaymentModalOpen} onOpenChange={setReleasePaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Next Milestone Due Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date (minimum 24 hours from now)</label>
              <input
                type="datetime-local"
                value={nextMilestoneDueDate ? format(nextMilestoneDueDate, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const now = new Date();
                  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

                  // if (selectedDate < minDate) {
                  //   toast.error("Due date must be at least 24 hours from now");
                  //   return;
                  // }
                  setNextMilestoneDueDate(selectedDate);
                }}
                min={format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")}
                className="w-full p-2 border rounded-md border-[#BB7333]/50 focus:ring-[#BB7333] focus:border-[#BB7333]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReleasePaymentModalOpen(false);
                setNextMilestoneDueDate(null);
              }}
              className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMilestone) {
                  handlePaymentRelease(
                    escrowDetails.escrow.escrow_contract_address,
                    selectedMilestone.id,
                    selectedMilestone.amount,
                    escrowDetails.escrow.receiver_walletaddress,
                    escrowDetails.escrow.payment_type

                  );
                }
              }}
              disabled={!nextMilestoneDueDate || loadingPayout[selectedMilestone?.id || '']}
              className="bg-[#BB7333] hover:bg-[#965C29] text-white"
            >
              {loadingPayout[selectedMilestone?.id || ''] ? "Processing..." : "Release Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#BB7333]" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          
          {loadingTransaction ? (
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
          ) : transactionDetails ? (
            <div className="space-y-6 py-4">
              {/* Receipt Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300">Payment Receipt</h3>
                <p className="text-sm text-gray-300">
                  {transactionDetails.transactions[0]?.transaction_type?.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {transactionDetails.transactions.map((transaction, index) => (
                  <div key={transaction._id} className="space-y-4">
                    {/* Amount Section */}
                    <div className="text-center py-4 border-b border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-gray-900">
                          ${transaction.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Amount Paid</p>
                    </div>

                    {/* Transaction Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                        </div>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transaction.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1 transition-colors"
                        >
                          {transaction.transaction_hash.substring(0, 8)}...{transaction.transaction_hash.substring(transaction.transaction_hash.length - 8)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Date</span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {format(new Date(transaction.transaction_date), "MMM d, yyyy 'at' hh:mm a")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">User</span>
                        </div>
                        <span className="text-sm text-gray-900 font-mono">
                          {transaction.user_id.wallet_address.substring(0, 6)}...{transaction.user_id.wallet_address.substring(transaction.user_id.wallet_address.length - 4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Milestone</span>
                        </div>
                        <span className="text-sm text-gray-900">
                          #{transaction.milestone_index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Contract */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Escrow Contract</span>
                        <span className="text-sm text-gray-900 font-mono">
                          {transaction.escrow_contract_address.substring(0, 6)}...{transaction.escrow_contract_address.substring(transaction.escrow_contract_address.length - 4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Transaction ID: {transactionDetails.transactions[0]?._id}
                </p>
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
    </>
  )
} 