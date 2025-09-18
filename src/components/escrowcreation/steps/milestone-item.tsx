import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import DatePicker from "react-datepicker";

export default function MilestoneItem({
  index,
  milestone,
  now,
  onChangeAmount,
  onChangeDate,
  onRemove,
  canRemove,
}: {
  index: number;
  milestone: { amount: string; date: Date; description: string };
  now: Date;
  onChangeAmount: (val: string) => void;
  onChangeDate: (date: Date) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <Label className="text-zinc-700 font-medium dark:text-zinc-100">
          Milestone {index + 1}
        </Label>
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-[#BB7333] hover:bg-[#BB7333]/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Amount (USDT)"
          value={milestone.amount}
          onChange={(e) => onChangeAmount(e.target.value)}
          className="w-full border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
            transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
          required
        />
        {index === 0 && (
          <div className="space-y-1">
            <Label className="text-sm text-zinc-500 mb-1 block">
              Select First Milestone Completion Date
            </Label>
            <DatePicker
              selected={milestone.date}
              onChange={(date) => date && onChangeDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd HH:mm"
              minDate={now}
              className="w-full cursor-pointer border p-1.5 rounded-md text-center"
              required
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">ⓘ Must be at least 24 hours from now</p>
          </div>
        )}
      </div>
    </div>
  );
}
