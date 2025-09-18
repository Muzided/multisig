import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdditionalSettingsStep({
  observer,
  setObserver,
  jurisdiction,
  setJurisdiction,
}: {
  observer: string;
  setObserver: (v: string) => void;
  jurisdiction: string;
  setJurisdiction: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="observer" className="text-zinc-700 font-medium dark:text-zinc-100">
          Observer (Optional)
        </Label>
        <Input
          id="observer"
          placeholder="Observer wallet address (0x...)"
          value={observer}
          onChange={(e) => setObserver(e.target.value)}
          className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
            transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jurisdiction" className="text-zinc-700 font-medium dark:text-zinc-100">
          Jurisdiction
        </Label>
        <Select value={jurisdiction} onValueChange={setJurisdiction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select jurisdiction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EU">European Union</SelectItem>
            <SelectItem value="US">United States</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
