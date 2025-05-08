"use client"

import { CreditCard, LayoutDashboard, Plus,MessageSquareDot , ReceiptText ,BadgeAlert} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/context/Web3Context"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isMobileNavOpen: boolean
}


export function Sidebar({ activeTab, setActiveTab, isMobileNavOpen }: SidebarProps) {
  const {isDisputeMember} = useWeb3()

  console.log("isDisputeMember",isDisputeMember)
  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "escrows",
      label: "Escrow",
      icon: CreditCard,
    },
    {
      id: "create",
      label: "Create Escrow",
      icon: Plus,
    },
    {
      id: "dispute",
      label: "Dispute",
      icon: BadgeAlert,
    },
    {
      id: "history",
      label: "History",
      icon: ReceiptText,
    },
  ]

  const filteredNavItems = isDisputeMember 
  ? navItems.filter((item) => item.id !== "dispute") 
  : navItems;
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden fixed top-16 left-0 bottom-0 w-64 border-r border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-white 
        shadow-[1px_0_3px_rgba(0,0,0,0.02)] dark:border-zinc-800 dark:bg-zinc-950 dark:from-zinc-950 
        dark:to-zinc-950 dark:shadow-none md:block overflow-y-auto"
      >
        <nav className="flex flex-col gap-2 p-4">
          {filteredNavItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={
                activeTab === item.id
                  ? "flex w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transition-all duration-200 dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:shadow-none"
                  : "flex w-full justify-start gap-2 text-zinc-600 transition-all duration-200 hover:bg-white hover:shadow-sm hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white dark:hover:shadow-none"
              }
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={activeTab === item.id ? "h-5 w-5 text-white" : "h-5 w-5"} />
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-0 z-40 w-full transform bg-white/95 backdrop-blur-sm transition-transform 
          duration-300 ease-in-out shadow-lg dark:bg-zinc-950 dark:shadow-none md:hidden ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full pt-16">
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={
                  activeTab === item.id
                    ? "flex w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transition-all duration-200 dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:shadow-none"
                    : "flex w-full justify-start gap-2 text-zinc-600 transition-all duration-200 hover:bg-white hover:shadow-sm hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white dark:hover:shadow-none"
                }
                onClick={() => {
                  setActiveTab(item.id)
                  // Close mobile nav when an item is selected
                }}
              >
                <item.icon className={activeTab === item.id ? "h-5 w-5 text-white" : "h-5 w-5"} />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

