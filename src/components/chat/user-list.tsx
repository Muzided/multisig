"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, MessageSquare } from "lucide-react"
import { Resolver } from "@/types/escrow"
import { formatAddress } from "../../../utils/helper"


export function UserList({ user, onSelectUser }: { user: Resolver, onSelectUser: (user: Resolver) => void }) {
  return (
    <div className="space-y-2">
      <Card
        key={user._id}
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
        onClick={() => onSelectUser(user)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium hidden md:block">{user.wallet_address}</h3>
              <h3 className="font-medium md:hidden">{formatAddress(user.wallet_address)}</h3>
              <p className="text-sm text-gray-500">Resolver</p>
            </div>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
