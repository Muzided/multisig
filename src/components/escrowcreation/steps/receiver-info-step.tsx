import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReceiverInfoStep({
  receiver,
  receiverEmail,
  onReceiverChange,
  setReceiverEmail,
  addrError,
}: {
  receiver: string;
  receiverEmail: string;
  onReceiverChange: (addr: string) => void;
  setReceiverEmail: (v: string) => void;
  addrError?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="receiver" className="text-zinc-700 font-medium dark:text-zinc-100">
          Receiver's Information
        </Label>
        <Input
          id="receiver"
          placeholder="Wallet address (0x...)"
          value={receiver}
          onChange={(e) => onReceiverChange(e.target.value)}
          className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
            transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
          required
        />
        {addrError && <p className="text-red-500 text-sm">{addrError}</p>}
        <Input
          type="email"
          placeholder="Receiver's email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          className="mt-2 border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
            transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
          required
        />
      </div>
    </div>
  );
}
