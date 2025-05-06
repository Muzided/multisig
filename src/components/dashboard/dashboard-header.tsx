import { Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  activeTab: string
}

export function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  const titles = {
    overview: "Dashboard Overview",
    escrows: "Manage Escrow's",
    create: "Create New Escrow",
    dispute: "Dispute ",
    history: "History",
  }

  const descriptions = {
    overview: "Manage your multi-signature transactions securely",
    escrows: "View and manage all your escrow's ",
    create: "Set up a new multi-signature escrow transaction",
    dispute: "View ,track and manage all your escrow disputes",
    history: "View your escrow history and track transactions on Etherscan",
  }

  console.log("activeTab", activeTab)
  return (
    <div className={`${activeTab ==='create'?'md:justify-center':'md:justify-between'} mb-6  flex flex-col gap-4 md:flex-row md:items-center `}>
      <div>
        <h1
          className={`
            ${activeTab ==='create'?'text-center':'text-start'}
            text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent
          dark:from-white dark:to-zinc-300`}
        >
          {titles[activeTab as keyof typeof titles]}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">{descriptions[activeTab as keyof typeof descriptions]}</p>
      </div>

      

      {activeTab !== "create" && (
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md 
          hover:shadow-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300
          dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
          dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Escrow
        </Button>
      )}
    </div>
  )
}

