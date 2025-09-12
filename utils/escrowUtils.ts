// Reusable helpers: formatting + time windows

import { format } from "date-fns"

/** Safely format a unix seconds timestamp into a pretty string */
export const formatDate = (timestamp?: string | number) => {
  if (!timestamp) return "N/A"
  try {
    const date = new Date(Number(timestamp) * 1000)
    if (isNaN(date.getTime())) return "Invalid Date"
    return format(date, "MMM d, yyyy hh:mm a")
  } catch {
    return "Invalid Date"
  }
}

/** True if dueDate (unix seconds) is in the past */
export const isDueDatePassed = (dueDate: string | number) => {
  const now = Math.floor(Date.now() / 1000)
  return Number(dueDate) < now
}

/** Dispute window utilities */
export const isDisputePeriodOver = (
  dueDate: string | number,
  disputeWindowSeconds: number
) => {
  const now = Math.floor(Date.now() / 1000)
  const disputeEnd = Number(dueDate) + Number(disputeWindowSeconds)
  return now > disputeEnd
}
