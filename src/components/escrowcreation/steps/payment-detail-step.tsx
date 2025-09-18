import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentType } from "../create-escrow-form";

export default function PaymentDetailsStep({
  paymentType,
  setPaymentType,
}: {
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="paymentType" className="text-zinc-700 font-medium dark:text-zinc-100">
          Payment Type
        </Label>
        <Select value={paymentType} onValueChange={(v: "full" | "milestone") => setPaymentType(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Amount</SelectItem>
            <SelectItem value="milestone">Milestone-based</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
