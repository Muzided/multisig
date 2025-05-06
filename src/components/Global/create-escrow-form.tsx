"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useWeb3 } from "@/context/Web3Context"
import { useFactory } from "@/Hooks/useFactory"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ethers } from "ethers"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

export function CreateEscrowForm() {
  const [amount, setAmount] = useState("")
  const [signees, setSignees] = useState<string[]>([""])
  const [receiver, setReceiver] = useState("")
  const [receiverEmail, setReceiverEmail] = useState("")
  const [error, setError] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const now = new Date(); // Define 'now' as the current date and time
  const [selectedDate, setSelectedDate] = useState<Date>(now); // Default to now
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
  //web 3 context
  const { signer, account } = useWeb3()
  // multi-sig factory contract hook
  const { fetchTotalEscrows, createEscrow } = useFactory()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

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
      title: "Review & Create",
      description: "Review details and create escrow"
    }
  ]

  useEffect(() => {
    if (!signer) return
    fetchTotalEscrows()

  }, [signer])
  // This would fetch the user's wallet address from the wallet provider)

  const addSignee = () => {
    setSignees([...signees, ""])
  }

  const removeSignee = (index: number) => {
    const newSignees = [...signees]
    newSignees.splice(index, 1)
    setSignees(newSignees)
  }

  const updateSignee = (index: number, value: string) => {
    const newSignees = [...signees]
    newSignees[index] = value
    setSignees(newSignees)
  }

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setUnixTimestamp(Math.floor(date.getTime() / 1000)); // Convert to Unix timestamp in seconds
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
      const userAddress = account
      // Calculate total amount based on payment type
      const totalAmount = paymentType === "full" 
        ? amount 
        : totalMilestoneAmount

      const res = await createEscrow(
        userAddress,
        receiver,
        totalAmount,
        unixTimestamp,
        setIsSubmitting
      )

      // Reset form
      setAmount("")
      setReceiver("")
      setMilestones([{ amount: "", date: now, description: "" }])
      setTotalMilestoneAmount("")
      setPaymentType("full")
      setObserver("")
      setJurisdiction("")
      setLegalAgreement(false)
      setMilestoneError("")

    } catch (error) {
      console.error("Error creating escrow:", error)
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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

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

            {paymentType === "full" ? (
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
            ) : (
              <div className="space-y-4">
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
                       <Label className="text-sm text-zinc-500 mb-1 block">
                          Milestone Completion Date
                        </Label>
                      <DatePicker
                        selected={milestone.date}
                        onChange={(date) => date && updateMilestone(index, "date", date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        minDate={now}
                        className="w-full"
                        required
                      />
                      <Textarea
                        placeholder="Milestone description"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            </div>
            {paymentType === "milestone" && (
              <div className="space-y-4">
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
                       <Label className="text-sm text-zinc-500 mb-1 block">
                          Milestone Completion Date
                        </Label>
                      <DatePicker
                        selected={milestone.date}
                        onChange={(date) => date && updateMilestone(index, "date", date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        minDate={now}
                        className="w-full"
                        required
                      />
                      <Textarea
                        placeholder="Milestone description"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        className="w-full"
                        required
                      />
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
                  <SelectItem value="UAE">United Arab Emirates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Details</h3>
              <div className="space-y-2">
                <p><strong>Payment Type:</strong> {paymentType === "full" ? "Full Amount" : "Milestone-based"}</p>
                <p><strong>Amount:</strong> {paymentType === "full" ? amount : totalMilestoneAmount} USDT</p>
                <p><strong>Receiver:</strong> {receiver}</p>
                <p><strong>Project Duration:</strong> {selectedDate.toLocaleString()}</p>
                {observer && <p><strong>Observer:</strong> {observer}</p>}
                {jurisdiction && <p><strong>Jurisdiction:</strong> {jurisdiction}</p>}
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
                  <div className={` w-4 md:w-12 lg:w-16 h-1 mx-2 lg:mx-4 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
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
                onClick={nextStep}
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

