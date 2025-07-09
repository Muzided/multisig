"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { TransactionsTab } from "@/components/dashboard/transaction-tab"
import { CreateTab } from "@/components/dashboard/create-tab"
import { DisputeResolution } from "@/components/dashboard/dispute-resolution"
import { Escrows } from "@/components/dashboard/Escrows"
import ConnectPage from "@/components/dashboard/ConnectPage"
import { useAppKitAccount } from "@reown/appkit/react"
import DaoTab from "@/components/dashboard/doa-tab"
import { useUser } from "@/context/userContext"
import ObserveDispute from "@/components/dashboard/observe-dispute"
import { ObserveEscrow } from "@/components/dashboard/observe-escrow"
import { useTab } from "@/context/TabContext"

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false)
  const {activeTab, setActiveTab} = useTab()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { isAuthenticated } = useUser()

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    setIsClient(true) // Ensures document-related code runs only on the client
  }, [])

  if (!isClient) return null // Prevents SSR issues

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-white dark:bg-black dark:from-black dark:to-black">
      <Header toggleMobileNav={toggleMobileNav} />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setIsMobileNavOpen(false)
          }}
          isMobileNavOpen={isMobileNavOpen}
        />

        {/* Main content area with left padding to account for fixed sidebar */}
        <main className="flex-1 overflow-auto p-4 md:p-6 md:ml-64">
          {!isAuthenticated ?
            <ConnectPage />
            :
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <DashboardHeader activeTab={activeTab} />

              <TabsContent value="overview" className="mt-0">

                <OverviewTab />
              </TabsContent>

              <TabsContent value="escrows" className="mt-0">
                <Escrows />
              </TabsContent>

              <TabsContent value="create" className="mt-0">
                <CreateTab />
              </TabsContent>
              <TabsContent value="dispute" className="mt-0">
                <DisputeResolution />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <TransactionsTab />
              </TabsContent>
              <TabsContent value="observe-dispute" className="mt-0">
                <ObserveDispute />
              </TabsContent>
              <TabsContent value="observe-escrow" className="mt-0">
              <ObserveEscrow/>
              </TabsContent>
            </Tabs>
          }
        </main>
      </div>

      {/* Overlay for mobile nav */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm dark:bg-black/50 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  )
}

