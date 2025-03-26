"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useWeb3 } from "@/context/Web3Context"
import { useFactory } from "@/Hooks/useFactory"

export function CreateEscrowForm() {
  const [amount, setAmount] = useState("")
  const [signees, setSignees] = useState<string[]>([""])
  const [receiver, setReceiver] = useState("")
  const [reversal, setReversal] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  //web 3 context
  const {signer} = useWeb3()
  // multi-sig factory contract hook
  const {fetchTotalEscrows} = useFactory()


useEffect(() => {
  if(!signer) return
  fetchTotalEscrows()

}, [signer])
    // This would fetch the user's wallet address from the wallet provider)

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
    <Card
      className="border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 shadow-lg text-zinc-900 
      dark:border-zinc-800 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-100 dark:shadow-none"
    >
      <CardHeader>
        <CardTitle
          className="bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent
          dark:from-white dark:to-zinc-300"
        >
          Create New Escrow
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Set up a new multi-signature escrow transaction
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-zinc-700 font-medium dark:text-zinc-100">
              Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="text"
              placeholder="e.g. 1.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-700 font-medium dark:text-zinc-100">Signees' Wallets</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSignee}
                className="h-8 border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 
                  hover:shadow-md transition-all duration-200
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
                  dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
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
                    className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                      transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                      dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
                    required
                  />
                  {signees.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSignee(index)}
                      className="h-8 w-8 text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm
                        transition-all duration-200
                        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white dark:hover:shadow-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          <div className="space-y-2">
            <Label htmlFor="receiver" className="text-zinc-700 font-medium dark:text-zinc-100">
              Receiver's Address
            </Label>
            <Input
              id="receiver"
              placeholder="Wallet address (0x...)"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reversal" className="text-zinc-700 font-medium dark:text-zinc-100">
              Reversal Address
            </Label>
            <Input
              id="reversal"
              placeholder="Wallet address (0x...)"
              value={reversal}
              onChange={(e) => setReversal(e.target.value)}
              className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
              required
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Funds will be returned to this address if the escrow expires
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-zinc-700 font-medium dark:text-zinc-100">
              Duration (Days)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg 
              hover:from-blue-500 hover:to-blue-400 transition-all duration-300
              dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
              dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Escrow"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

