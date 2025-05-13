"use client"

import { useParams } from "next/navigation"
import { EscrowDetails } from "@/components/escrowdetail/escrow-details"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"

export default function EscrowDetailsPage() {
  const params = useParams()
  const escrowId = params.id as string

  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsClient(true) // Ensures document-related code runs only on the client
  }, [])

  if (!isClient) return null // Prevents SSR issues

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }


  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-white dark:bg-black dark:from-black dark:to-black
    container mx-auto p-2 md:p-4 space-y-6">
       <Header toggleMobileNav={toggleMobileNav} />

       
      <div className=" w-full max-w-screen-xl mx-auto bg-zinc-950 rounded-lg p-1 md:p-6">
        <div className="flex items-center justify-start   gap-4 ">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ">Escrow Details</h1>
      </div>
     
      <EscrowDetails escrowId={escrowId} />
    
      </div>
    </div>
  )
} 