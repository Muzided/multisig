"use client"

import { useEffect, useState } from "react"
import { Eye, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useFactory } from "@/Hooks/useFactory"
import { useWeb3 } from "@/context/Web3Context"

// Mock data for disputes
const mockDisputes = [
  {
    id: "DSP-001",
    status: "active",
    contractAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    escrowId: "ESC-001",
    amount: "1.5 ETH",
    reason:
      "The funds were sent to the wrong address. I provided the correct address in our communication but the sender used an old address from a previous transaction. I have proof of our conversation where I clearly stated the new address to use.",
    createdAt: "2023-12-15",
    parties: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", role: "sender" },
      { address: "0x9i8h7g6f5e4d3c2b1a0", role: "receiver" },
    ],
  },
  {
    id: "DSP-002",
    status: "active",
    contractAddress: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u",
    escrowId: "ESC-003",
    amount: "0.75 ETH",
    reason: "The service was not delivered as promised.",
    createdAt: "2023-12-20",
    parties: [
      { address: "0x3c4d5e6f7g8h9i0j1a", role: "sender" },
      { address: "0x8h7g6f5e4d3c2b1a0z", role: "receiver" },
    ],
  },
  {
    id: "DSP-003",
    status: "active",
    contractAddress: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
    escrowId: "ESC-005",
    amount: "2.0 ETH",
    reason:
      "The project deadline was missed by over 2 weeks with no communication from the developer. I attempted to reach out multiple times but received no response until after I opened this dispute. The work delivered was also incomplete and missing several key features that were specified in our agreement.",
    createdAt: "2023-12-25",
    parties: [
      { address: "0x4d5e6f7g8h9i0j1a2", role: "sender" },
      { address: "0x7g6f5e4d3c2b1a0z9", role: "receiver" },
    ],
  },
]

// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function DisputeResolution() {
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [resolveInFavor, setResolveInFavor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  //factory contract address
  const { fetchDisputeTeamMembers } = useFactory()

  //web 3 context
  const { signer } = useWeb3()

                                                                                                                                                                                                                                                                               
  useEffect(() => {
    if (!signer) return
    fetchDisputeTeamMembers()
  }, [signer])

  const handleViewReason = (dispute: any) => {
    setSelectedDispute(dispute)
    setIsReasonModalOpen(true)
  }

  const handleResolveDispute = (dispute: any) => {
    setSelectedDispute(dispute)
    setResolveInFavor(false) // Reset to default
    setIsResolveModalOpen(true)
  }

  const handleSubmitResolution = async () => {
    setIsSubmitting(true)

    try {
      // This would call the smart contract function to resolve the dispute
      console.log({
        disputeId: selectedDispute.id,
        contractAddress: selectedDispute.contractAddress,
        resolveInFavor,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Close modal and show success message
      setIsResolveModalOpen(false)
      alert(`Dispute ${selectedDispute.id} resolved successfully!`)
    } catch (error) {
      console.error("Error resolving dispute:", error)
      alert("Failed to resolve dispute. Please try again.")
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
          Active Disputes
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Review and resolve active disputes in escrow contracts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
              <TableRow
                className="border-zinc-200 hover:bg-zinc-100/50 
                dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <TableHead className="text-zinc-500 dark:text-zinc-400 w-[100px]">ID</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400">Contract Address</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400">Escrow Details</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400">Reason</TableHead>
                <TableHead className="text-right text-zinc-500 dark:text-zinc-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDisputes.map((dispute) => (
                <TableRow
                  key={dispute.id}
                  className="border-zinc-200 hover:bg-zinc-100/50 
                  dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <TableCell className="font-medium text-zinc-900 dark:text-white">{dispute.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-yellow-500 bg-yellow-500/10 text-yellow-600 
                      dark:border-yellow-500 dark:text-yellow-500"
                    >
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    {formatAddress(dispute.contractAddress)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-zinc-900 dark:text-white font-medium">{dispute.escrowId}</div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-sm">Amount: {dispute.amount}</div>
                      <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Created: {new Date(dispute.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-700 dark:text-zinc-300 text-sm">
                        {truncateText(dispute.reason, 40)}
                      </span>
                      {dispute.reason.length > 40 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReason(dispute)}
                          className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50
                            dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          More
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 
                          dark:text-zinc-400 dark:hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-zinc-200 bg-white text-zinc-900 
                        dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <DropdownMenuItem
                          onClick={() => handleResolveDispute(dispute)}
                          className="cursor-pointer text-blue-600 hover:text-blue-700 focus:text-blue-700
                            dark:text-blue-400 dark:hover:text-blue-300 dark:focus:text-blue-300"
                        >
                          Resolve Dispute
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View Reason Modal */}
        <Dialog open={isReasonModalOpen} onOpenChange={setIsReasonModalOpen}>
          <DialogContent
            className="border-zinc-200/80 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-900/95 
              backdrop-blur-sm text-zinc-900 dark:text-zinc-100 shadow-2xl shadow-zinc-300/50 
              dark:shadow-blue-900/20 rounded-2xl max-w-lg"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Dispute Reason</DialogTitle>
              <DialogDescription className="text-zinc-600 dark:text-zinc-300">
                {selectedDispute?.id} - {selectedDispute?.escrowId}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 text-zinc-700 dark:text-zinc-300 max-h-[60vh] overflow-y-auto">
              {selectedDispute?.reason}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReasonModalOpen(false)}
                className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 
                  hover:shadow-sm transition-all duration-200
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
                  dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resolve Dispute Modal */}
        <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
          <DialogContent
            className="border-zinc-200/80 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-900/95 
              backdrop-blur-sm text-zinc-900 dark:text-zinc-100 shadow-2xl shadow-zinc-300/50 
              dark:shadow-blue-900/20 rounded-2xl max-w-lg"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Resolve Dispute</DialogTitle>
              <DialogDescription className="text-zinc-600 dark:text-zinc-300">
                {selectedDispute?.id} - {selectedDispute?.escrowId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="text-zinc-700 dark:text-zinc-300 font-medium">Dispute between:</div>
                <div className="space-y-1 text-sm">
                  {selectedDispute?.parties.map((party: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400 capitalize">{party.role}:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-mono">{formatAddress(party.address)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-zinc-700 dark:text-zinc-300 font-medium">Resolution Decision:</div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="resolve-switch" className="text-zinc-900 dark:text-white font-medium">
                      Resolve in favor of receiver
                    </Label>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {resolveInFavor
                        ? "Funds will be released to the receiver"
                        : "Funds will be returned to the sender"}
                    </p>
                  </div>
                  <Switch
                    id="resolve-switch"
                    checked={resolveInFavor}
                    onCheckedChange={setResolveInFavor}
                    className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsResolveModalOpen(false)}
                className="mt-3 sm:mt-0 border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 
                  hover:shadow-sm transition-all duration-200
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
                  dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResolution}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg 
                  hover:from-blue-500 hover:to-blue-400 transition-all duration-300
                  dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
                  dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Submit Resolution"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

