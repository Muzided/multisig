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
import { handleError } from "../../../utils/errorHandler"
import { toast } from "react-toastify"
import { createEscrowResponse } from "@/types/escrow"

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
  //web 3 context
  const { signer, account } = useWeb3()
  // multi-sig factory contract hook
  const { fetchTotalEscrows,fetchCreatedEsrowAddress, createEscrow, createMilestoneEscrow } = useFactory()
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
    if (!signer) return
    fetchTotalEscrows()

  }, [signer])
  // This would fetch the user's wallet address from the wallet provider)



  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Check if the selected date is at least 24 hours from now
      const now = new Date();
      const hoursDifference = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursDifference < 24) {
        toast.error("Project duration must be at least 24 hours");
        return;
      }

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
    setMilestones([...milestones, { amount: "", date: now, description: "" }])
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

    // Validate milestone dates
    if (field === "date" && value instanceof Date) {
      const currentMilestoneDate = new Date(value);
      
      // Check if date is at least 24 hours from now for first milestone
      if (index === 0) {
        const now = new Date();
        const hoursDifference = (currentMilestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursDifference < 24) {
          setMilestoneError("First milestone must be at least 24 hours from now");
          return;
        }
      } else {
        // For subsequent milestones, check if they're at least 24 hours after previous milestone
        const prevMilestoneDate = new Date(newMilestones[index - 1].date);
        const hoursDifference = (currentMilestoneDate.getTime() - prevMilestoneDate.getTime()) / (1000 * 60 * 60);
        if (hoursDifference < 24) {
          setMilestoneError(`Milestone ${index + 1} must be at least 24 hours after Milestone ${index}`);
          return;
        }
      }
      setMilestoneError("");
    }
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
      // Validate receiver information
      if (!receiver || !receiverEmail) {
        toast.error("Receiver's wallet address and email are required");
        setIsSubmitting(false);
        return;
      }

      if (!ethers.isAddress(receiver)) {
        toast.error("Please enter a valid Ethereum address");
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
      const milestoneTimestamps = milestones.map(milestone => dateToUnix(milestone.date))
      console.log("milestoneAmounts", milestoneAmounts, milestoneTimestamps)

      let escrowCreationResponse: createEscrowResponse;
      if (paymentType === "full") {
        const amounts = [amount];
        const timestamps = [unixTimestamp];
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
          ...(paymentType === "milestone" && {
            milestones: milestones.map(milestone => ({
              amount: parseFloat(milestone.amount),
              due_date: dateToUnix(milestone.date),
              description: milestone.description
            }))
          })
        }
        console.log("escrowCreationData", escrowCreationData);
        const response = await saveEscrow(escrowCreationData)
        console.log("response", response)
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
        }
      }

    } catch (error) {
      console.error("Error creating escrow:", error)
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

        // Check milestone dates
        const now = new Date();
        for (let i = 0; i < milestones.length; i++) {
          const milestoneDate = new Date(milestones[i].date);
          
          if (i === 0) {
            // First milestone must be at least 24 hours from now
            const hoursDifference = (milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursDifference < 24) {
              toast.error("First milestone must be at least 24 hours from now");
              return;
            }
          } else {
            // Subsequent milestones must be at least 24 hours after previous milestone
            const prevMilestoneDate = new Date(milestones[i - 1].date);
            const hoursDifference = (milestoneDate.getTime() - prevMilestoneDate.getTime()) / (1000 * 60 * 60);
            if (hoursDifference < 24) {
              toast.error(`Milestone ${i + 1} must be at least 24 hours after Milestone ${i}`);
              return;
            }
          }
        }
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
      setContractContent(contractTemplates["service-agreement"].content)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // First, ensure we're using the most up-to-date content
      // If we're in edit mode, get content directly from the contentEditable div
      let currentContent = contractContent;
      const editableContentElement = document.querySelector('[contenteditable="true"]');

      if (isEditingContract && editableContentElement) {
        // Capture the current content from the contentEditable element
        currentContent = editableContentElement.innerHTML;

        // Save this content to our state as well
        setEditedContractContent(currentContent);
        setContractContent(currentContent);
      }

      // Create a container and append it to the document temporarily
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: -9999px;
        width: 8.5in;
        padding: 1rem;
        background-color: #ffffff;
        color: #000000;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        z-index: -1;
      `;
      document.body.appendChild(container);

      // Create a clean copy of the current contract content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentContent;

      // Process editable fields to show their content instead of placeholders
      const editableFields = tempDiv.querySelectorAll('[contenteditable="true"]');
      editableFields.forEach(field => {
        if (field instanceof HTMLElement) {
          // Replace the editable field with a div containing its content
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = field.innerHTML;
          contentDiv.style.cssText = field.style.cssText;
          field.parentNode?.replaceChild(contentDiv, field);
        }
      });

      // Process input fields to show their values
      const inputFields = tempDiv.querySelectorAll('input, textarea');
      inputFields.forEach(input => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          const valueDiv = document.createElement('div');
          valueDiv.textContent = input.value || input.placeholder;
          valueDiv.style.cssText = `
            padding: 2px;
            margin: 2px 0;
          `;
          input.parentNode?.replaceChild(valueDiv, input);
        }
      });

      // Add custom CSS to remove borders and styles from any remaining editable elements
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        input, textarea, [contenteditable="true"] {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          -webkit-appearance: none !important;
          background-color: transparent !important;
        }
        body, div, p, span, h1, h2, h3, h4, h5, h6 {
          color: #000000 !important;
          background-color: transparent !important;
        }
      `;
      tempDiv.prepend(styleTag);

      // Apply proper styling to ensure visibility in PDF
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.color = '#000000';

      // Force all elements to have appropriate colors and remove borders from editable fields
      const elements = tempDiv.querySelectorAll('*');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.backgroundColor = 'transparent';
          el.style.color = '#000000';

          // Remove borders from input fields, textareas, and contenteditable elements
          if (
            el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.getAttribute('contenteditable') === 'true'
          ) {
            el.style.border = 'none';
            el.style.outline = 'none';
            el.style.boxShadow = 'none';
          }
        }
      });

      container.appendChild(tempDiv);

      // Wait for any images to load
      const images = container.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve(null);
          } else {
            img.onload = () => resolve(null);
            img.onerror = reject;
          }
        });
      }));

      // Handle signatures if they exist
      if (clientSignature || providerSignature) {
        // Find signature placeholders and replace them
        if (clientSignature) {
          const clientPlaceholder = container.querySelector('#client-signature-canvas');
          if (clientPlaceholder) {
            const imgEl = document.createElement('img');
            imgEl.src = clientSignature;
            imgEl.alt = "Client Signature";
            imgEl.style.maxWidth = "100%";
            imgEl.style.height = "auto";
            clientPlaceholder.parentNode?.replaceChild(imgEl, clientPlaceholder);
          }
        }

        if (providerSignature) {
          const providerPlaceholder = container.querySelector('#provider-signature-canvas');
          if (providerPlaceholder) {
            const imgEl = document.createElement('img');
            imgEl.src = providerSignature;
            imgEl.alt = "Provider Signature";
            imgEl.style.maxWidth = "100%";
            imgEl.style.height = "auto";
            providerPlaceholder.parentNode?.replaceChild(imgEl, providerPlaceholder);
          }
        }
      }

      // Give the browser a moment to render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate canvas using html2canvas-pro
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true,
        windowWidth: 8.5 * 96,
        windowHeight: 11 * 96,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            // Force white background on the container
            clonedContainer.style.backgroundColor = '#ffffff';

            // Process all elements in the clone
            const clonedElements = clonedContainer.querySelectorAll('*');
            clonedElements.forEach(el => {
              if (el instanceof HTMLElement && el.style) {
                // Ensure text is black and backgrounds are transparent or white
                el.style.color = '#000000';
                if (el.style.backgroundColor &&
                  el.style.backgroundColor !== '#ffffff' &&
                  el.style.backgroundColor !== 'white' &&
                  el.style.backgroundColor !== 'transparent') {
                  el.style.backgroundColor = 'transparent';
                }

                // Remove borders from any remaining editable elements
                if (
                  el.tagName === 'INPUT' ||
                  el.tagName === 'TEXTAREA' ||
                  el.getAttribute('contenteditable') === 'true'
                ) {
                  el.style.border = 'none';
                  el.style.outline = 'none';
                  el.style.boxShadow = 'none';
                }
              }
            });
          }
        }
      });

      // Create PDF using jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      // Calculate dimensions to fit the page
      const pageWidth = 7.5;
      const pageHeight = 10;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Split into multiple pages if needed
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0.5,
        0.5,
        imgWidth,
        imgHeight
      );

      // Add additional pages if content overflows
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position += pageHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0.5,
          0.5 - position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('contract.pdf');

      // Clean up
      document.body.removeChild(container);

    } catch (error) {
      console.error('Error in PDF generation:', error);
      alert('Error generating PDF. Please try again.');
    }
  }
 // console.log("contractContent", contractContent)
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
                className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                  transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input
                type="email"
                placeholder="Receiver's email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="mt-2"
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
                    className="border-zinc-200 p-1.5 text-center rounded-b-md cursor-pointer dark:hover:bg-zinc-600 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                  transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
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
                    className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                    transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                    dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Milestone Guidelines</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Each milestone must be at least 24 hours apart</li>
                    <li>• Milestones must be in chronological order</li>
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
                    className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                      transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                      dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
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
                    className="h-8"
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
                          className="h-8 w-8"
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
                        className="w-full"
                        required
                      />
                      <div className="space-y-1">
                        <Label className="text-sm text-zinc-500 mb-1 block">
                          Select Milestone Completion Date
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
                          ⓘ Must be at least 24 hours from now and after previous milestone
                        </p>
                      </div>
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
                className="border-zinc-200 bg-white shadow-sm text-zinc-900 focus-visible:ring-blue-500 
                  transition-all duration-200 hover:border-zinc-300 focus:shadow-md
                  dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-none dark:hover:border-zinc-600"
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
                            className="prose max-w-none p-4 border rounded-lg min-h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p><strong>Project Duration:</strong>{paymentType === "full" ? selectedDate.toLocaleString() : totalProjectDate.toLocaleString()} </p>
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
  console.log("milestones-detials", milestones)

  return (
    <div className="w-full max-w-2xl mx-auto">
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
                  ${currentStep > index + 1 ? 'bg-blue-600 text-white' :
                    currentStep === index + 1 ? 'bg-blue-600 text-white' :
                      'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={` w-4 md:w-10 lg:w-14 h-1 mx-2 lg:mx-2 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
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
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg 
                  hover:from-blue-500 hover:to-blue-400 transition-all duration-300 px-6
                  dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
                  dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
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
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg 
                  hover:from-blue-500 hover:to-blue-400 transition-all duration-300 px-6
                  dark:bg-blue-600 dark:from-blue-600 dark:to-blue-600 dark:text-white dark:hover:bg-blue-700 
                  dark:hover:from-blue-700 dark:hover:to-blue-700 dark:shadow-none dark:hover:shadow-none"
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

