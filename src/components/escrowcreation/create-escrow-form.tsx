"use client";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ethers } from "ethers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { useWeb3 } from "@/context/Web3Context";
import { useFactory } from "@/Hooks/useFactory";
import { dateToUnix } from "../../../utils/helper";
import { EscrowCreationData } from "@/types/user";
import { saveEscrow } from "@/services/Api/escrow/escrow";
import { handleApiError, handleError } from "../../../utils/errorHandler";
import { toast } from "react-toastify";
import { createEscrowResponse } from "@/types/escrow";
import { useUser } from "@/context/userContext";
import { updateUserEmail } from "@/services/Api/auth/auth";
import { useTab } from "@/context/TabContext";

import Stepper from "./stepper";
import PaymentDetailsStep from "./steps/payment-detail-step";
import ReceiverInfoStep from "./steps/receiver-info-step";
import ProjectTimelineStep, { Milestone } from "./steps/project-timeline-step";
import AdditionalSettingsStep from "./steps/additional-settings-step";
import ContractTermsStep from "./steps/contract-terms-step";
import ReviewStep from "./steps/review-step";
import EmailRegistrationModal from "./email-registration-modal";

export type PaymentType = "full" | "milestone";

const STEPS = [
  { id: 1, title: "Payment Details", description: "Choose payment type and amount" },
  { id: 2, title: "Receiver Information", description: "Enter receiver's details" },
  { id: 3, title: "Project Timeline", description: "Set project duration and milestones" },
  { id: 4, title: "Additional Settings", description: "Configure observer and jurisdiction" },
  { id: 5, title: "Contract Terms", description: "Add custom contract terms (Optional)" },
  { id: 6, title: "Review & Create", description: "Review details and create escrow" },
];

export default function CreateEscrowForm() {
  // base state
  const now = useMemo(() => new Date(), []);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = STEPS.length;

  // payment + receiver
  const [paymentType, setPaymentType] = useState<PaymentType>("full");
  const [amount, setAmount] = useState("");
  const [totalMilestoneAmount, setTotalMilestoneAmount] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([{ amount: "", date: now, description: "" }]);
  const [milestoneError, setMilestoneError] = useState("");

  const [receiver, setReceiver] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [addrError, setAddrError] = useState("");

  // timeline
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [unixTimestamp, setUnixTimestamp] = useState<number>(Math.floor(now.getTime() / 1000));

  // settings
  const [observer, setObserver] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  // contract terms
  const [contractEnabled, setContractEnabled] = useState(false);
  const [contractHtml, setContractHtml] = useState<string>("");
  const [editedContractHtml, setEditedContractHtml] = useState<string>("");
  const [clientSignature, setClientSignature] = useState<string>("");
  const [providerSignature, setProviderSignature] = useState<string>("");
  const [hasSavedContract, setHasSavedContract] = useState(false);
  const [showDownloadBtn, setShowDownloadBtn] = useState(false);

  // fee + legal
  const [profitAmount, setProfitAmount] = useState<number>(0);
  const [legalAgreement, setLegalAgreement] = useState(false);

  // submit / contexts
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signer, account } = useWeb3();
  const { user, setUser } = useUser();
  const { setActiveTab } = useTab();
  const { creationFee, createEscrow } = useFactory();

  // email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // stepper description
  const stepDesc = useMemo(() => STEPS[currentStep - 1]?.description ?? "", [currentStep]);

  // effects
  useEffect(() => {
    if (user && !user.email) setShowEmailModal(true);
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (currentStep !== 5) return;
      const amounts = paymentType === "full" ? [amount] : milestones.map(m => m.amount);
      if (!amounts.length || !amounts.every(a => a && !isNaN(Number(a)))) return;
      const res = await creationFee(amounts);
      if (res?.success) setProfitAmount(res.feeAmount);
    };
    run();
  }, [currentStep, paymentType, amount, milestones, creationFee]);

  // helpers
  const onReceiverChange = (addr: string) => {
    setReceiver(addr);
    setAddrError(ethers.isAddress(addr) ? "" : "Invalid Ethereum address");
  };

  const validateStepAndNext = () => {
    if (user && !user.email) {
      setShowEmailModal(true);
      return;
    }

    // Step 2 validations
    if (currentStep === 2) {
      if (!receiver || !receiverEmail) return toast.error("Please fill in both receiver's wallet and email");
      if (!ethers.isAddress(receiver)) return toast.error("Please enter a valid Ethereum address");
      if (!receiverEmail.includes("@")) return toast.error("Please enter a valid email address");
    }

    // Step 3 validations
    if (currentStep === 3) {
      if (paymentType === "full") {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          return toast.error("Please enter a valid amount greater than 0");
        }
        const hoursDiff = (selectedDate.getTime() - new Date().getTime()) / 36e5;
        if (hoursDiff < 24) return toast.error("Project duration must be at least 24 hours");
      } else {
        if (!totalMilestoneAmount || isNaN(parseFloat(totalMilestoneAmount)) || parseFloat(totalMilestoneAmount) <= 0) {
          return toast.error("Please enter a valid total project amount");
        }
        const invalid = milestones.find(m => !m.amount || isNaN(parseFloat(m.amount)) || parseFloat(m.amount) <= 0);
        if (invalid) return toast.error("All milestones must have valid amounts");

        const sum = milestones.reduce((s, m) => s + Number(m.amount || 0), 0);
        if (sum !== Number(totalMilestoneAmount)) return toast.error("Milestone amounts must sum up to the total amount");
        if (!milestones[0]?.date) return toast.error("First milestone completion date is required");
      }
    }

    // Step 5 validations: if contract added, require signature before moving on
    if (currentStep === 5) {
      if (contractHtml && !clientSignature) {
        return toast.error("Please sign the contract or remove it before continuing");
      }
    }

    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const prev = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const handleEmailUpdate = async () => {
    if (!userEmail || !userEmail.includes("@")) return toast.error("Please enter a valid email address");
    if (userEmail.length > 254) return toast.error("Email address cannot be longer than 254 characters");
    setIsUpdatingEmail(true);
    try {
      const response = await updateUserEmail(userEmail);
      if (response.status === 200) {
        toast.success(response?.data?.message);
        setShowEmailModal(false);
        setUser(response?.data?.user);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!user?.email) {
        toast.error("Please register your email address first");
        setShowEmailModal(true);
        setIsSubmitting(false);
        return;
      }
      if (!receiver || !receiverEmail) return toast.error("Receiver's wallet address and email are required");
      if (account === observer) return toast.error("Observer cannot be same as the Creator");
      if (account === receiver) return toast.error("Receiver cannot be same as the Creator");
      if (!ethers.isAddress(receiver)) return toast.error("Please enter a valid Ethereum address");
      if (user.email === receiverEmail) return toast.error("Receiver's email cannot be same as creator email");
      if (!receiverEmail.includes("@")) return toast.error("Please enter a valid email address");

      const userAddress = account!;
      const milestoneAmounts = milestones.map(m => m.amount);
      const firstMilestoneUnix = dateToUnix(milestones[0].date);

      let escrowCreationResponse: createEscrowResponse;
      if (paymentType === "full") {
        escrowCreationResponse = await createEscrow(
          userAddress,
          receiver,
          observer || "0x0000000000000000000000000000000000000000",
          [amount],
          unixTimestamp,
          setIsSubmitting
        );
      } else {
        escrowCreationResponse = await createEscrow(
          userAddress,
          receiver,
          observer || "0x0000000000000000000000000000000000000000",
          milestoneAmounts,
          firstMilestoneUnix,
          setIsSubmitting
        );
      }

      if (escrowCreationResponse?.success) {
        const payload: EscrowCreationData = {
          receiver_walletaddress: receiver,
          receiver_email: receiverEmail,
          amount: paymentType === "full" ? parseFloat(amount) : parseFloat(totalMilestoneAmount),
          due_date: paymentType === "full" ? unixTimestamp : dateToUnix(milestones[milestones.length - 1].date),
          payment_type: paymentType,
          jurisdiction_tag: jurisdiction,
          document_html: editedContractHtml || contractHtml,
          kyc_required: false,
          observer_wallet: observer || "0x0000000000000000000000000000000000000000",
          platform_fee_type: "percentage",
          platform_fee_value: 1,
          creator_signature: !!clientSignature,
          receiver_signature: false,
          escrow_contract_address: escrowCreationResponse.escrow_contract_address,
          transaction_hash: escrowCreationResponse.transaction_hash,
          ProfitAmount: escrowCreationResponse.admin_profit,
          ...(paymentType === "milestone" && {
            milestones: milestones.map(m => ({
              amount: parseFloat(m.amount),
              due_date: dateToUnix(m.date),
              description: m.description,
            })),
          }),
        };

        const resp = await saveEscrow(payload);
        if (resp.status === 201) {
          toast.success(resp?.data?.message);
          // reset minimal state & go to list
          setAmount("");
          setReceiver("");
          setMilestones([{ amount: "", date: now, description: "" }]);
          setTotalMilestoneAmount("");
          setPaymentType("full");
          setObserver("");
          setJurisdiction("");
          setMilestoneError("");
          setActiveTab("escrows");
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <EmailRegistrationModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        isUpdating={isUpdatingEmail}
        onSubmit={handleEmailUpdate}
      />

      <Card className="border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 shadow-lg text-zinc-900 
        dark:border-zinc-800 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-100 dark:shadow-none">
        <CardHeader className="pb-6 text-center">
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-base">
            {stepDesc}
          </CardDescription>
        </CardHeader>

        <div className="md:px-4 lg:px-8 py-4">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8">
            {currentStep === 1 && (
              <PaymentDetailsStep paymentType={paymentType} setPaymentType={setPaymentType} />
            )}

            {currentStep === 2 && (
              <ReceiverInfoStep
                receiver={receiver}
                receiverEmail={receiverEmail}
                onReceiverChange={onReceiverChange}
                setReceiverEmail={setReceiverEmail}
                addrError={addrError}
              />
            )}

            {currentStep === 3 && (
              <ProjectTimelineStep
                now={now}
                paymentType={paymentType}
                amount={amount}
                setAmount={setAmount}
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  setUnixTimestamp(Math.floor(d.getTime() / 1000));
                }}
                milestones={milestones}
                setMilestones={setMilestones}
                totalMilestoneAmount={totalMilestoneAmount}
                setTotalMilestoneAmount={setTotalMilestoneAmount}
                milestoneError={milestoneError}
                setMilestoneError={setMilestoneError}
              />
            )}

            {currentStep === 4 && (
              <AdditionalSettingsStep
                observer={observer}
                setObserver={setObserver}
                jurisdiction={jurisdiction}
                setJurisdiction={setJurisdiction}
              />
            )}

            {currentStep === 5 && (
              <ContractTermsStep
                contractEnabled={contractEnabled}
                setContractEnabled={setContractEnabled}
                contractHtml={contractHtml}
                setContractHtml={setContractHtml}
                editedContractHtml={editedContractHtml}
                setEditedContractHtml={setEditedContractHtml}
                clientSignature={clientSignature}
                setClientSignature={setClientSignature}
                providerSignature={providerSignature}
                setProviderSignature={setProviderSignature}
                hasSavedContract={hasSavedContract}
                setHasSavedContract={setHasSavedContract}
                showDownloadBtn={showDownloadBtn}
                setShowDownloadBtn={setShowDownloadBtn}
              />
            )}

            {currentStep === 6 && (
              <ReviewStep
                paymentType={paymentType}
                amount={amount}
                receiverEmail={receiverEmail}
                totalMilestoneAmount={totalMilestoneAmount}
                receiver={receiver}
                selectedDate={selectedDate}
                milestones={milestones}
                profitAmount={profitAmount}
                observer={observer}
                jurisdiction={jurisdiction}
                contractEnabled={contractEnabled}
                legalAgreement={legalAgreement}
                setLegalAgreement={setLegalAgreement}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-between px-8 py-6">
            <Button type="button" variant="outline" onClick={prev} disabled={currentStep === 1} className="flex items-center px-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                type="submit"
                disabled={isSubmitting || !legalAgreement}
                className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white shadow-md hover:shadow-lg 
                  hover:from-[#965C29] hover:to-[#7A4A21] transition-all duration-300 px-6"
              >
                {isSubmitting ? "Creating..." : "Create Escrow"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={validateStepAndNext}
                className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white shadow-md hover:shadow-lg 
                  hover:from-[#965C29] hover:to-[#7A4A21] transition-all duration-300 px-6"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
