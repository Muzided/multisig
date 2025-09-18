"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Resolver } from "@/types/escrow";
import { formatAddress } from "../../../utils/helper";

export default function ChatHeader({
  onBack,
  user,
  isConnected,
}: {
  onBack: () => void;
  user: Resolver;
  isConnected: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
        <ShieldCheck className="h-6 w-6 text-gray-500" />
      </div>
      <div>
        <h3 className="font-medium">{formatAddress(user.wallet_address)}</h3>
        <p className="text-sm text-gray-500">Resolver</p>
      </div>
      <div className="ml-auto">
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
    </div>
  );
}
