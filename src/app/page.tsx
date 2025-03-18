"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, Shield, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import animationData from "../../public/animations/secure.json";
import Lottie from "lottie-react";

export default function Home() {
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)

  const handleConnect = (provider: string) => {
    setConnecting(true)

    // Simulate connection process
    setTimeout(() => {
      setConnecting(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className=" flex md:flex-row flex-col min-h-screen items-center gap-4 md:px-20 bg-black p-4">

      <div className=" text-start pr-2">
        <h1 className="text-4xl sm:text-5xl max-w-2xl font-semibold mb-6">
          <span className="text-blue-600">   Multi-Signature </span> Escrow Wallet for Secure Transactions
        </h1>
        <p className="text-lg text-zinc-400 font-thin sm:text-xl mb-3">
          Effortlessly create, manage, and finalize escrow transactions with multi-signature security.
        </p>
        <p className="text-base text-zinc-400 font-thin  sm:text-lg  mb-4">
          escrow system ensures secure fund releases, auto-reversals on expiry, and decentralized approvals—giving you complete financial control.
        </p>
        <ul className="text-left text-zinc-400 font-thin  list-disc list-inside mb-8 space-y-2">
          <li>✅ Create & manage escrows seamlessly</li>
          <li>✅ Multi-party approval for secure transactions</li>
          <li>✅ Automatic fund release or return if unsigned</li>
        </ul>
        {/* <button
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-200 transition"
          onClick={() => console.log('Connect Wallet or Navigate to Dashboard')}
        >
          Get Started
        </button> */}
      </div>


      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">

        <CardHeader className="space-y-1">
          <CardTitle className="text-4xl text-center upper font-bold bg-gradient-to-l from-[#123691] to-white bg-clip-text text-transparent">MULTISIG ESCROW</CardTitle>
          <div className="flex flex-col items-center">
            <Lottie animationData={animationData} className="w-38 h-38" />
          </div>
          <div className="flex flex-row items-center justify-center ">
            <CardDescription className="text-zinc-400 text-center">
              Multi-Signature Escrow System for Secure Transactions
            </CardDescription>

          </div>

        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-blue-500" />
              <span>Multi-Signature</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span>Trustless</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Connect Wallet</Button>
            </DialogTrigger>

            <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect your wallet</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Connect with one of our available wallet providers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-between border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => handleConnect("metamask")}
                  disabled={connecting}
                >
                  <div className="flex items-center gap-2">
                    <img src="/placeholder.svg?height=24&width=24" alt="MetaMask" className="h-6 w-6" />
                    <span>MetaMask</span>
                  </div>
                  {connecting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xs text-zinc-500">Popular</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-between border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => handleConnect("walletconnect")}
                  disabled={connecting}
                >
                  <div className="flex items-center gap-2">
                    <img src="/placeholder.svg?height=24&width=24" alt="WalletConnect" className="h-6 w-6" />
                    <span>WalletConnect</span>
                  </div>
                  {connecting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xs text-zinc-500">Universal</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-between border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => handleConnect("coinbase")}
                  disabled={connecting}
                >
                  <div className="flex items-center gap-2">
                    <img src="/placeholder.svg?height=24&width=24" alt="Coinbase Wallet" className="h-6 w-6" />
                    <span>Coinbase Wallet</span>
                  </div>
                  {connecting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xs text-zinc-500">Mobile</span>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-zinc-800 pt-4">
          <p className="text-center text-xs text-zinc-500">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

