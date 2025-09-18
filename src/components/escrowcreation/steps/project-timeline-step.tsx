import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DatePicker from "react-datepicker";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MilestoneItem from "./milestone-item";
import type { PaymentType } from "../create-escrow-form";

export type Milestone = { amount: string; date: Date; description: string };

export default function ProjectTimelineStep({
  now,
  paymentType,
  amount,
  setAmount,
  selectedDate,
  setSelectedDate,
  milestones,
  setMilestones,
  totalMilestoneAmount,
  setTotalMilestoneAmount,
  milestoneError,
  setMilestoneError,
}: {
  now: Date;
  paymentType: PaymentType;
  amount: string;
  setAmount: (v: string) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  milestones: Milestone[];
  setMilestones: (m: Milestone[]) => void;
  totalMilestoneAmount: string;
  setTotalMilestoneAmount: (v: string) => void;
  milestoneError: string;
  setMilestoneError: (v: string) => void;
}) {
  const addMilestone = () => setMilestones([...milestones, { amount: "", date: new Date(), description: "" }]);

  const removeMilestone = (index: number) => {
    const copy = [...milestones];
    copy.splice(index, 1);
    setMilestones(copy);
  };

  const updateMilestoneAmount = (index: number, value: string) => {
    const copy = [...milestones];
    copy[index] = { ...copy[index], amount: value };
    setMilestones(copy);

    if (totalMilestoneAmount) {
      const total = copy.reduce((s, m) => s + Number(m.amount || 0), 0);
      setMilestoneError(total !== Number(totalMilestoneAmount) ? "Milestone amounts must sum up to the total amount" : "");
    }
  };

  const updateMilestoneDate = (index: number, date: Date) => {
    const copy = [...milestones];
    copy[index] = { ...copy[index], date };
    setMilestones(copy);
  };

  const handleTotalAmountChange = (v: string) => {
    setTotalMilestoneAmount(v);
    const total = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);
    setMilestoneError(v && total !== Number(v) ? "Milestone amounts must sum up to the total amount" : "");
  };

  if (paymentType === "full") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="datetime" className="text-zinc-700 font-medium dark:text-zinc-100">
            Project Duration
          </Label>
          <DatePicker
            id="datetime"
            selected={selectedDate}
            onChange={(d) => d && setSelectedDate(d)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="yyyy-MM-dd HH:mm"
            minDate={now}
            className="border-zinc-200 p-1.5 text-center rounded-b-md cursor-pointer dark:hover:bg-zinc-600 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
              transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
            required
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">ⓘ Project duration must be at least 24 hours from now</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-zinc-700 font-medium dark:text-zinc-100">
            Amount (USDT)
          </Label>
          <Input
            id="amount"
            type="text"
            placeholder="e.g. 1.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
              transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
            required
          />
        </div>
      </div>
    );
  }

  // milestone mode
  return (
    <div className="space-y-6">
      <div className="bg-[#BB7333]/10 dark:bg-[#BB7333]/20 p-4 rounded-lg border border-[#BB7333]/20 dark:border-[#BB7333]/30">
        <h4 className="text-sm font-medium text-[#BB7333] dark:text-[#BB7333]/90 mb-2">Milestone Guidelines</h4>
        <ul className="text-sm text-[#965C29] dark:text-[#BB7333]/80 space-y-1">
          <li>• First milestone completion date is required</li>
          <li>• Subsequent milestone dates will be set after previous milestone completion</li>
          <li>• Total of all milestone amounts must equal the project amount</li>
          <li>• Each milestone must have a valid amount greater than 0</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAmount" className="text-zinc-700 font-medium dark:text-zinc-100">
          Total Project Amount (USDT)
        </Label>
        <Input
          id="totalAmount"
          type="text"
          placeholder="e.g. 1.5"
          value={totalMilestoneAmount}
          onChange={(e) => handleTotalAmountChange(e.target.value)}
          className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
            transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
            dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-zinc-700 font-medium dark:text-zinc-100">Milestones</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMilestone}
          className="h-8 border-[#BB7333] text-[#BB7333] hover:bg-[#BB7333] hover:text-white"
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Milestone
        </Button>
      </div>

      {milestoneError && <p className="text-red-500 text-sm">{milestoneError}</p>}

      {milestones.map((m, i) => (
        <MilestoneItem
          key={i}
          index={i}
          milestone={m}
          now={now}
          canRemove={milestones.length > 1}
          onChangeAmount={(v) => updateMilestoneAmount(i, v)}
          onChangeDate={(d) => updateMilestoneDate(i, d)}
          onRemove={() => removeMilestone(i)}
        />
      ))}
    </div>
  );
}
