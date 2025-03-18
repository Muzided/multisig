"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function CreateEscrowForm() {
  const [amount, setAmount] = useState("")
  const [signees, setSignees] = useState<string[]>([""])
  const [receiver, setReceiver] = useState("")
  const [reversal, setReversal] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSignee = () => {
    setSignees([...signees, ""])
  }

  const removeSignee = (index: number) => {
    const newSignees = [...signees]
    newSignees.splice(index, 1)
    setSignees(newSignees)
  }

  const updateSignee = (index: number, value: string) => {
    const newSignees = [...signees]
    newSignees[index] = value
    setSignees(newSignees)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // This would call the smart contract function to create an escrow
      console.log({
        amount,
        signees: signees.filter((s) => s.trim() !== ""),
        receiver,
        reversal,
        duration: Number.parseInt(duration),
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Reset form
      setAmount("")
      setSignees([""])
      setReceiver("")
      setReversal("")
      setDuration("")

      // Show success message
      alert("Escrow created successfully!")
    } catch (error) {
      console.error("Error creating escrow:", error)
      alert("Failed to create escrow. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
      <CardHeader>
        <CardTitle>Create New Escrow</CardTitle>
        <CardDescription className="text-zinc-400">Set up a new multi-signature escrow transaction</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="e.g. 1.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Signees' Wallets</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSignee}
                className="h-8 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Signee
              </Button>
            </div>
            <div className="space-y-2">
              {signees.map((signee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Wallet address (0x...)"
                    value={signee}
                    onChange={(e) => updateSignee(index, e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-white"
                    required
                  />
                  {signees.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSignee(index)}
                      className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver's Address</Label>
            <Input
              id="receiver"
              placeholder="Wallet address (0x...)"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reversal">Reversal Address</Label>
            <Input
              id="reversal"
              placeholder="Wallet address (0x...)"
              value={reversal}
              onChange={(e) => setReversal(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white"
              required
            />
            <p className="text-xs text-zinc-500">Funds will be returned to this address if the escrow expires</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-white"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Escrow"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

