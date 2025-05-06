
"use client"
import React from 'react'
import { useParams } from "next/navigation"
import { EscrowDetails } from "@/components/escrowdetail/escrow-details"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
const EscrowDetailTab = ({escrowId}:{escrowId:string}) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-white dark:bg-black dark:from-black dark:to-black
    container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Escrow Details</h1>
      </div>
      <EscrowDetails escrowId={escrowId} />
    </div>
  )
}

export default EscrowDetailTab
