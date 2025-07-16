"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Plus, Trash2, ChevronLeft, ChevronRight, Download } from "lucide-react"
// @ts-ignore
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWeb3 } from "@/context/Web3Context"
import { useFactory } from "@/Hooks/useFactory"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ethers } from "ethers"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { contractTemplates } from "../../../public/Data/ContractHtmls"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SignaturePadComponent } from './signature-pad'
import { dateToUnix } from "../../../utils/helper"
import { EscrowCreationData } from "@/types/user"
import { saveEscrow } from "@/services/Api/escrow/escrow"
import { handleApiError, handleError } from "../../../utils/errorHandler"
import { toast } from "react-toastify"
import { createEscrowResponse } from "@/types/escrow"
import { useUser } from "@/context/userContext"
import { updateUserEmail } from "@/services/Api/auth/auth"
import { useTab } from "@/context/TabContext"

export function CreateEscrowForm() {
  const [amount, setAmount] = useState("")
  const [receiver, setReceiver] = useState("")
  const [receiverEmail, setReceiverEmail] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const now = new Date(); // Define 'now' as the current date and time
  const [selectedDate, setSelectedDate] = useState<Date>(now); // Default to now
  const [totalProjectDate, setTotalProjectDate] = useState<Date>(now); // Default to now
  const [unixTimestamp, setUnixTimestamp] = useState<number>(Math.floor(now.getTime() / 1000)); // Default Unix timestamp
  const [paymentType, setPaymentType] = useState<"full" | "milestone">("full")
  const [observer, setObserver] = useState("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [legalAgreement, setLegalAgreement] = useState(false)
  const [milestones, setMilestones] = useState<Array<{
    amount: string
    date: Date
    description: string
    released?: boolean
    disputed?: boolean
    requested?: boolean
    requestTime?: number
  }>>([{ amount: "", date: now, description: "" }])
  const [totalMilestoneAmount, setTotalMilestoneAmount] = useState("")
  const [milestoneError, setMilestoneError] = useState("")
  const [showContractTerms, setShowContractTerms] = useState(false)
  const [contractContent, setContractContent] = useState<string>("")
  const [clientSignature, setClientSignature] = useState<string>("")
  const [providerSignature, setProviderSignature] = useState<string>("")
  const [isEditingContract, setIsEditingContract] = useState(false)
  const [userSignature, setUserSignature] = useState<boolean>(false)
  const [editedContractContent, setEditedContractContent] = useState<string>("")
  const [hasContractBeenSaved, setHasContractBeenSaved] = useState(false)
  const [showDownloadButton, setShowDownloadButton] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [profitAmount, setProfitAmount] = useState<number>(0)
  const [userEmail, setUserEmail] = useState("")
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  //web 3 context
  const { signer, account } = useWeb3()
  //user context
  const { user, setUser } = useUser()
  //tab context
  const { setActiveTab } = useTab()
  // multi-sig factory contract hook
  const { creationFee, createEscrow } = useFactory()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const steps = [
    {
      id: 1,
      title: "Payment Details",
      description: "Choose payment type and amount"
    },
    {
      id: 2,
      title: "Receiver Information",
      description: "Enter receiver's details"
    },
    {
      id: 3,
      title: "Project Timeline",
      description: "Set project duration and milestones"
    },
    {
      id: 4,
      title: "Additional Settings",
      description: "Configure observer and jurisdiction"
    },
    {
      id: 5,
      title: "Contract Terms",
      description: "Add custom contract terms (Optional)"
    },
    {
      id: 6,
      title: "Review & Create",
      description: "Review details and create escrow"
    }
  ]

  useEffect(() => {
    // Check if user needs to register email
    if (user && !user.email) {
      setShowEmailModal(true)
    }
    if (currentStep === 5) {
      if (paymentType === "full") {
        const amounts = [amount];
        calculateEsrowCreationFee(amounts)
      } else {
        const milestoneAmounts = milestones.map(milestone => milestone.amount)
        calculateEsrowCreationFee(milestoneAmounts)
      }

    }
  }, [signer, user, currentStep])
  // This would fetch the user's wallet address from the wallet provider)

  const calculateEsrowCreationFee = async (amount: string[]) => {
    const res = await creationFee(amount);
    if (res.success) {
      console.log("got the value here", res)
      setProfitAmount(res.feeAmount)
    }
  }


  console.log("bith-contracts", editedContractContent)
  const toggleEmailModal = () => {
    if (user && !user.email) {
      setShowEmailModal(true)
      toast.error("Please register your email address first")
    }
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Check if the selected date is at least 24 hours from now
      const now = new Date();
      const hoursDifference = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

      // if (hoursDifference < 24) {
      //   toast.error("Project duration must be at least 24 hours");
      //   return;
      // }

      setSelectedDate(date);
      setUnixTimestamp(Math.floor(date.getTime() / 1000));
    }
  };
  const handleTotalProjectDateChange = (date: Date | null) => {
    if (date) {
      // Check if the selected date is at least 24 hours from now
      const now = new Date();
      const hoursDifference = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        toast.error("Project duration must be at least 24 hours");
        return;
      }

      setTotalProjectDate(date);
      setUnixTimestamp(Math.floor(date.getTime() / 1000));
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { amount: "", date: new Date(), description: "" }])
  }

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones]
    newMilestones.splice(index, 1)
    setMilestones(newMilestones)
  }

  const updateMilestone = (index: number, field: "amount" | "date" | "description", value: string | Date) => {
    const newMilestones = [...milestones]
    newMilestones[index] = { ...newMilestones[index], [field]: value }
    setMilestones(newMilestones)

    // Validate milestone amounts sum up to total
    if (field === "amount") {
      const total = newMilestones.reduce((sum, m) => sum + Number(m.amount || 0), 0)
      if (totalMilestoneAmount && total !== Number(totalMilestoneAmount)) {
        setMilestoneError("Milestone amounts must sum up to the total amount")
      } else {
        setMilestoneError("")
      }
    }

    // Validate first milestone date
    // if (field === "date" && value instanceof Date && index === 0) {
    //   const currentMilestoneDate = new Date(value);
    //   const now = new Date();
    //   const hoursDifference = (currentMilestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    //   if (hoursDifference < 24) {
    //     setMilestoneError("First milestone must be at least 24 hours from now");
    //     return;
    //   }
    //   setMilestoneError("");
    // }
  }

  const handleTotalAmountChange = (value: string) => {
    setTotalMilestoneAmount(value)
    const total = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0)
    if (value && total !== Number(value)) {
      setMilestoneError("Milestone amounts must sum up to the total amount")
    } else {
      setMilestoneError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Check if user has registered email
      if (!user?.email) {
        toast.error("Please register your email address first")
        setShowEmailModal(true)
        setIsSubmitting(false)
        return
      }

      // Validate receiver information
      if (!receiver || !receiverEmail) {
        toast.error("Receiver's wallet address and email are required");
        setIsSubmitting(false);
        return;
      }

      if (account === observer) {
        toast.error("Obserever cannot be same as the Creator");
        setIsSubmitting(false);
        return;
      }

      if (account === receiver) {
        toast.error("Receiver cannot be same as the Creator");
        setIsSubmitting(false);
        return;
      }


      if (!ethers.isAddress(receiver)) {
        toast.error("Please enter a valid Ethereum address");
        setIsSubmitting(false);
        return;
      }
      if (user.email === receiverEmail) {
        toast.error("Receiver's email cannot be same as creator email");
        setIsSubmitting(false);
        return;
      }
      if (user.email === receiverEmail) {
        toast.error("Receiver's email cannot be same as creator email");
        setIsSubmitting(false);
        return;
      }

      if (!receiverEmail.includes('@')) {
        toast.error("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      const userAddress = account

      const milestoneAmounts = milestones.map(milestone => milestone.amount)
      const milestoneTimestamps = dateToUnix(milestones[0].date)// Only get first milestone timestamp

      let escrowCreationResponse: createEscrowResponse;
      if (paymentType === "full") {
        const amounts = [amount];
        const timestamps = unixTimestamp;
        escrowCreationResponse = await createEscrow(
          userAddress,
          receiver,
          observer || "0x0000000000000000000000000000000000000000", // Use zero address if no observer
          amounts,
          timestamps,
          setIsSubmitting
        )
      } else {
        escrowCreationResponse = await createEscrow(
          userAddress,
          receiver,
          observer || "0x0000000000000000000000000000000000000000", // Use zero address if no observer
          milestoneAmounts,
          milestoneTimestamps,
          setIsSubmitting
        )
      }
      if (escrowCreationResponse.success) {


        const escrowCreationData: EscrowCreationData = {
          receiver_walletaddress: receiver,
          receiver_email: receiverEmail,
          amount: paymentType === "full" ? parseFloat(amount) : parseFloat(totalMilestoneAmount),
          due_date: paymentType === "full" ? unixTimestamp : dateToUnix(milestones[milestones.length - 1].date),
          payment_type: paymentType,
          jurisdiction_tag: jurisdiction,
          document_html: editedContractContent,
          kyc_required: false,
          observer_wallet: observer || "0x0000000000000000000000000000000000000000", // Use zero address if no observer
          platform_fee_type: "percentage",
          platform_fee_value: 1,
          creator_signature: userSignature,
          receiver_signature: false,
          escrow_contract_address: escrowCreationResponse.escrow_contract_address,
          transaction_hash: escrowCreationResponse.transaction_hash,
          ProfitAmount: escrowCreationResponse.admin_profit,
          ...(paymentType === "milestone" && {
            milestones: milestones.map(milestone => ({
              amount: parseFloat(milestone.amount),
              due_date: dateToUnix(milestone.date),
              description: milestone.description
            }))
          })
        }

        const response = await saveEscrow(escrowCreationData)

        if (response.status === 201) {

          toast.success(response?.data?.message);
          setAmount("")
          setReceiver("")
          setMilestones([{ amount: "", date: now, description: "" }])
          setTotalMilestoneAmount("")
          setPaymentType("full")
          setObserver("")
          setJurisdiction("")
          setLegalAgreement(false)
          setMilestoneError("")
          setActiveTab("escrows")
        }
      }

    } catch (error) {
      console.log("Error creating escrow:", error)
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReceiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setReceiver(address);

    if (!ethers.isAddress(address)) {
      setError("Invalid Ethereum address");
    } else {
      setError(""); // Clear error if valid
    }
  };

  const nextStep = () => {
    if (user && !user.email) {
      setShowEmailModal(true)
      return;
    }
    // Add validation for step 2 (Receiver Information)
    if (currentStep === 2) {
      if (!receiver || !receiverEmail) {
        toast.error("Please fill in both receiver's wallet address and email");
        return;
      }
      if (!ethers.isAddress(receiver)) {
        toast.error("Please enter a valid Ethereum address");
        return;
      }
      if (!receiverEmail.includes('@')) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Add validation for step 3 (Project Timeline)
    if (currentStep === 3) {
      if (paymentType === "full") {
        // Check if amount is provided and valid
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          toast.error("Please enter a valid amount greater than 0");
          return;
        }

        // Check if duration is at least 24 hours
        const now = new Date();
        const selectedDateTime = new Date(selectedDate);
        const hoursDifference = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
          toast.error("Project duration must be at least 24 hours");
          return;
        }
      } else {
        // Milestone payment type validations
        if (!totalMilestoneAmount || isNaN(parseFloat(totalMilestoneAmount)) || parseFloat(totalMilestoneAmount) <= 0) {
          toast.error("Please enter a valid total project amount");
          return;
        }

        // Check if all milestones have valid amounts
        const invalidMilestone = milestones.find(m =>
          !m.amount ||
          isNaN(parseFloat(m.amount)) ||
          parseFloat(m.amount) <= 0
        );

        if (invalidMilestone) {
          toast.error("All milestones must have valid amounts");
          return;
        }

        // Check if milestone amounts sum up to total
        const total = milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0);
        if (total !== Number(totalMilestoneAmount)) {
          toast.error("Milestone amounts must sum up to the total amount");
          return;
        }

        // Check first milestone date
        const firstMilestone = milestones[0];
        if (!firstMilestone.date) {
          toast.error("First milestone completion date is required");
          return;
        }

        const now = new Date();
        const firstMilestoneDate = new Date(firstMilestone.date);
        const hoursDifference = (firstMilestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // if (hoursDifference < 24) {
        //   toast.error("First milestone must be at least 24 hours from now");
        //   return;
        // }
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClientSignature = (signatureData: string) => {
    setClientSignature(signatureData)
    // Update contract content with the new signature
    let updatedContent = contractContent
    const clientSignaturePlaceholder = '<div id="client-signature-canvas"></div>'
    const clientSignatureImg = `<img src="${signatureData}" alt="Client Signature" style="max-width: 100%; height: auto;" />`

    if (updatedContent.includes(clientSignaturePlaceholder)) {
      updatedContent = updatedContent.replace(clientSignaturePlaceholder, clientSignatureImg)
    } else {
      // If there's already a signature, replace it
      const existingSignature = updatedContent.match(/<img[^>]*alt="Client Signature"[^>]*>/)
      if (existingSignature) {
        updatedContent = updatedContent.replace(existingSignature[0], clientSignatureImg)
      }
    }

    setContractContent(updatedContent)
    setEditedContractContent(updatedContent)
    setUserSignature(true);
    toast.success(" signature saved")
  }

  const handleProviderSignature = (signatureData: string) => {
    setProviderSignature(signatureData)
    // Update contract content with the new signature
    let updatedContent = contractContent
    const providerSignaturePlaceholder = '<div id="provider-signature-canvas"></div>'
    const providerSignatureImg = `<img src="${signatureData}" alt="Provider Signature" style="max-width: 100%; height: auto;" />`

    if (updatedContent.includes(providerSignaturePlaceholder)) {
      updatedContent = updatedContent.replace(providerSignaturePlaceholder, providerSignatureImg)
    } else {
      // If there's already a signature, replace it
      const existingSignature = updatedContent.match(/<img[^>]*alt="Provider Signature"[^>]*>/)
      if (existingSignature) {
        updatedContent = updatedContent.replace(existingSignature[0], providerSignatureImg)
      }
    }

    setContractContent(updatedContent)
    setEditedContractContent(updatedContent)
    alert("Service provider signature saved")
  }

  // Add this new function to handle content updates
  const handleContractContentChange = (content: string) => {
    //console.log('yooo',)
    setEditedContractContent(content)
  }

  // Update the handleSaveChanges function
  const handleSaveChanges = () => {
    if (editedContractContent) {
      setContractContent(editedContractContent)
      setHasContractBeenSaved(true)
      setShowDownloadButton(true)
      setShowContractTerms(false)
    }
  }

  // Update the checkbox handler to respect saved content
  const handleContractTermsCheckbox = (checked: boolean) => {
    setShowContractTerms(checked)
    if (checked && !hasContractBeenSaved) {
      // Only load template if contract hasn't been saved before
      setContractContent(contractTemplates["service-agreement-classic"].content)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Get the most up-to-date content
      let currentContent = contractContent;
      const editableContentElement = document.querySelector('[contenteditable="true"]');

      if (isEditingContract && editableContentElement) {
        currentContent = editableContentElement.innerHTML;
        setEditedContractContent(currentContent);
        setContractContent(currentContent);
      }

      // Create a container for the PDF content
      const container = document.createElement('div');
      container.style.width = '8.5in';
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      // Insert the contract content
      container.innerHTML = currentContent;

      // Process editable fields to show their content
      const contentEditableElements = container.querySelectorAll('[contenteditable="true"]');
      contentEditableElements.forEach(field => {
        if (field instanceof HTMLElement) {
          field.removeAttribute('contenteditable');
          field.style.border = 'none';
          field.style.backgroundColor = 'transparent';
        }
      });

      // Process input fields
      const inputFields = container.querySelectorAll('input, textarea');
      inputFields.forEach(input => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          const valueDiv = document.createElement('div');
          valueDiv.textContent = input.value || input.placeholder;
          input.parentNode?.replaceChild(valueDiv, input);
        }
      });

      // Handle signatures
      if (clientSignature) {
        const clientPlaceholder = container.querySelector('#client-signature-canvas');
        if (clientPlaceholder instanceof HTMLElement) {
          const imgEl = document.createElement('img');
          imgEl.src = clientSignature;
          imgEl.alt = "Client Signature";
          imgEl.style.maxWidth = "100%";
          clientPlaceholder.parentNode?.replaceChild(imgEl, clientPlaceholder);
        }
      }

      if (providerSignature) {
        const providerPlaceholder = container.querySelector('#provider-signature-canvas');
        if (providerPlaceholder instanceof HTMLElement) {
          const imgEl = document.createElement('img');
          imgEl.src = providerSignature;
          imgEl.alt = "Provider Signature";
          imgEl.style.maxWidth = "100%";
          providerPlaceholder.parentNode?.replaceChild(imgEl, providerPlaceholder);
        }
      }

      // Short delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF using jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      // Calculate dimensions
      const imgWidth = 7.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF with proper margins
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0.5, // left margin
        0.5, // top margin
        imgWidth,
        imgHeight
      );

      // Handle multi-page content if needed
      let heightLeft = imgHeight - 10; // 10 inches per page (letter size minus margins)
      let position = 0;

      while (heightLeft > 0) {
        position += 10;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0.5,
          0.5 - position, // Shift content up
          imgWidth,
          imgHeight
        );
        heightLeft -= 10;
      }

      // Save the PDF
      pdf.save('contract.pdf');

      // Clean up
      document.body.removeChild(container);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paymentType" className="text-zinc-700 font-medium dark:text-zinc-100">
                Payment Type
              </Label>
              <Select value={paymentType} onValueChange={(value: "full" | "milestone") => setPaymentType(value)}>
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
        )
      case 2:
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
                onChange={handleReceiverChange}
                className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-[#BB7333] 
                  transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-[#BB7333]/50"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
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
        )
      case 3:
        return (
          <div className="space-y-6">
            {paymentType === "full" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime" className="text-zinc-700 font-medium dark:text-zinc-100">
                    Project Duration
                  </Label>
                  <DatePicker
                    id="datetime"
                    selected={selectedDate}
                    onChange={handleDateChange}
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
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    ⓘ Project duration must be at least 24 hours from now
                  </p>
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
            ) : (
              <div className="space-y-4">
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
                {milestoneError && (
                  <p className="text-red-500 text-sm">{milestoneError}</p>
                )}
                {milestones.map((milestone, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-zinc-700 font-medium dark:text-zinc-100">
                        Milestone {index + 1}
                      </Label>
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="h-8 w-8 text-[#BB7333] hover:bg-[#BB7333]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Amount (USDT)"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, "amount", e.target.value)}
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
                            onChange={(date) => date && updateMilestone(index, "date", date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="yyyy-MM-dd HH:mm"
                            minDate={now}
                            className="w-full cursor-pointer border p-1.5 rounded-md text-center"
                            required
                          />
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ⓘ Must be at least 24 hours from now
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 4:
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
        )
      case 5:
        return (
          <div className="space-y-6 w-full">
            <div className="space-y-4 w-full">
              {!contractContent && <div className="flex items-center space-x-2">
                <Checkbox
                  id="showContractTerms"
                  checked={showContractTerms}
                  onCheckedChange={handleContractTermsCheckbox}
                />
                <Label htmlFor="showContractTerms" className="text-zinc-700 font-medium dark:text-zinc-100">
                  Add  Contract Terms <span className=" text-zinc-500 dark:text-zinc-400">(optional)</span>
                </Label>
              </div>}

              {contractContent && (
                <div className="space-y-4 w-full">
                  <div className={`flex  justify-between items-center`}>
                    {!contractContent ? <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Add Contract Terms
                    </p> :
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Contract terms have been added. Click below to view to edit.
                      </p>
                    }
                    <Dialog open={showContractTerms} onOpenChange={setShowContractTerms}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          View Contract
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full lg:min-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Contract Terms</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div
                            contentEditable
                            className="prose max-w-none p-4 border rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-[#BB7333]"
                            dangerouslySetInnerHTML={{ __html: editedContractContent || contractContent }}
                            onBlur={(e) => handleContractContentChange(e.currentTarget.innerHTML)}
                          />
                          <div className="mt-8 space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium text-white">Your Signature</h3>
                              <SignaturePadComponent
                                onSave={handleClientSignature}
                                canvasId="client-signature-canvas"
                              />
                            </div>
                            {/* <div className="space-y-4">
                              <h3 className="text-lg font-medium text-white">Service Provider Signature</h3>
                              <SignaturePadComponent
                                onSave={handleProviderSignature}
                                canvasId="provider-signature-canvas"
                              />
                            </div> */}
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button
                              type="button"
                              onClick={handleSaveChanges}
                              className="flex items-center gap-2"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
            {showDownloadButton && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Details</h3>
              <div className="space-y-2">
                <p><strong>Payment Type:</strong> {paymentType === "full" ? "Full Amount" : "Milestone-based"}</p>
                <p><strong>Amount:</strong> {paymentType === "full" ? amount : totalMilestoneAmount} USDT</p>
                <p><strong>Receiver:</strong> {receiver}</p>
                <p><strong>{paymentType === "full" ? 'Project' : 'Milestone'} Duration:</strong> {paymentType === "full" ? selectedDate.toLocaleString() : (
                  <>
                    {milestones.length > 0 && (
                      <span className="ml-4 "> {new Date(milestones[0].date).toLocaleString()}</span>
                    )}
                  </>
                )} </p>
                <p><strong>Creation Fee:</strong> {profitAmount} USDT</p>
                {observer && <p><strong>Observer:</strong> {observer}</p>}
                {jurisdiction && <p><strong>Jurisdiction:</strong> {jurisdiction}</p>}
                {showContractTerms && <p><strong>Custom Contract Terms:</strong> Added</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="legalAgreement"
                checked={legalAgreement}
                onCheckedChange={(checked) => setLegalAgreement(checked as boolean)}
                required
              />
              <Label htmlFor="legalAgreement" className="text-sm text-zinc-700 dark:text-zinc-300">
                I agree to be legally bound by the terms of this escrow agreement
              </Label>
            </div>
          </div>
        )
      default:
        return null
    }
  }


  const handleEmailUpdate = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      toast.error("Please enter a valid email address")
      return
    }

    if (userEmail.length > 254) {
      toast.error("Email address cannot be longer than 254 characters")
      return
    }

    setIsUpdatingEmail(true)
    try {
      const response = await updateUserEmail(userEmail);

      if (response.status === 200) {
        console.log("response", response)
        toast.success(response?.data?.message)
        setShowEmailModal(false)
        setUser(response?.data?.user);
      }
    } catch (error) {
      console.error("Error updating email:", error)

      handleApiError(error)
    } finally {
      setIsUpdatingEmail(false)
    }
  }



  return (
    <div className="w-full max-w-2xl mx-auto ">
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal} >
        <DialogContent className="sm:max-w-[425px] bg-zinc-900/80 border-zinc-800 backdrop-blur-md ">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Email Registration Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-zinc-400">
              Please register your email address to continue creating an escrow.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-[#BB7333] 
                  transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleEmailUpdate}
                disabled={isUpdatingEmail || !userEmail}
                className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white hover:from-[#965C29] hover:to-[#7A4A21]"
              >
                {isUpdatingEmail ? "Updating..." : "Register Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 shadow-lg text-zinc-900 
        dark:border-zinc-800 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-100 dark:shadow-none">
        <CardHeader className="pb-6 text-center">
          {/* <CardTitle className="bg-gradient-to-r  from-zinc-900 to-zinc-700 bg-clip-text text-transparent
            dark:from-white dark:to-zinc-300 text-2xl">
            Create New Escrow
          </CardTitle> */}
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-base">
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>

        <div className="md:px-4 lg:px-8 py-4">
          <div className="flex items-center justify-center lg:justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full 
                  ${currentStep > index + 1 ? 'bg-[#BB7333] text-white' :
                    currentStep === index + 1 ? 'bg-[#BB7333] text-white' :
                      'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={` w-4 md:w-10 lg:w-14 h-1 mx-2 lg:mx-2 ${currentStep > index + 1 ? 'bg-[#BB7333]' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-8">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between px-8 py-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep === totalSteps ? (
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white shadow-md hover:shadow-lg 
                  hover:from-[#965C29] hover:to-[#7A4A21] transition-all duration-300 px-6
                  dark:bg-[#BB7333] dark:from-[#BB7333] dark:to-[#965C29] dark:text-white dark:hover:bg-[#965C29] 
                  dark:hover:from-[#965C29] dark:hover:to-[#7A4A21] dark:shadow-none dark:hover:shadow-none"
                disabled={isSubmitting || !legalAgreement}
              >
                {isSubmitting ? "Creating..." : "Create Escrow"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextStep();
                }}
                className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white shadow-md hover:shadow-lg 
                  hover:from-[#965C29] hover:to-[#7A4A21] transition-all duration-300 px-6
                  dark:bg-[#BB7333] dark:from-[#BB7333] dark:to-[#965C29] dark:text-white dark:hover:bg-[#965C29] 
                  dark:hover:from-[#965C29] dark:hover:to-[#7A4A21] dark:shadow-none dark:hover:shadow-none"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

