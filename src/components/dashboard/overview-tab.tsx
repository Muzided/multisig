import { StatsCard } from "@/components/dashboard/stats-card"
import { EscrowOverview } from "@/components/Global/escrow-overview"
import { useWeb3 } from "@/context/Web3Context"
import { useFactory } from "@/Hooks/useFactory"
import { getUserStats } from "@/services/Api/user/user"
import { DashboardStats } from "@/types/escrow"
import { useAppKitAccount } from "@reown/appkit/react"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export function OverviewTab() {

  //web 3 context
  const { signer } = useWeb3()
  const { address } = useAppKitAccount();
  const { updateDisputeTeamMembers } = useFactory()

  //multi-sig factory contract hook
  const { fetchTotalEscrows, fetchTotalPayments } = useFactory()

  //states
  const [totalEscrows, setTotalEscrows] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<string>("0")

  useEffect(() => {
    if (!signer) return
    fetchNumberOfEscrows()
    totalPaymentsMade()
  }, [signer])

  const fetchNumberOfEscrows = async () => {
    const res = await fetchTotalEscrows()
    setTotalEscrows(res)
  }

  const totalPaymentsMade = async () => {
    const res = await fetchTotalPayments()
    setTotalPayments(res)
  }


  const { data: userEscrows, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['user-details'],
    queryFn: async () => {
      const response = await getUserStats();
      return response.data;
    },
    enabled: !!address,
  });

  console.log("userEscrowszzzz", userEscrows)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <StatsCard title="Total Escrows" description="Your total escrow created" value={userEscrows?.escrows?.total || 0} />
        {/* <StatsCard title="Pending Signatures" description="Transactions awaiting your approval" value="2" /> */}
        <StatsCard title="Active Escrows" description="Escrows you are actively involved in" value={userEscrows?.escrows?.active || 0} />
      </div>
      {/* <button 
      onClick={updateDisputeTeamMembers}
      > click me </button> */}

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold bg-gradient-to-r from-[#BB7333] to-[#965C29] bg-clip-text text-transparent dark:from-[#BB7333] dark:to-[#965C29]">Recent Escrows</h2>
        <EscrowOverview limit={5} />
      </div>
    </>
  )
}

