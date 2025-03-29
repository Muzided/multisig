import { Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  activeTab: string
}

export function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  const titles = {
    overview: "Dashboard Overview",
    transactions: "Escrow Transactions",
    create: "Create New Escrow",
    signers: "Manage Signers",
    settings: "Settings",
  }

  const descriptions = {
    overview: "Manage your multi-signature transactions securely",
    transactions: "View and manage all your escrow transactions",
    create: "Set up a new multi-signature escrow transaction",
    signers: "View and manage escrow signers",
    settings: "Configure your account settings",
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

      {activeTab === "transactions" && (
        <Button
          variant="outline"
          className="flex items-center gap-2 border-zinc-200 bg-white shadow-sm text-zinc-700 
            hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md transition-all duration-200
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none 
            dark:hover:bg-zinc-700 dark:hover:border-zinc-600 dark:hover:shadow-none"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      )}

      {/* {activeTab === "create" && (
        <Button
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md 
          hover:shadow-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300
          dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
          dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Escrow
        </Button>
      )} */}
    </div>
  )
}

