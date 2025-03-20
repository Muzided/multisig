import { StatsCard } from "@/components/dashboard/stats-card"
import { EscrowOverview } from "@/components/Global/escrow-overview"

export function OverviewTab() {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Active Escrows" description="Your current escrow transactions" value="3" />
        <StatsCard title="Pending Signatures" description="Transactions awaiting your approval" value="2" />
        <StatsCard title="Total Value Locked" description="Value secured in escrow" value="5.24 ETH" />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">Recent Escrows</h2>
        <EscrowOverview limit={5} />
      </div>
    </>
  )
}

