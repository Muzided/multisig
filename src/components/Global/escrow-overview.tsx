"use client"

import { useState } from "react"
import { Check, Clock, ExternalLink, MoreHorizontal, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for escrow transactions
const mockEscrows = [
  {
    id: "ESC-001",
    amount: "1.5 ETH",
    signees: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", hasSigned: true },
      { address: "0x9i8h7g6f5e4d3c2b1a0", hasSigned: false },
    ],
    expiry: "2023-12-31",
    status: "active",
    receiver: "0x2b3c4d5e6f7g8h9i0j1a",
    reversal: "0x3c4d5e6f7g8h9i0j1a2b",
    createdAt: "2023-11-15",
  },
  {
    id: "ESC-002",
    amount: "0.75 ETH",
    signees: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", hasSigned: true },
      { address: "0x9i8h7g6f5e4d3c2b1a0", hasSigned: true },
    ],
    expiry: "2023-12-25",
    status: "completed",
    receiver: "0x4d5e6f7g8h9i0j1a2b3c",
    reversal: "0x5e6f7g8h9i0j1a2b3c4d",
    createdAt: "2023-11-10",
  },
  {
    id: "ESC-003",
    amount: "2.0 ETH",
    signees: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", hasSigned: false },
      { address: "0x9i8h7g6f5e4d3c2b1a0", hasSigned: false },
    ],
    expiry: "2024-01-15",
    status: "pending",
    receiver: "0x6f7g8h9i0j1a2b3c4d5e",
    reversal: "0x7g8h9i0j1a2b3c4d5e6f",
    createdAt: "2023-11-20",
  },
  {
    id: "ESC-004",
    amount: "0.5 ETH",
    signees: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", hasSigned: false },
      { address: "0x9i8h7g6f5e4d3c2b1a0", hasSigned: false },
    ],
    expiry: "2023-11-10",
    status: "expired",
    receiver: "0x8h9i0j1a2b3c4d5e6f7g",
    reversal: "0x9i0j1a2b3c4d5e6f7g8h",
    createdAt: "2023-10-25",
  },
  {
    id: "ESC-005",
    amount: "3.2 ETH",
    signees: [
      { address: "0x1a2b3c4d5e6f7g8h9i0j", hasSigned: true },
      { address: "0x9i8h7g6f5e4d3c2b1a0", hasSigned: false },
    ],
    expiry: "2024-02-01",
    status: "active",
    receiver: "0x0j1a2b3c4d5e6f7g8h9i",
    reversal: "0x1a2b3c4d5e6f7g8h9i0j",
    createdAt: "2023-11-25",
  },
]

// Helper function to format wallet address
const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Helper function to determine if the current user can sign
const canSign = (escrow: any) => {
  // Assuming the current user's address is the first one in the signees array
  const currentUserAddress = "0x1a2b3c4d5e6f7g8h9i0j"
  const userSignee = escrow.signees.find((s: any) => s.address === currentUserAddress)
  return userSignee && !userSignee.hasSigned && escrow.status === "active"
}

type EscrowOverviewProps = {
  limit?: number
}

export  function EscrowOverview({ limit }: EscrowOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Filter escrows based on status
  const filteredEscrows =
    statusFilter === "all" ? mockEscrows : mockEscrows.filter((escrow) => escrow.status === statusFilter)

  // Apply limit if provided
  const displayEscrows = limit ? filteredEscrows.slice(0, limit) : filteredEscrows

  const handleSignEscrow = (escrowId: string) => {
    // This would call the smart contract function to sign the escrow
    console.log(`Signing escrow ${escrowId}`)
    // Then update the UI state
  }

  return (
    <div className="space-y-4 bg-zinc-950 p-4 rounded-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-zinc-700 bg-zinc-800 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="border-zinc-700 bg-zinc-800 text-white">
              <SelectItem value="all">All Escrows</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="bg-zinc-800 mb-4">
          <TabsTrigger value="table" className="data-[state=active]:bg-zinc-700">
            Table
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-zinc-700">
            Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-0">
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Amount</TableHead>
                  <TableHead className="text-zinc-400">Signees</TableHead>
                  <TableHead className="text-zinc-400">Expiry</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEscrows.length === 0 ? (
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                      No escrows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayEscrows.map((escrow) => (
                    <TableRow key={escrow.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="font-medium text-white">{escrow.id}</TableCell>
                      <TableCell className="text-white">{escrow.amount}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {escrow.signees.map((signee, index) => (
                            <div key={index} className="flex items-center gap-1 text-sm">
                              <span className="text-zinc-400">{formatAddress(signee.address)}</span>
                              {signee.hasSigned ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">{new Date(escrow.expiry).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${escrow.status === "active" ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                            ${escrow.status === "pending" ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" : ""}
                            ${escrow.status === "completed" ? "border-blue-500 bg-blue-500/10 text-blue-500" : ""}
                            ${escrow.status === "expired" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
                          `}
                        >
                          {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canSign(escrow) && (
                            <Button
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => handleSignEscrow(escrow.id)}
                            >
                              Sign
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-100">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              <DropdownMenuItem className="flex items-center hover:bg-zinc-800">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {escrow.status === "active" && (
                                <DropdownMenuItem className="flex items-center text-red-500 hover:bg-zinc-800 hover:text-red-500">
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel Escrow
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayEscrows.length === 0 ? (
              <Card className="col-span-full border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardContent className="flex h-40 items-center justify-center">
                  <p className="text-zinc-500">No escrows found.</p>
                </CardContent>
              </Card>
            ) : (
              displayEscrows.map((escrow) => (
                <Card key={escrow.id} className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{escrow.id}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`
                          ${escrow.status === "active" ? "border-green-500 bg-green-500/10 text-green-500" : ""}
                          ${escrow.status === "pending" ? "border-yellow-500 bg-yellow-500/10 text-yellow-500" : ""}
                          ${escrow.status === "completed" ? "border-blue-500 bg-blue-500/10 text-blue-500" : ""}
                          ${escrow.status === "expired" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
                        `}
                      >
                        {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-zinc-400">
                      Created on {new Date(escrow.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Amount:</span>
                      <span className="font-medium text-white">{escrow.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Expiry:</span>
                      <span className="text-zinc-300">{new Date(escrow.expiry).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-zinc-400">Signees:</span>
                      <div className="space-y-1">
                        {escrow.signees.map((signee, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-zinc-300">{formatAddress(signee.address)}</span>
                            {signee.hasSigned ? (
                              <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-500">
                                Signed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 bg-yellow-500/10 text-yellow-500">
                                Pending
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      {canSign(escrow) ? (
                        <Button
                          className="w-full bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleSignEscrow(escrow.id)}
                        >
                          Sign Escrow
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

