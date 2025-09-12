"use client"

import { useEffect, useState } from "react"


export const CountdownTimer = ({
  dueDate,
  windowSeconds,
}: { dueDate: string | number; windowSeconds: number }) => {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000)
      const end = Number(dueDate) + Number(windowSeconds)
      const remaining = end - now
      if (remaining <= 0) {
        setTimeLeft("Dispute period ended")
        return
      }
      const h = Math.floor(remaining / 3600)
      const m = Math.floor((remaining % 3600) / 60)
      const s = Math.floor(remaining % 60)
      setTimeLeft(`${h}h ${m}m ${s}s remaining`)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [dueDate, windowSeconds])

  return <span>{timeLeft}</span>
}
