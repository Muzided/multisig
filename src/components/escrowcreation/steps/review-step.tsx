import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PaymentType } from "../create-escrow-form";
import type { Milestone } from "./project-timeline-step";

export default function ReviewStep({
  paymentType,
  amount,
  receiverEmail,
  totalMilestoneAmount,
  receiver,
  selectedDate,
  milestones,
  profitAmount,
  observer,
  jurisdiction,
  contractEnabled,
  legalAgreement,
  setLegalAgreement,
}: {
  paymentType: PaymentType;
  amount: string;
  receiverEmail:string;
  totalMilestoneAmount: string;
  receiver: string;
  selectedDate: Date;
  milestones: Milestone[];
  profitAmount: number;
  observer: string;
  jurisdiction: string;
  contractEnabled: boolean;
  legalAgreement: boolean;
  setLegalAgreement: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review Details</h3>
        <div className="space-y-2">
          <p><strong>Payment Type:</strong> {paymentType === "full" ? "Full Amount" : "Milestone-based"}</p>
          <p><strong>Amount:</strong> {paymentType === "full" ? amount : totalMilestoneAmount} USDT</p>
          <p><strong>Receiver:</strong> {receiver}</p>
          <p><strong>Receiver Email Address:</strong> {receiverEmail}</p>
          <p>
            <strong>{paymentType === "full" ? "Project" : "Milestone"} Duration:</strong>{" "}
            {paymentType === "full"
              ? selectedDate.toLocaleString()
              : milestones.length > 0 && <span className="ml-2">{new Date(milestones[0].date).toLocaleString()}</span>}
          </p>
          <p><strong>Creation Fee:</strong> {profitAmount} USDT</p>
          {observer && <p><strong>Observer:</strong> {observer}</p>}
          {jurisdiction && <p><strong>Jurisdiction:</strong> {jurisdiction}</p>}
          {contractEnabled && <p><strong>Custom Contract Terms:</strong> Added</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="legalAgreement" checked={legalAgreement} onCheckedChange={(c) => setLegalAgreement(!!c)} required />
        <Label htmlFor="legalAgreement" className="text-sm text-zinc-700 dark:text-zinc-300">
          I agree to be legally bound by the terms of this escrow agreement
        </Label>
      </div>
    </div>
  );
}
