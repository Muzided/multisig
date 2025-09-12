"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

/**
 * Modal for creator to release payment.
 * If it's not the last milestone, we ask for a next milestone due date.
 */
type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  isLast: boolean
  selectedDate: Date
  onDateChange: (d: Date | null) => void
  minDate: Date
  loading: boolean
  onRelease: () => void
}

export const ReleasePaymentModal = ({
  open, onOpenChange, isLast, selectedDate, onDateChange, minDate, loading, onRelease,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLast ? "Release Final Payment" : "Set Next Milestone Due Date"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isLast ? (
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium">Due Date</label>
              <DatePicker
                id="datetime"
                selected={selectedDate}
                onChange={onDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={minDate}
                className="border-zinc-200 p-1.5 text-center rounded-b-md cursor-pointer dark:hover:bg-zinc-600 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
                required
              />
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is the final milestone. No next milestone due date is required.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onRelease}
            disabled={loading}
            className="bg-[#BB7333] hover:bg-[#965C29] text-white"
          >
            {loading ? "Processing..." : "Release Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
