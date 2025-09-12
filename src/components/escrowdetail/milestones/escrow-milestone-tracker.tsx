// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { format, addHours, differenceInHours, differenceInMinutes } from "date-fns"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { useState, useEffect, useMemo, useCallback } from "react"
// import { useFactory } from "@/Hooks/useFactory"
// import { ContractMilestone } from "@/types/contract"
// import { getEscrowDetailsResponse } from "@/types/escrow"
// import { useEscrow } from "@/Hooks/useEscrow"
// import { useEscrowSocket } from "@/Hooks/useEscrowSocket"
// import { useEscrowRefresh } from "@/context/EscrowContext"
// import { useUser } from "@/context/userContext"
// import { handleError } from "../../../../utils/errorHandler"
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { toast } from "react-toastify"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Textarea } from "@/components/ui/textarea"
// import { dateToUnix } from "../../../../utils/helper"
// import { fetchTransactionDetails } from "@/services/Api/escrow/escrow"
// import { TransactionDetailsResponse } from "@/types/escrow"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Receipt, Calendar, Hash, User, DollarSign, ArrowRight, ExternalLink } from "lucide-react"

// const formatDate = (timestamp: string | number | undefined) => {
//   if (!timestamp) return "N/A"
//   try {
//     const date = new Date(Number(timestamp) * 1000)
//     if (isNaN(date.getTime())) return "Invalid Date"
//     return format(date, "MMM d, yyyy hh:mm a")
//   } catch (error) {
//     return "Invalid Date"
//   }
// }

// interface EscrowMilestoneTrackerProps {

//   escrowDetails: getEscrowDetailsResponse
//   escrowOnChainDetails: ContractMilestone[]
//   userType: string
// }

// // Separate component for countdown timer
// const CountdownTimer = ({ dueDate, windowSeconds }: { dueDate: string | number; windowSeconds: number }) => {
//   const [timeLeft, setTimeLeft] = useState<string>("");

//   useEffect(() => {
//     const updateTime = () => {
//       const currentDate = Math.floor(Date.now() / 1000);
//       const disputeEndTime = Number(dueDate) + Number(windowSeconds);
//       const remainingSeconds = disputeEndTime - currentDate;

//       if (remainingSeconds <= 0) {
//         setTimeLeft("Dispute period ended");
//         return;
//       }

//       const hours = Math.floor(remainingSeconds / 3600);
//       const minutes = Math.floor((remainingSeconds % 3600) / 60);
//       const seconds = Math.floor(remainingSeconds % 60);

//       setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
//     };

//     updateTime();
//     const interval = setInterval(updateTime, 1000);

//     return () => clearInterval(interval);
//   }, [dueDate, windowSeconds]);

//   return <span>{timeLeft}</span>;
// };

// export function EscrowMilestoneTracker({ escrowDetails, escrowOnChainDetails, userType }: EscrowMilestoneTrackerProps) {
//   const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})
//   const [loadingPayout, setLoadingPayout] = useState<Record<string, boolean>>({})
//   const now = new Date();
//   const [selectedDate, setSelectedDate] = useState<Date>(now);
//   const [disputeModalOpen, setDisputeModalOpen] = useState(false)
//   const [releasePaymentModalOpen, setReleasePaymentModalOpen] = useState(false)
//   const [selectedMilestone, setSelectedMilestone] = useState<ContractMilestone | null>(null)
//   const [disputeReason, setDisputeReason] = useState("")
//   const [nextMilestoneDueDate, setNextMilestoneDueDate] = useState<Date | null>(null)
//   const [transactionModalOpen, setTransactionModalOpen] = useState(false)
//   const [transactionDetails, setTransactionDetails] = useState<TransactionDetailsResponse | null>(null)
//   const [loadingTransaction, setLoadingTransaction] = useState(false)
//   const [setDueDateModalOpen, setSetDueDateModalOpen] = useState(false);
//   const [disputeWindowSeconds, setDisputeWindowSeconds] = useState<number>(48 * 60 * 60);
//   //use hooks
//   const { requestPayment, setMileStoneDueDate, releasePayment, claimUnRequestedAmounts, raiseDispute, fetchDisputeWindowEscrow } = useEscrow()
//   const { triggerRefresh } = useEscrowRefresh()
//   const { user } = useUser()

//   useEffect(() => {
//     initDisputeWindow()
//   }, [])
//   console.log("disputeWindowSeconds", disputeWindowSeconds)
//   const isDueDatePassed = useCallback((dueDate: string | number) => {
//     const currentDate = Math.floor(Date.now() / 1000);
//     return Number(dueDate) < currentDate;
//   }, []);
//   const initDisputeWindow = async () => {
//     try {
//       const disputeWindow = await fetchDisputeWindowEscrow(escrowDetails.escrow.escrow_contract_address)
//       if (disputeWindow) {
//         setDisputeWindowSeconds(disputeWindow)
//       }
//     } catch (error) {
//       console.error("Error fetching dispute window:", error)
//     }
//   }
//   const isDisputePeriodOver = useCallback((dueDate: string | number) => {
//     // If you have an async fetch like fetchDisputeWindow(), set the result into disputeWindowSeconds state.
//     const currentDate = Math.floor(Date.now() / 1000);
//     const disputeEndTime = Number(dueDate) + Number(disputeWindowSeconds);
//     return currentDate > disputeEndTime;
//   }, [disputeWindowSeconds]);

//   const getClaimButtonState = useCallback((milestone: ContractMilestone, userType: string) => {
//     if (!isDueDatePassed(milestone.dueDate)) {
//       return {
//         text: "Not Requested",
//         disabled: true,
//         message: "Waiting for due date"
//       };
//     }

//     if (!milestone.requested) {
//       return userType === "creator"
//         ? { text: "Claim Amount", disabled: false, message: "Receiver did not request payout" }
//         : { text: "Amount Reverted", disabled: true, message: "You didn’t request payout in time" };
//     }

//     if (!isDisputePeriodOver(milestone.dueDate)) {
//       return {
//         text: "In Dispute Period",
//         disabled: true,
//         message: <CountdownTimer dueDate={milestone.dueDate} windowSeconds={disputeWindowSeconds} />
//       };
//     }

//     // After dispute period ends, show different messages based on user type
//     if (userType === "creator") {
//       return {
//         text: "Claim Amount",
//         disabled: false,
//         message: "eligible for claim"
//       };
//     } else {
//       return {
//         text: "Amount Reverted",
//         disabled: true,
//         message: "Amounts reverted to creator"
//       };
//     }
//   }, [isDueDatePassed, isDisputePeriodOver, disputeWindowSeconds]);

//   const handleClaimAmount = useCallback(async (escrowAddress: string, milestoneId: string, milestoneRequested: boolean, receiver_wallet_address: string, amount: string, escrowType: string) => {
//     try {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
//       await claimUnRequestedAmounts(escrowAddress, milestoneId, milestoneRequested, receiver_wallet_address, amount, escrowType)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//     } catch (error) {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       console.error("Error claiming amount:", error)
//       handleError(error);
//     }
//   }, [claimUnRequestedAmounts]);

//   const handlePayout = useCallback(async (escrowAddress: string, milestoneId: string, amount: string, receiver_wallet_address: string, escrowType: string) => {
//     try {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
//       const res = await requestPayment(escrowAddress, milestoneId, amount, receiver_wallet_address, escrowType)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//     } catch (error) {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       console.error("Error requesting payment:", error)
//       handleError(error);
//     }
//   }, [requestPayment]);

//   const handlePaymentRelease = useCallback(async (escrowAddress: string, milestoneId: string, amount: string, receiver_wallet_address: string, escrowType: string) => {
//     try {
//       // Check if this is the last milestone
//       const isLast = selectedMilestone && isLastMilestone(selectedMilestone);

//       if (!isLast && !nextMilestoneDueDate) {
//         toast.error("Please select a due date for the next milestone");
//         return;
//       }

//       // For last milestone, pass 0, otherwise convert the date to Unix timestamp
//       const unixTimestamp = isLast ? "0" : Math.floor(nextMilestoneDueDate!.getTime() / 1000).toString();
//       console.log("unixTimestamp", unixTimestamp)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
//       const res = await releasePayment(escrowAddress, milestoneId, amount, unixTimestamp, receiver_wallet_address, escrowType)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       setReleasePaymentModalOpen(false)

//       setNextMilestoneDueDate(null)
//     } catch (error) {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       console.error("Error requesting payment:", error)
//       handleError(error);
//     }
//   }, [releasePayment, nextMilestoneDueDate, selectedMilestone]);


//   const handleSetMilestoneDueDate = useCallback(async (escrowAddress: string, milestoneId: string, amount: string, receiver_wallet_address: string, escrowType: string) => {
//     try {


//       // For last milestone, pass 0, otherwise convert the date to Unix timestamp
//       const unixTimestamp = Math.floor(nextMilestoneDueDate!.getTime() / 1000).toString();
//       console.log("unixTimestamp", unixTimestamp)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }))
//       const res = await setMileStoneDueDate(escrowAddress, milestoneId, amount, unixTimestamp, receiver_wallet_address, escrowType)
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       setSetDueDateModalOpen(false);
//       setNextMilestoneDueDate(null)
//     } catch (error) {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }))
//       console.error("Error requesting payment:", error)
//       handleError(error);
//     }
//   }, [releasePayment, nextMilestoneDueDate, selectedMilestone]);


//   const handleRaiseDispute = useCallback(async (escrowAddress: string, milestoneId: string) => {
//     try {
//       if (!disputeReason.trim()) {
//         toast.error("Please provide a reason for the dispute");
//         return;
//       }

//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: true }));
//       await raiseDispute(escrowAddress, milestoneId, disputeReason, escrowDetails.escrow.payment_type);
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }));
//       setDisputeModalOpen(false);
//       setDisputeReason("");

//     } catch (error) {
//       setLoadingPayout(prev => ({ ...prev, [milestoneId]: false }));
//       console.error("Error raising dispute:", error);
//       handleError(error);
//     }
//   }, [raiseDispute, disputeReason]);

//   const openDisputeModal = (milestone: ContractMilestone) => {
//     setSelectedMilestone(milestone);
//     setDisputeModalOpen(true);
//   };

//   // Function to check if milestone is the last one
//   const isLastMilestone = (milestone: ContractMilestone) => {
//     const milestoneIndex = escrowOnChainDetails.findIndex(m => m.id === milestone.id);
//     return milestoneIndex === escrowOnChainDetails.length - 1;
//   };

//   const openReleasePaymentModal = (milestone: ContractMilestone) => {
//     setSelectedMilestone(milestone);

//     // If it's the last milestone, set due date to null (will be passed as 0)
//     if (isLastMilestone(milestone)) {
//       setNextMilestoneDueDate(null);
//     } else {
//       // Set default date to 24 hours from now for non-last milestones
//       const defaultDate = new Date();
//       defaultDate.setHours(defaultDate.getHours());
//       setNextMilestoneDueDate(defaultDate);
//     }

//     setReleasePaymentModalOpen(true);
//   };

//   const openTransactionModal = async (milestone: ContractMilestone, index: number) => {
//     setSelectedMilestone(milestone);
//     setTransactionModalOpen(true);
//     setLoadingTransaction(true);
//     setTransactionDetails(null);

//     try {
//       const response = await fetchTransactionDetails(
//         escrowDetails.escrow.escrow_contract_address,
//         index,
//         "payment_released"
//       );
//       console.log("tansaction-details", transactionDetails)
//       setTransactionDetails(response.data);
//     } catch (error) {
//       console.error("Error fetching transaction details:", error);
//       toast.error("Failed to fetch transaction details");
//     } finally {
//       setLoadingTransaction(false);
//     }
//   };

//   // Add a function to open the set due date modal
//   const openSetDueDateModal = (milestone: ContractMilestone) => {
//     setSelectedMilestone(milestone);
//     setSelectedDate(new Date());
//     setSetDueDateModalOpen(true);
//   };


//   const toggleMilestone = useCallback((milestoneId: string) => {
//     setOpenMilestones(prev => ({
//       ...prev,
//       [milestoneId]: !prev[milestoneId]
//     }))
//   }, []);

//   const getStatusIcon = (status: string, milestone: ContractMilestone, index: number) => {
//     // Check if milestone is completed (released)
//     if (milestone.released) {
//       return <CheckCircle2 className="h-6 w-6 text-green-500" />
//     }

//     // Check if milestone is in dispute
//     if (milestone.disputedRaised) {
//       return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
//     }

//     // Check if any milestone is disputed - show dispute icon for all milestones after dispute
//     const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised && !m.released);
//     console.log("xxxx-xx", isAnyMilestoneDisputed)
//     if (isAnyMilestoneDisputed) {
//       return <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
//     }

//     // Check if milestone is pending (previous milestone is not completed)
//     if (index > 0) {
//       const previousMilestone = escrowOnChainDetails[index - 1];
//       if (!previousMilestone.released) {
//         return <Clock className="h-6 w-6 text-gray-400" />
//       }
//     }

//     // Check if milestone is active or upcoming based on due dates and previous milestone status
//     if (!isDueDatePassed(milestone.dueDate)) {
//       // For first milestone
//       if (index === 0) {
//         return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
//       }

//       // For other milestones, check if previous milestone is released
//       const previousMilestone = escrowOnChainDetails[index - 1];
//       if (previousMilestone.released) {
//         return <Circle className="h-6 w-6 text-green-700 animate-pulse" />
//       }

//       return <Clock className="h-6 w-6 text-gray-400" />
//     }

//     // Default case (pending)
//     return <Clock className="h-6 w-6 text-gray-400" />
//   }

//   const getStatusBadge = (status: string, milestone: ContractMilestone, index: number) => {
//     // If escrow is terminated, show Disputed Payment Released for all milestones
//     if ((escrowDetails as any)?.escrow?.status === "terminated" || (escrowDetails as any)?.status === "terminated") {
//       return <Badge variant="default">Disputed Payment Released</Badge>;
//     }

//     const isDisputed = escrowOnChainDetails.some(m => m.disputedRaised && !m.released);

//     // Check if milestone is completed (released)
//     if (milestone.disputedRaised && milestone.released) {
//       return <Badge variant="default">Disputed Payment Released</Badge>;
//     }
//     if (!milestone.dueDate && userType === "creator" && !isDisputed) {
//       return <Badge variant="default">Set Due Date</Badge>;
//     }

//     if (!milestone.dueDate && userType === "receiver" && !isDisputed) {
//       return <Badge variant="default">Due Date Not Set</Badge>;
//     }

//     if (milestone.released) {
//       return <Badge variant="default">Payment Released</Badge>;
//     }

//     // Check if milestone is in dispute
//     if (milestone.disputedRaised) {
//       return <Badge variant="destructive">Disputed</Badge>;
//     }

//     // Check if any milestone is disputed - show dispute status for all milestones after dispute
//     const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
//     if (milestone.disputedRaised) {
//       return <Badge variant="destructive">Disputed</Badge>;
//     }

//     // Check if milestone is pending (previous milestone is not completed)
//     if (index > 0) {
//       const previousMilestone = escrowOnChainDetails[index - 1];
//       if (!previousMilestone.released) {
//         return <Badge variant="secondary">Pending</Badge>;
//       }
//     }

//     // Check if milestone is upcoming or active based on due dates
//     if (!isDueDatePassed(milestone.dueDate)) {
//       // For first milestone, check if it's active
//       if (index === 0) {
//         return <Badge>Active</Badge>;
//       }

//       // For other milestones, check if previous milestone is released
//       const previousMilestone = escrowOnChainDetails[index - 1];
//       if (previousMilestone.released) {
//         return <Badge className="bg-primary dark:text-green-800 text-white">Active</Badge>;
//       }

//       // If previous milestone is not released, it's upcoming
//       return <Badge variant="secondary">Upcoming</Badge>;
//     }

//     // Default case
//     return <Badge variant="secondary">Pending</Badge>;
//   }

//   const getEscrowStatusBadge = (status: string) => {
//     // If any milestone is disputed, show disputed status
//     const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised);
//     if (isAnyMilestoneDisputed) {
//       return <Badge variant="destructive">Disputed</Badge>;
//     }

//     // For full escrow, check if the single milestone is completed (released)
//     if (escrowOnChainDetails[0]?.released) {
//       return <Badge variant="default">Payment Released</Badge>;
//     }

//     // If due date hasn't passed, it's active
//     if (!isDueDatePassed(escrowOnChainDetails[0]?.dueDate)) {
//       return <Badge className="">Active</Badge>;
//     }

//     // Default case
//     return <Badge variant="secondary">Pending</Badge>;
//   }
//   const renderDisputeButton = (milestone: ContractMilestone) => {
//     // Observer can only view, not perform actions
//     if (userType === "observer") {
//       return null;
//     }
//     // Only receivers can raise disputes
//     if (userType !== "receiver") {
//       return null;
//     }
//     // Don't show dispute button if dispute is already raised
//     if (milestone.disputedRaised) {
//       return null;
//     }
//     if (milestone.released) {
//       return null
//     }

//     // Receiver must have requested payout to be eligible to raise a dispute
//     if (!milestone.requested) {
//       return null;
//     }

//     // Show dispute button if due date has passed and dispute period hasn't ended
//     if (isDueDatePassed(milestone.dueDate) && !isDisputePeriodOver(milestone.dueDate)) {
//       return (
//         <Button
//           size="sm"
//           variant="destructive"
//           className="w-full mt-2 bg-[#BB7333] hover:bg-[#965C29] text-white"
//           onClick={(e) => {
//             e.stopPropagation();
//             openDisputeModal(milestone);
//           }}
//           disabled={loadingPayout[milestone.id]}
//         >
//           Raise Dispute
//         </Button>
//       );
//     }

//     return null;
//   };
//   const renderActionButtons = (milestone: ContractMilestone) => {
//     // Observer can only view, not perform actions
//     if (userType === "observer") {
//       return null;
//     }
//     // If escrow is terminated, no further actions are valid; show disabled Payment Released
//     if ((escrowDetails as any)?.escrow?.status === "terminated" || (escrowDetails as any)?.status === "terminated") {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-gray-400 cursor-not-allowed"
//         >
//           Payment Released
//         </Button>
//       );
//     }
//     const isAnyMilestoneDisputed = escrowOnChainDetails.some(m => m.disputedRaised && !m.released);
//     console.log("xxxx-xx", isAnyMilestoneDisputed)
//     //if milestone has no due date, add due date button
//     if (!milestone.dueDate && userType === "creator" && !isAnyMilestoneDisputed) {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
//           onClick={e => {
//             e.stopPropagation();
//             openSetDueDateModal(milestone);
//           }}
//         >
//           Set Milestone Due Date
//         </Button>
//       );
//     }

//     if (!milestone.dueDate && userType === "receiver" && !isAnyMilestoneDisputed) {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-gray-400 cursor-not-allowed"
//         >
//           Creator Hasn't Set Due Date
//         </Button>
//       );
//     }

//     // If milestone is released, show payment released status
//     if (milestone.released) {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-gray-400 cursor-not-allowed"
//         >
//           Payment Released
//         </Button>
//       );
//     }

//     // Check if any milestone is disputed

//     if (milestone.disputedRaised) {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-gray-400 cursor-not-allowed"
//         >
//           Escrow in Dispute
//         </Button>
//       );
//     }

//     // If milestone is not active yet (dueDate is 0), don't show any action buttons
//     if (Number(milestone.dueDate) === 0) {
//       return (
//         <Button
//           size="sm"
//           className="w-full bg-gray-400 cursor-not-allowed"
//         >
//           Not Active Yet
//         </Button>
//       );
//     }
//     // user forgot to request payment and due date has passed
//     if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && !milestone.requested) {
//       // Check if dispute period is over
//       if (isDisputePeriodOver(milestone.dueDate)) {
//         return (
//           <div className="space-y-2">
//             <Button
//               size="sm"
//               className="w-full bg-gray-400 cursor-not-allowed"
//               disabled={true}
//             >
//               Amount Reverted
//             </Button>
//             <p className="text-sm text-gray-500 text-center">
//               Amounts reverted to creator
//             </p>
//           </div>
//         );
//       }

//       return (
//         <div className="space-y-2">
//           {renderDisputeButton(milestone)}
//           {!milestone.requested && isDueDatePassed(milestone.dueDate) && (
//             <p className="text-sm text-gray-500 text-center">
//               {getClaimButtonState(milestone, userType).message}
//             </p>
//           )}
//         </div>
//       )
//     }
//     // user requested the payment but the creator has not released the payment
//     else if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
//       // Check if dispute period is over
//       if (isDisputePeriodOver(milestone.dueDate)) {
//         return (
//           <div className="space-y-2">
//             <Button
//               size="sm"
//               className="w-full bg-gray-400 cursor-not-allowed"
//               disabled={true}
//             >
//               Amount Reverted
//             </Button>
//             <p className="text-sm text-gray-500 text-center">
//               Amounts reverted to creator
//             </p>
//           </div>
//         );
//       }

//       return (
//         <div className="space-y-2">
//           {renderDisputeButton(milestone)}
//           {!milestone.released && isDueDatePassed(milestone.dueDate) && (
//             <p className="text-sm text-gray-500 text-center">
//               {getClaimButtonState(milestone, userType).message}
//             </p>
//           )}
//         </div>
//       )
//     }
//     else if (userType === "creator" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
//       return (
//         <div className="space-y-2">
//           <Button
//             size="sm"
//             className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
//             onClick={(e) => {
//               e.stopPropagation()
//               if (userType === "creator") {
//                 if (isDueDatePassed(milestone.dueDate) && isDisputePeriodOver(milestone.dueDate)) {
//                   handleClaimAmount(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.requested, escrowDetails.escrow.receiver_walletaddress, milestone.amount, escrowDetails.escrow.payment_type)
//                 }
//               } else {
//                 handlePayout(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.amount, escrowDetails.escrow.receiver_walletaddress, escrowDetails.escrow.payment_type)
//               }
//             }}
//             disabled={userType === "creator" && (!isDueDatePassed(milestone.dueDate) || (milestone.requested && !isDisputePeriodOver(milestone.dueDate))) || loadingPayout[milestone.id]}
//           >
//             {loadingPayout[milestone.id] ? "Processing..." :
//               userType === "creator" ?
//                 getClaimButtonState(milestone, userType).text
//                 : "Request Payout"}
//           </Button>
//           {milestone.requested && isDueDatePassed(milestone.dueDate) && (
//             <p className="text-sm text-gray-500 text-center">
//               {getClaimButtonState(milestone, userType).message}
//             </p>
//           )}

//         </div>
//       );
//     }
//     else if (!milestone.requested && !milestone.released) {
//       // Check if dispute period is over for both creator and receiver
//       if (isDisputePeriodOver(milestone.dueDate)) {
//         if (userType === "creator") {
//           return (
//             <div className="space-y-2">
//               <Button
//                 size="sm"
//                 className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   handleClaimAmount(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.requested, escrowDetails.escrow.receiver_walletaddress, milestone.amount, escrowDetails.escrow.payment_type)
//                 }}
//                 disabled={loadingPayout[milestone.id]}
//               >
//                 {loadingPayout[milestone.id] ? "Processing..." : "Claim Amount"}
//               </Button>
//               <p className="text-sm text-gray-500 text-center">
//                 Amounts reverted to creator
//               </p>
//             </div>
//           );
//         } else {
//           return (
//             <div className="space-y-2">
//               <Button
//                 size="sm"
//                 className="w-full bg-gray-400 cursor-not-allowed"
//                 disabled={true}
//               >
//                 Amount Reverted
//               </Button>
//               <p className="text-sm text-gray-500 text-center">
//                 Amounts reverted to creator
//               </p>
//             </div>
//           );
//         }
//       }

//       return (
//         <div className="space-y-2">
//           <Button
//             size="sm"
//             className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
//             onClick={(e) => {
//               e.stopPropagation()
//               if (userType === "creator") {
//                 if (isDueDatePassed(milestone.dueDate) && isDisputePeriodOver(milestone.dueDate)) {
//                   handleClaimAmount(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.requested, escrowDetails.escrow.receiver_walletaddress, milestone.amount, escrowDetails.escrow.payment_type)
//                 }
//               } else {
//                 handlePayout(escrowDetails.escrow.escrow_contract_address, milestone.id, milestone.amount, escrowDetails.escrow.receiver_walletaddress, escrowDetails.escrow.payment_type)
//               }
//             }}
//             disabled={userType === "creator" && (!isDueDatePassed(milestone.dueDate) || !isDisputePeriodOver(milestone.dueDate)) || loadingPayout[milestone.id]}
//           >
//             {loadingPayout[milestone.id] ? "Processing..." :
//               userType === "creator" ?
//                 getClaimButtonState(milestone, userType).text
//                 : "Request Payout"}
//           </Button>
//           {!milestone.requested && isDueDatePassed(milestone.dueDate) && (
//             <p className="text-sm text-gray-500 text-center">
//               {getClaimButtonState(milestone, userType).message}
//             </p>
//           )}

//         </div>
//       );
//     } else if (milestone.requested && !milestone.released && !isDueDatePassed(milestone.dueDate) && !milestone.rejected && userType === "creator") {
//       return (
//         <div className="space-y-2">
//           <Button
//             size="sm"
//             className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
//             onClick={(e) => {
//               e.stopPropagation()
//               openReleasePaymentModal(milestone)
//             }}
//             disabled={loadingPayout[milestone.id]}
//           >
//             {loadingPayout[milestone.id] ? "Processing..." : "Release Payment"}
//           </Button>
//           {/* {renderDisputeButton(milestone)} */}
//         </div>
//       );
//     } else {
//       return (
//         <div className="space-y-2">
//           <Button
//             size="sm"
//             className="w-full bg-gray-400 cursor-not-allowed"
//           >
//             {milestone.rejected ? "Payment Rejected" :
//               milestone.requested ? "Payment Requested" :
//                 isDueDatePassed(milestone.dueDate) ? "In Dispute Period" : "Payment Released"}
//           </Button>
//           {renderDisputeButton(milestone)}
//         </div>
//       );
//     }
//   };


//   const handleDateChange = (date: Date | null) => {
//     if (date) {
//       // Check if the selected date is at least 24 hours from now
//       const now = new Date();
//       const hoursDifference = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

//       // if (hoursDifference < 24) {
//       //   toast.error("Project duration must be at least 24 hours");
//       //   return;
//       // }

//       setSelectedDate(date);
//       setNextMilestoneDueDate(date);
//     }
//   };
//   console.log("esrow onchain and offchain details", escrowOnChainDetails, escrowDetails)


//   return (
//     <>
//       {/* Socket Connection Status Indicator */}
//       {/* {socketError && (
//         <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
//           Socket Error: {socketError}
//         </div>
//       )} */}
//       <div className="space-y-6 pt-6 "  >
//         <div className="relative">
//           <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#BB7333]/20" />
//           {escrowDetails?.escrow?.payment_type === "full" ? (
//             <div key={escrowDetails?.escrow?.__v} className="relative pl-12 pb-8">
//               <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
//                 {getStatusIcon(escrowDetails?.escrow?.status, escrowOnChainDetails[0], 0)}
//               </div>
//               <Collapsible
//                 open={openMilestones[escrowDetails?.escrow?.__v]}
//                 onOpenChange={() => toggleMilestone(escrowDetails.escrow.__v?.toString())}
//               >
//                 <Card className="relative">
//                   <CollapsibleTrigger className="w-full">
//                     <CardHeader className="pb-2">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <CardTitle className="text-lg">{"Escrow"}</CardTitle>
//                           {getEscrowStatusBadge(escrowDetails?.escrow?.status)}
//                         </div>
//                         {openMilestones['1'] ? (
//                           <ChevronUp className="h-4 w-4" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4" />
//                         )}
//                       </div>
//                     </CardHeader>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent>
//                     <CardContent>
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <div className="flex justify-between text-sm">
//                             <span className="text-gray-500">Amount:</span>
//                             <span className="font-medium">{escrowOnChainDetails[0]?.amount}</span>
//                           </div>
//                           <div className="flex justify-between text-sm">
//                             <span className="text-gray-500">Due Date:</span>
//                             <span className="font-medium">
//                               {formatDate(escrowOnChainDetails[0]?.dueDate)}
//                             </span>
//                           </div>

//                         </div>
//                         <div className="flex flex-col gap-2">
//                           {renderActionButtons(escrowOnChainDetails[0])}
//                           {escrowOnChainDetails[0]?.released && !(((escrowDetails as any)?.escrow?.status === "terminated") || ((escrowDetails as any)?.status === "terminated")) && (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="flex-1 py-1.5 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openTransactionModal(escrowOnChainDetails[0], 0);
//                               }}
//                             >
//                               View Details
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </CardContent>
//                   </CollapsibleContent>
//                 </Card>
//               </Collapsible>
//             </div>
//           ) : (
//             escrowOnChainDetails.map((milestone: ContractMilestone, index: number) => (
//               <div key={milestone.id} className="relative pl-12 pb-8">
//                 <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]">
//                   {getStatusIcon(escrowDetails?.milestones[index].status, milestone, index)}
//                 </div>
//                 <Collapsible
//                   open={openMilestones[milestone.id]}
//                   onOpenChange={() => toggleMilestone(milestone.id)}
//                 >
//                   <Card className="relative">
//                     <CollapsibleTrigger className="w-full">
//                       <CardHeader className="pb-2">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <CardTitle className="text-lg">
//                               {escrowDetails?.milestones[index].description ?
//                                 escrowDetails?.milestones[index].description :
//                                 `Milestone ${index + 1}`}
//                             </CardTitle>
//                             {getStatusBadge(escrowDetails?.milestones[index].status, milestone, index)}
//                           </div>
//                           {openMilestones[milestone.id] ? (
//                             <ChevronUp className="h-4 w-4" />
//                           ) : (
//                             <ChevronDown className="h-4 w-4" />
//                           )}
//                         </div>
//                       </CardHeader>
//                     </CollapsibleTrigger>
//                     <CollapsibleContent>
//                       <CardContent>
//                         <div className="space-y-4">
//                           <div className="space-y-2">
//                             <div className="flex justify-between text-sm">
//                               <span className="text-gray-500">Amount:</span>
//                               <span className="font-medium">{milestone.amount}</span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                               <span className="text-gray-500">Due Date:</span>
//                               <span className="font-medium">
//                                 {formatDate(milestone.dueDate)}
//                               </span>
//                             </div>

//                           </div>
//                           <div className="flex flex-col gap-2">
//                             {renderActionButtons(milestone)}
//                             {milestone.released && !milestone.disputedRaised && !(((escrowDetails as any)?.escrow?.status === "terminated") || ((escrowDetails as any)?.status === "terminated")) && (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="flex-1 py-1.5 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   openTransactionModal(milestone, index);
//                                 }}
//                               >
//                                 View Details
//                               </Button>
//                             )}
//                           </div>
//                         </div>
//                       </CardContent>
//                     </CollapsibleContent>
//                   </Card>
//                 </Collapsible>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//       {/* Dialogs and Modals */}
//       <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Raise Dispute</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <Textarea
//               placeholder="Enter the reason for dispute..."
//               value={disputeReason}
//               onChange={(e) => setDisputeReason(e.target.value)}
//               className="min-h-[100px] border-[#BB7333]/50 focus:ring-[#BB7333] focus:border-[#BB7333]"
//             />
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setDisputeModalOpen(false);
//                 setDisputeReason("");
//               }}
//               className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => {
//                 if (selectedMilestone) {
//                   handleRaiseDispute(escrowDetails.escrow.escrow_contract_address, selectedMilestone.id);
//                 }
//               }}
//               disabled={!disputeReason.trim() || loadingPayout[selectedMilestone?.id || '']}
//               className="bg-[#BB7333] hover:bg-[#965C29] text-white"
//             >
//               {loadingPayout[selectedMilestone?.id || ''] ? "Processing..." : "Submit Dispute"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <Dialog open={releasePaymentModalOpen} onOpenChange={setReleasePaymentModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {selectedMilestone && isLastMilestone(selectedMilestone)
//                 ? "Release Final Payment"
//                 : "Set Next Milestone Due Date"
//               }
//             </DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             {selectedMilestone && !isLastMilestone(selectedMilestone) && (
//               <div className="space-y-2 flex flex-col">
//                 <label className="text-sm font-medium">Due Date (minimum 24 hours from now)</label>
//                 <DatePicker
//                   id="datetime"
//                   selected={selectedDate}
//                   onChange={handleDateChange}
//                   showTimeSelect
//                   timeFormat="HH:mm"
//                   timeIntervals={15}
//                   timeCaption="Time"
//                   dateFormat="yyyy-MM-dd HH:mm"
//                   minDate={now}
//                   className="border-zinc-200 p-1.5 text-center rounded-b-md cursor-pointer dark:hover:bg-zinc-600 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
//                     transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
//                     dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
//                   required
//                 />
//               </div>
//             )}
//             {selectedMilestone && isLastMilestone(selectedMilestone) && (
//               <div className="space-y-2">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   This is the final milestone. No next milestone due date is required.
//                 </p>
//               </div>
//             )}
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setReleasePaymentModalOpen(false);
//                 setNextMilestoneDueDate(null);
//               }}
//               className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => {
//                 if (selectedMilestone) {
//                   handlePaymentRelease(
//                     escrowDetails.escrow.escrow_contract_address,
//                     selectedMilestone.id,
//                     selectedMilestone.amount,
//                     escrowDetails.escrow.receiver_walletaddress,
//                     escrowDetails.escrow.payment_type

//                   );
//                 }
//               }}
//               disabled={
//                 (selectedMilestone && !isLastMilestone(selectedMilestone) && !nextMilestoneDueDate) ||
//                 loadingPayout[selectedMilestone?.id || '']
//               }
//               className="bg-[#BB7333] hover:bg-[#965C29] text-white"
//             >
//               {loadingPayout[selectedMilestone?.id || ''] ? "Processing..." : "Release Payment"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* Set Due Date Modal */}
//       <Dialog open={setDueDateModalOpen} onOpenChange={setSetDueDateModalOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Set Milestone Due Date</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2 flex flex-col">
//               <label className="text-sm font-medium">Due Date (minimum 24 hours from now)</label>
//               <DatePicker
//                 id="datetime-due-date"
//                 selected={selectedDate}
//                 onChange={handleDateChange}
//                 showTimeSelect
//                 timeFormat="HH:mm"
//                 timeIntervals={15}
//                 timeCaption="Time"
//                 dateFormat="yyyy-MM-dd HH:mm"
//                 minDate={now}
//                 className="border-zinc-200 p-1.5 text-center rounded-b-md cursor-pointer dark:hover:bg-zinc-600 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
//                 required
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setSetDueDateModalOpen(false);
//                 setNextMilestoneDueDate(null);
//               }}
//               className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => {
//                 if (selectedMilestone) {
//                   handleSetMilestoneDueDate(
//                     escrowDetails.escrow.escrow_contract_address,
//                     selectedMilestone.id,
//                     selectedMilestone.amount,
//                     escrowDetails.escrow.receiver_walletaddress,
//                     escrowDetails.escrow.payment_type
//                   );
//                   setSetDueDateModalOpen(false);
//                 }
//               }}
//               disabled={!nextMilestoneDueDate || loadingPayout[selectedMilestone?.id || '']}
//               className="bg-[#BB7333] hover:bg-[#965C29] text-white"
//             >
//               {loadingPayout[selectedMilestone?.id || ''] ? "Processing..." : "Set Due Date"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* Transaction Details Modal */}
//       <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Receipt className="h-5 w-5 text-[#BB7333]" />
//               Transaction Details
//             </DialogTitle>
//           </DialogHeader>

//           {loadingTransaction ? (
//             <div className="space-y-4 py-6">
//               <div className="flex items-center justify-center">
//                 <Skeleton className="h-32 w-32 rounded-full" />
//               </div>
//               <div className="space-y-3">
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-3/4" />
//                 <Skeleton className="h-4 w-1/2" />
//               </div>
//               <div className="space-y-2">
//                 <Skeleton className="h-8 w-full" />
//                 <Skeleton className="h-8 w-full" />
//                 <Skeleton className="h-8 w-full" />
//                 <Skeleton className="h-8 w-full" />
//               </div>
//             </div>
//           ) : transactionDetails ? (
//             <div className="space-y-6 py-4">
//               {/* Receipt Header */}
//               <div className="text-center space-y-2">
//                 <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                   <Receipt className="h-8 w-8 text-green-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-300">Payment Receipt</h3>
//                 <p className="text-sm text-gray-300">
//                   {(() => {
//                     const rawType = transactionDetails.transactions[0]?.transaction_type;
//                     if (!rawType) return null;
//                     const normalized = rawType.replace(/_/g, ' ').toUpperCase();
//                     if (normalized === "PAYMENT RECLAIMED") {
//                       return "Payment reclaimed by the creator";
//                     }
//                     return normalized;
//                   })()}
//                 </p>
//               </div>

//               {/* Transaction Details */}
//               <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//                 {transactionDetails.transactions.map((transaction, index) => (
//                   <div key={transaction._id} className="space-y-4">
//                     {/* Amount Section */}
//                     <div className="text-center py-4 border-b border-gray-200">
//                       <div className="flex items-center justify-center gap-2">
//                         <DollarSign className="h-5 w-5 text-green-600" />
//                         <span className="text-2xl font-bold text-gray-900">
//                           ${transaction.amount}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-500 mt-1">Amount Paid</p>
//                     </div>

//                     {/* Transaction Info */}
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Hash className="h-4 w-4 text-gray-500" />
//                           <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
//                         </div>
//                         <a
//                           href={`https://sepolia.etherscan.io/tx/${transaction.transaction_hash}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-sm text-blue-600 hover:text-blue-800 font-mono flex items-center gap-1 transition-colors"
//                         >
//                           {transaction.transaction_hash.substring(0, 8)}...{transaction.transaction_hash.substring(transaction.transaction_hash.length - 8)}
//                           <ExternalLink className="h-3 w-3" />
//                         </a>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Calendar className="h-4 w-4 text-gray-500" />
//                           <span className="text-sm font-medium text-gray-700">Date</span>
//                         </div>
//                         <span className="text-sm text-gray-900">
//                           {format(new Date(transaction.transaction_date), "MMM d, yyyy 'at' hh:mm a")}
//                         </span>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <User className="h-4 w-4 text-gray-500" />
//                           <span className="text-sm font-medium text-gray-700">User</span>
//                         </div>
//                         <span className="text-sm text-gray-900 font-mono">
//                           {transaction.user_id.wallet_address.substring(0, 6)}...{transaction.user_id.wallet_address.substring(transaction.user_id.wallet_address.length - 4)}
//                         </span>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <ArrowRight className="h-4 w-4 text-gray-500" />
//                           <span className="text-sm font-medium text-gray-700">Milestone</span>
//                         </div>
//                         <span className="text-sm text-gray-900">
//                           #{transaction.milestone_index + 1}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Escrow Contract */}
//                     <div className="pt-3 border-t border-gray-200">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm font-medium text-gray-700">Escrow Contract</span>
//                         <span className="text-sm text-gray-900 font-mono">
//                           {transaction.escrow_contract_address.substring(0, 6)}...{transaction.escrow_contract_address.substring(transaction.escrow_contract_address.length - 4)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Footer */}
//               <div className="text-center space-y-2">
//                 <p className="text-xs text-gray-500">
//                   Transaction ID: {transactionDetails.transactions[0]?._id}
//                 </p>
//                 <p className="text-xs text-gray-400">
//                   This receipt serves as proof of payment for the milestone
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">No transaction details found</p>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// } 




"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Receipt } from "lucide-react"
import { toast } from "react-toastify"
import { ContractMilestone } from "@/types/contract"
import { getEscrowDetailsResponse, TransactionDetailsResponse } from "@/types/escrow"
import { useEscrow } from "@/Hooks/useEscrow"
import { useEscrowRefresh } from "@/context/EscrowContext"
import { useUser } from "@/context/userContext"
import { fetchTransactionDetails } from "@/services/Api/escrow/escrow"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, isDueDatePassed, isDisputePeriodOver } from "../../../../utils/escrowUtils"
import { CountdownTimer } from "./countdown-timer"
import { DisputeModal } from "./dispute-modal"
import { ReleasePaymentModal } from "./releasepayment-modal"
import { SetDueDateModal } from "./set-duedate-modal"
import { TransactionModal } from "./transactoin-modal"
import { MilestoneItem } from "./milestone-item"
import { handleError } from "../../../../utils/errorHandler"

type Props = {
  escrowDetails: getEscrowDetailsResponse
  escrowOnChainDetails: ContractMilestone[]
  userType: "creator" | "receiver" | "observer"
}

/**
 * High-level container:
 * - manages state, data fetching, and mutation handlers
 * - renders the full escrow timeline (full or multi-milestone)
 * - delegates presentation to small components
 */
export function EscrowMilestoneTracker({ escrowDetails, escrowOnChainDetails, userType }: Props) {
  const [openMilestones, setOpenMilestones] = useState<Record<string, boolean>>({})
  const [loadingPayout, setLoadingPayout] = useState<Record<string, boolean>>({})
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [releasePaymentModalOpen, setReleasePaymentModalOpen] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<ContractMilestone | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [nextMilestoneDueDate, setNextMilestoneDueDate] = useState<Date | null>(null)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetailsResponse | null>(null)
  const [loadingTransaction, setLoadingTransaction] = useState(false)
  const [dueDateModalOpen, setDueDateModalOpen] = useState(false)
  const [disputeWindowSeconds, setDisputeWindowSeconds] = useState<number>(48 * 60 * 60)

  const { requestPayment, setMileStoneDueDate, releasePayment, claimUnRequestedAmounts, raiseDispute, fetchDisputeWindowEscrow } = useEscrow()
  const { triggerRefresh } = useEscrowRefresh()
  const { user } = useUser()

  /** Fetch dispute window (seconds) from chain/backend */
  useEffect(() => {
    const init = async () => {
      try {
        const seconds = await fetchDisputeWindowEscrow(escrowDetails.escrow.escrow_contract_address)
        if (Number.isFinite(Number(seconds)) && Number(seconds) > 0) {
          setDisputeWindowSeconds(Number(seconds))
        }
      } catch (e) {
        console.error("Error fetching dispute window:", e)
      }
    }
    init()
  }, [escrowDetails?.escrow?.escrow_contract_address, fetchDisputeWindowEscrow])

  /** Toggle a milestone card open/closed */
  const toggleMilestone = useCallback((id: string) => {
    setOpenMilestones(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  /** Compute the top badge for "full" escrow (single milestone) */
  const getEscrowStatusBadge = () => {
    const anyDisputed = escrowOnChainDetails.some(m => m.disputedRaised)
    if (anyDisputed) return <Badge variant="destructive">Disputed</Badge>
    if (escrowOnChainDetails[0]?.released) return <Badge variant="default">Payment Released</Badge>
    if (!isDueDatePassed(escrowOnChainDetails[0]?.dueDate)) return <Badge>Active</Badge>
    return <Badge variant="secondary">Pending</Badge>
  }

  /** Status chip for each milestone */
  const getStatusBadge = (status: string, milestone: ContractMilestone, index: number) => {
    const terminated =
      (escrowDetails as any)?.escrow?.status === "terminated" ||
      (escrowDetails as any)?.status === "terminated"

    if (terminated) return <Badge variant="default">Disputed Payment Released</Badge>
    if (milestone.disputedRaised && milestone.released) return <Badge variant="default">Disputed Payment Released</Badge>
    if (!milestone.dueDate && userType === "creator") return <Badge variant="default">Set Due Date</Badge>
    if (!milestone.dueDate && userType === "receiver") return <Badge variant="default">Due Date Not Set</Badge>
    if (milestone.released) return <Badge variant="default">Payment Released</Badge>
    if (milestone.disputedRaised) return <Badge variant="destructive">Disputed</Badge>

    if (index > 0) {
      const prev = escrowOnChainDetails[index - 1]
      if (!prev.released) return <Badge variant="secondary">Pending</Badge>
    }

    if (!isDueDatePassed(milestone.dueDate)) {
      if (index === 0) return <Badge>Active</Badge>
      const prev = escrowOnChainDetails[index - 1]
      return prev.released
        ? <Badge className="bg-primary dark:text-green-800 text-white">Active</Badge>
        : <Badge variant="secondary">Upcoming</Badge>
    }

    return <Badge variant="secondary">Pending</Badge>
  }

  /**
   * Core rule for creator claim state:
   * - If receiver NEVER requested: creator can claim immediately after due date (no dispute wait).
   * - If receiver requested: creator must wait until dispute window ends.
   */
  const getClaimButtonState = useCallback((milestone: ContractMilestone, who: "creator" | "receiver") => {
    if (!isDueDatePassed(milestone.dueDate)) {
      return { text: "Not Requested", disabled: true, message: "Waiting for due date" as React.ReactNode }
    }

    if (!milestone.requested) {
      return who === "creator"
        ? { text: "Claim Amount", disabled: false, message: "Receiver did not request payout" as React.ReactNode }
        : { text: "Amount Reverted", disabled: true, message: "You didn’t request payout in time" as React.ReactNode }
    }

    if (!isDisputePeriodOver(milestone.dueDate, disputeWindowSeconds)) {
      return {
        text: "In Dispute Period",
        disabled: true,
        message: <CountdownTimer dueDate={milestone.dueDate} windowSeconds={disputeWindowSeconds} />
      }
    }

    return who === "creator"
      ? { text: "Claim Amount", disabled: false, message: "Eligible for claim" as React.ReactNode }
      : { text: "Amount Reverted", disabled: true, message: "Amounts reverted to creator" as React.ReactNode }
  }, [disputeWindowSeconds])

  /** Mutations */
  const handleClaimAmount = useCallback(async (
    escrowAddress: string, milestoneId: string, milestoneRequested: boolean,
    receiverWallet: string, amount: string, escrowType: string
  ) => {
    try {
      setLoadingPayout(p => ({ ...p, [milestoneId]: true }))
      await claimUnRequestedAmounts(escrowAddress, milestoneId, milestoneRequested, receiverWallet, amount, escrowType)
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      triggerRefresh()
    } catch (e) {
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      handleError(e)
    }
  }, [claimUnRequestedAmounts, triggerRefresh])

  const handlePayout = useCallback(async (
    escrowAddress: string, milestoneId: string, amount: string,
    receiverWallet: string, escrowType: string
  ) => {
    try {
      setLoadingPayout(p => ({ ...p, [milestoneId]: true }))
      await requestPayment(escrowAddress, milestoneId, amount, receiverWallet, escrowType)
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      triggerRefresh()
    } catch (e) {
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      handleError(e)
    }
  }, [requestPayment, triggerRefresh])

  const handlePaymentRelease = useCallback(async (
    escrowAddress: string, milestoneId: string, amount: string,
    receiverWallet: string, escrowType: string
  ) => {
    try {
      const isLast = selectedMilestone && isLastMilestone(selectedMilestone)
      if (!isLast && !nextMilestoneDueDate) {
        toast.error("Please select a due date for the next milestone")
        return
      }
      const unixTs = isLast ? "0" : Math.floor(nextMilestoneDueDate!.getTime() / 1000).toString()
      setLoadingPayout(p => ({ ...p, [milestoneId]: true }))
      await releasePayment(escrowAddress, milestoneId, amount, unixTs, receiverWallet, escrowType)
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      setReleasePaymentModalOpen(false)
      setNextMilestoneDueDate(null)
      triggerRefresh()
    } catch (e) {
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      handleError(e)
    }
  }, [releasePayment, nextMilestoneDueDate, selectedMilestone, triggerRefresh])

  const handleSetMilestoneDueDate = useCallback(async (
    escrowAddress: string, milestoneId: string, amount: string,
    receiverWallet: string, escrowType: string
  ) => {
    try {
      const unixTs = Math.floor(selectedDate.getTime() / 1000).toString()
      setLoadingPayout(p => ({ ...p, [milestoneId]: true }))
      await setMileStoneDueDate(escrowAddress, milestoneId, amount, unixTs, receiverWallet, escrowType)
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      setDueDateModalOpen(false)
      setNextMilestoneDueDate(null)
      triggerRefresh()
    } catch (e) {
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      handleError(e)
    }
  }, [setMileStoneDueDate, selectedDate, triggerRefresh])

  const handleRaiseDispute = useCallback(async (escrowAddress: string, milestoneId: string) => {
    try {
      if (!disputeReason.trim()) {
        toast.error("Please provide a reason for the dispute")
        return
      }
      setLoadingPayout(p => ({ ...p, [milestoneId]: true }))
      await raiseDispute(escrowAddress, milestoneId, disputeReason, escrowDetails.escrow.payment_type)
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      setDisputeModalOpen(false)
      setDisputeReason("")
      triggerRefresh()
    } catch (e) {
      setLoadingPayout(p => ({ ...p, [milestoneId]: false }))
      handleError(e)
    }
  }, [raiseDispute, disputeReason, escrowDetails?.escrow?.payment_type, triggerRefresh])

  /** Helpers for modal openers */
  const isLastMilestone = (m: ContractMilestone) =>
    escrowOnChainDetails.findIndex(x => x.id === m.id) === escrowOnChainDetails.length - 1

  const openReleasePaymentModal = (m: ContractMilestone) => {
    setSelectedMilestone(m)
    if (isLastMilestone(m)) {
      setNextMilestoneDueDate(null)
    } else {
      const d = new Date()
      // (kept your "no +24h" testing behavior)
      d.setHours(d.getHours())
      setNextMilestoneDueDate(d)
    }
    setReleasePaymentModalOpen(true)
  }

  const openSetDueDateModal = (m: ContractMilestone) => {
    setSelectedMilestone(m)
    setSelectedDate(new Date())
    setDueDateModalOpen(true)
  }

  const openDisputeModal = (m: ContractMilestone) => {
    setSelectedMilestone(m)
    setDisputeModalOpen(true)
  }

  const openTransactionModal = async (m: ContractMilestone, index: number) => {
    setSelectedMilestone(m)
    setTransactionModalOpen(true)
    setLoadingTransaction(true)
    setTransactionDetails(null)
    try {
      const response = await fetchTransactionDetails(
        escrowDetails.escrow.escrow_contract_address,
        index,
        "payment_released"
      )
      setTransactionDetails(response.data)
    } catch (e) {
      toast.error("Failed to fetch transaction details")
    } finally {
      setLoadingTransaction(false)
    }
  }

  /** Render the big “action buttons” block for each milestone */
  const renderActionButtons = (milestone: ContractMilestone) => {
    if (userType === "observer") return null

    const terminated =
      (escrowDetails as any)?.escrow?.status === "terminated" ||
      (escrowDetails as any)?.status === "terminated"

    if (terminated) {
      return <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">Payment Released</Button>
    }

    if (!milestone.dueDate && userType === "creator")
      return (
        <Button
          size="sm"
          className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
          onClick={(e) => { e.stopPropagation(); openSetDueDateModal(milestone) }}
        >
          Set Milestone Due Date
        </Button>
      )

    if (!milestone.dueDate && userType === "receiver")
      return <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">Creator Hasn't Set Due Date</Button>

    if (milestone.released)
      return <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">Payment Released</Button>

    if (milestone.disputedRaised)
      return <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">Escrow in Dispute</Button>

    if (Number(milestone.dueDate) === 0)
      return <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">Not Active Yet</Button>

    // Receiver missed request
    if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && !milestone.requested) {
      const msg = getClaimButtonState(milestone, "receiver").message
      return (
        <div className="space-y-2">
          <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed" disabled>
            Amount Reverted
          </Button>
          <p className="text-sm text-gray-500 text-center">{msg}</p>
        </div>
      )
    }

    // Receiver requested & creator hasn't released
    if (userType === "receiver" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
      const inWindow = !isDisputePeriodOver(milestone.dueDate, disputeWindowSeconds)
      const canDispute = inWindow // dispute allowed only during window
      const msg = getClaimButtonState(milestone, "receiver").message
      return (
        <div className="space-y-2">
          {canDispute && (
            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-2 bg-[#BB7333] hover:bg-[#965C29] text-white"
              onClick={(e) => { e.stopPropagation(); openDisputeModal(milestone) }}
              disabled={loadingPayout[milestone.id]}
            >
              Raise Dispute
            </Button>
          )}
          <p className="text-sm text-gray-500 text-center">{msg}</p>
        </div>
      )
    }

    // Creator path (requested)
    if (userType === "creator" && isDueDatePassed(milestone.dueDate) && milestone.requested && !milestone.released) {
      const disabled =
        (!isDueDatePassed(milestone.dueDate)) ||
        (milestone.requested && !isDisputePeriodOver(milestone.dueDate, disputeWindowSeconds)) ||
        !!loadingPayout[milestone.id]

      const { text, message } = getClaimButtonState(milestone, "creator")
      return (
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            onClick={(e) => {
              e.stopPropagation()
              if (isDueDatePassed(milestone.dueDate) &&
                  isDisputePeriodOver(milestone.dueDate, disputeWindowSeconds)) {
                handleClaimAmount(
                  escrowDetails.escrow.escrow_contract_address,
                  milestone.id,
                  milestone.requested,
                  escrowDetails.escrow.receiver_walletaddress,
                  milestone.amount,
                  escrowDetails.escrow.payment_type
                )
              }
            }}
            disabled={disabled}
          >
            {loadingPayout[milestone.id] ? "Processing..." : text}
          </Button>
          <p className="text-sm text-gray-500 text-center">{message}</p>
        </div>
      )
    }

    // Creator path (not requested) → can claim right after due date
    if (userType === "creator" && !milestone.requested && !milestone.released) {
      const canClaim = isDueDatePassed(milestone.dueDate) && !loadingPayout[milestone.id]
      const { text, message } = getClaimButtonState(milestone, "creator")
      return (
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            onClick={(e) => {
              e.stopPropagation()
              if (isDueDatePassed(milestone.dueDate)) {
                handleClaimAmount(
                  escrowDetails.escrow.escrow_contract_address,
                  milestone.id,
                  milestone.requested,
                  escrowDetails.escrow.receiver_walletaddress,
                  milestone.amount,
                  escrowDetails.escrow.payment_type
                )
              }
            }}
            disabled={!canClaim}
          >
            {loadingPayout[milestone.id] ? "Processing..." : text}
          </Button>
          {isDueDatePassed(milestone.dueDate) && (
            <p className="text-sm text-gray-500 text-center">{message}</p>
          )}
        </div>
      )
    }

    // Creator can release when receiver requested and due date not passed yet
    if (milestone.requested && !milestone.released && !isDueDatePassed(milestone.dueDate) && userType === "creator") {
      return (
        <div className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
            onClick={(e) => { e.stopPropagation(); openReleasePaymentModal(milestone) }}
            disabled={!!loadingPayout[milestone.id]}
          >
            {loadingPayout[milestone.id] ? "Processing..." : "Release Payment"}
          </Button>
        </div>
      )
    }

    // Receiver can request payout before due date
    if (userType === "receiver" && !milestone.requested && !milestone.released) {
      return (
        <Button
          size="sm"
          className="w-full bg-[#BB7333] hover:bg-[#965C29] text-white"
          onClick={(e) => {
            e.stopPropagation()
              handlePayout(
                escrowDetails.escrow.escrow_contract_address,
                milestone.id,
                milestone.amount,
                escrowDetails.escrow.receiver_walletaddress,
                escrowDetails.escrow.payment_type
              )
            
          }}
          disabled={!!loadingPayout[milestone.id]}
        >
          {loadingPayout[milestone.id] ? "Processing..." : "Request Payout"}
        </Button>
      )
    }

    // Fallback
    return (
      <div className="space-y-2">
        <Button size="sm" className="w-full bg-gray-400 cursor-not-allowed">
          {milestone.rejected ? "Payment Rejected" :
            milestone.requested ? "Payment Requested" :
            isDueDatePassed(milestone.dueDate) ? "In Dispute Period" : "Payment Released"}
        </Button>
      </div>
    )
  }

  /** Render */
  return (
    <>
      <div className="space-y-6 pt-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#BB7333]/20" />

          {escrowDetails?.escrow?.payment_type === "full" ? (
            // FULL ESCROW (single milestone UX)
            <div className="relative pl-12 pb-8">
              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-[#BB7333]" />
              <Collapsible
                open={openMilestones["full"]}
                onOpenChange={() => toggleMilestone("full")}
              >
                <Card className="relative">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Escrow</CardTitle>
                          {getEscrowStatusBadge()}
                        </div>
                        {openMilestones["full"] ? (
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
                            <span className="font-medium">{formatDate(escrowOnChainDetails[0]?.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {renderActionButtons(escrowOnChainDetails[0])}
                          {escrowOnChainDetails[0]?.released &&
                            !(((escrowDetails as any)?.escrow?.status === "terminated") || ((escrowDetails as any)?.status === "terminated")) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 py-1.5 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
                                onClick={(e) => { e.stopPropagation(); openTransactionModal(escrowOnChainDetails[0], 0) }}
                              >
                                View Details
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          ) : (
            // MILESTONES
            escrowOnChainDetails.map((m, idx) => (
              <MilestoneItem
                key={m.id}
                milestone={m}
                index={idx}
                isOpen={!!openMilestones[m.id]}
                toggle={() => toggleMilestone(m.id)}
                getStatusBadge={getStatusBadge}
                renderActionButtons={renderActionButtons}
                escrowDetails={escrowDetails}
                escrowOnChainDetails={escrowOnChainDetails}
              />
            ))
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      <DisputeModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        disputeReason={disputeReason}
        setDisputeReason={setDisputeReason}
        loading={selectedMilestone ? !!loadingPayout[selectedMilestone.id] : false}
        onSubmit={() => {
          if (selectedMilestone) {
            handleRaiseDispute(escrowDetails.escrow.escrow_contract_address, selectedMilestone.id)
          }
        }}
      />

      {/* Release Payment Modal */}
      <ReleasePaymentModal
        open={releasePaymentModalOpen}
        onOpenChange={setReleasePaymentModalOpen}
        isLast={!!(selectedMilestone && isLastMilestone(selectedMilestone))}
        selectedDate={selectedDate}
        onDateChange={(d) => { if (d) { setSelectedDate(d); setNextMilestoneDueDate(d) } }}
        minDate={new Date()}
        loading={selectedMilestone ? !!loadingPayout[selectedMilestone.id] : false}
        onRelease={() => {
          if (selectedMilestone) {
            handlePaymentRelease(
              escrowDetails.escrow.escrow_contract_address,
              selectedMilestone.id,
              selectedMilestone.amount,
              escrowDetails.escrow.receiver_walletaddress,
              escrowDetails.escrow.payment_type
            )
          }
        }}
      />

      {/* Set Due Date Modal */}
      <SetDueDateModal
        open={dueDateModalOpen}
        onOpenChange={setDueDateModalOpen}
        selectedDate={selectedDate}
        onDateChange={(d) => { if (d) { setSelectedDate(d); setNextMilestoneDueDate(d) } }}
        minDate={new Date()}
        loading={selectedMilestone ? !!loadingPayout[selectedMilestone.id] : false}
        onSave={() => {
          if (selectedMilestone) {
            handleSetMilestoneDueDate(
              escrowDetails.escrow.escrow_contract_address,
              selectedMilestone.id,
              selectedMilestone.amount,
              escrowDetails.escrow.receiver_walletaddress,
              escrowDetails.escrow.payment_type
            )
          }
        }}
      />

      {/* Transaction Modal */}
      <TransactionModal
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
        loading={loadingTransaction}
        details={transactionDetails}
      />
    </>
  )
}
