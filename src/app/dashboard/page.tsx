"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CreditCard,
  Filter,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import Lottie from "lottie-react";
import animationData from "../../../public/animations/secure.json";
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
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { EscrowOverview } from "@/components/Global/escrow-overview"
import { CreateEscrowForm } from "@/components/Global/create-escrow-form"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
console.log('active-shite',activeTab)
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white">
          <div className="flex flex-col items-center">
            <Lottie animationData={animationData} className="w-10 h-10" />
          </div>
            MultiSig Escrow
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <div className="h-8 w-8 rounded-full bg-blue-600"></div>
                <span>0x1a2...3b4c</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              {/* <DropdownMenuItem className="hover:bg-zinc-800 hover:text-white">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem className="hover:bg-zinc-800 hover:text-white">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-950 md:block">
          <nav className="flex flex-col gap-1 p-4">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className={`flex w-full justify-start gap-2 ${activeTab === "overview" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "transactions" ? "default" : "ghost"}
              className={`flex w-full justify-start gap-2 ${activeTab === "transactions" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              onClick={() => setActiveTab("transactions")}
            >
              <CreditCard className="h-5 w-5" />
              Transactions
            </Button>
            <Button
              variant={activeTab === "create" ? "default" : "ghost"}
              className={`flex w-full justify-start gap-2 ${activeTab === "create" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              onClick={() => setActiveTab("create")}
            >
              <Plus className="h-5 w-5" />
              Create Escrow
            </Button>
            {/* <Button
              variant={activeTab === "signers" ? "default" : "ghost"}
              className={`flex w-full justify-start gap-2 ${activeTab === "signers" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              onClick={() => setActiveTab("signers")}
            >
              <Users className="h-5 w-5" />
              Signers
            </Button> */}
            {/* <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className={`flex w-full justify-start gap-2 ${activeTab === "settings" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button> */}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "transactions" && "Escrow Transactions"}
                  {activeTab === "create" && "Create New Escrow"}
                  {activeTab === "signers" && "Manage Signers"}
                  {activeTab === "settings" && "Settings"}
                </h1>
                <p className="text-zinc-400">
                  {activeTab === "overview" && "Manage your multi-signature transactions securely"}
                  {activeTab === "transactions" && "View and manage all your escrow transactions"}
                  {activeTab === "create" && "Set up a new multi-signature escrow transaction"}
                  {activeTab === "signers" && "View and manage escrow signers"}
                  {activeTab === "settings" && "Configure your account settings"}
                </p>
              </div>
              {activeTab === "transactions" && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              )}
              {activeTab === "create" && (
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Escrow
                </Button>
              )}
            </div>

            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Escrows</CardTitle>
                    <CardDescription className="text-zinc-400">Your current escrow transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">3</div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pending Signatures</CardTitle>
                    <CardDescription className="text-zinc-400">Transactions awaiting your approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">2</div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Value Locked</CardTitle>
                    <CardDescription className="text-zinc-400">Value secured in escrow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">5.24 ETH</div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h2 className="mb-4 text-xl font-semibold text-white">Recent Escrows</h2>
                <EscrowOverview limit={5} />
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <EscrowOverview limit={20} />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              <CreateEscrowForm />
            </TabsContent>

            <TabsContent value="signers" className="mt-0">
              <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader>
                  <CardTitle>Manage Signers</CardTitle>
                  <CardDescription>View and manage signers for your escrow transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Signer management functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">Settings functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

