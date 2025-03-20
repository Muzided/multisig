"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { TransactionsTab } from "@/components/dashboard/transaction-tab"
import { CreateTab } from "@/components/dashboard/create-tab"

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("overview")
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsClient(true); // Ensures document-related code runs only on the client
  }, []);

  if (!isClient) return null; // Prevents SSR issues
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

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <DashboardHeader activeTab={activeTab} />

            <TabsContent value="overview" className="mt-0">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <TransactionsTab />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              <CreateTab />
            </TabsContent>
          </Tabs>
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

