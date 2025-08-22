"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dispute } from "@/types/dispute"
import { voteOnDispute } from "@/services/Api/dispute/dispute"
import { toast } from "react-toastify"
import { handleError } from "../../../utils/errorHandler"

type UserRole = "creator" | "receiver" | null

interface VoteOnDisputeModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  dispute: Dispute | null
  userRole: UserRole
  mode: "vote" | "view"
  onSuccess: () => void
}

/**
 * VoteOnDisputeModal is responsible for rendering both the voting UI
 * (when the user has not yet voted and the 4h window is active) and
 * the read-only view (when the user has already voted or the window elapsed).
 */
export function VoteOnDisputeModal({ isOpen, onOpenChange, dispute, userRole, mode, onSuccess }: VoteOnDisputeModalProps) {
  const [continueWork, setContinueWork] = useState<string>("true")
  const [submitting, setSubmitting] = useState<boolean>(false)

  const decisionInFavorOf = useMemo(() => dispute?.decisionInFavorOf ?? "-", [dispute])

  const userVoteValue = useMemo(() => {
    if (!dispute) return null
    if (userRole === "creator") return dispute.creatorVote
    if (userRole === "receiver") return dispute.receiverVote
    return null
  }, [dispute, userRole])

  const handleSubmit = async () => {
    if (!dispute) return
    try {
      setSubmitting(true)
      const voteBoolean = continueWork === "true"
     const result =  await voteOnDispute(dispute.disputeContractAddress, voteBoolean)
      if(result.status === 201){
        toast.success("Your decision has been recorded")
        onSuccess()
        onOpenChange(false)
      }else{
        toast.error("Failed to record your decision. Please try again.")
      }
    } catch (error) {
      handleError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderVoteForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resolver Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs break-all">{decisionInFavorOf}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Record Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs font-medium">Continue Work</div>
          <Select value={continueWork} onValueChange={setContinueWork}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={submitting} onClick={handleSubmit} className="bg-[#BB7333] text-white hover:bg-[#965C29] dark:bg-[#BB7333] dark:text-white dark:hover:bg-[#965C29]">
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderViewOnly = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resolver Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs break-all">{decisionInFavorOf}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your Recorded Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs">Continue Work: <span className="font-semibold">{String(userVoteValue)}</span></p>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-sm">Vote on Dispute</DialogTitle>
        </DialogHeader>
        {mode === "vote" ? renderVoteForm() : renderViewOnly()}
      </DialogContent>
    </Dialog>
  )
}

export default VoteOnDisputeModal


