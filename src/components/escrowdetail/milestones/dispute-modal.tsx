"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  disputeReason: string
  setDisputeReason: (v: string) => void
  loading: boolean
  onSubmit: () => void
}

/** Modal to collect a dispute reason and submit */
export const DisputeModal = ({
  open, onOpenChange, disputeReason, setDisputeReason, loading, onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => { onOpenChange(false); setDisputeReason(""); }}
            className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={!disputeReason.trim() || loading}
            className="bg-[#BB7333] hover:bg-[#965C29] text-white"
          >
            {loading ? "Processing..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
