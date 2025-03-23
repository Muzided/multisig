"use client"
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LockKeyhole, Shield, Wallet } from "lucide-react"
const Lottie = dynamic(() => import('react-lottie'), { ssr: false });
import logo from "../../public/logo.png"
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

// Import animation data
import animationData from "../../public/animations/secure.json"
import { ThemeToggle } from "@/components/Global/theme-toggle"
import { ConnectWalletButton } from '@/components/web3/connect-button';
import { useAppKitAccount } from '@reown/appkit/react';

export default function Home() {
  //next-router
  const router = useRouter()

  //rewon-appkit
  const { address, isConnected } = useAppKitAccount();


const navgateToDashboard=()=>{
  router.push('/dashboard')
}


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-black dark:to-black overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-600/5 dark:bg-blue-600/5 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4"></div>

      {/* Header with Logo and Theme Toggle */}
      <header className="relative z-20 w-full px-6 md:px-20 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <div className="absolute inset-0 bg-blue-200/30 dark:bg-blue-600/20 rounded-full blur-md"></div>
            <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50 dark:shadow-blue-600/20">
              <Image src={logo || "/placeholder.svg"} alt="Logo" width={32} height={32} className="w-8 h-8" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-500 dark:to-blue-300 bg-clip-text text-transparent">
            MultiSig Escrow
          </span>
        </div>
        <div className='flex gap-12'>
          {address &&
            <Button
            onClick={navgateToDashboard}
              variant="ghost"
              className="text-zinc-500 hover:bg-white hover:shadow-sm hover:text-zinc-900 
        transition-all duration-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white 
        dark:hover:shadow-none"

              aria-label="Toggle theme"
            >
              Dashboard
              <span className="sr-only">Toggle theme</span>
            </Button>
          }
          <ThemeToggle />
        </div>
      </header>

      <div className="relative z-10 flex md:flex-row flex-col md:min-h-[calc(100vh-80px)] gap-8 md:gap-20 items-center md:px-20 p-6">
        <div className="text-start pr-2 w-full">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-600 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
              Multi-Signature
            </span>{" "}
            <span className="text-zinc-900 dark:text-white">Escrow Wallet for Secure Transactions</span>
          </h1>

          <p className="text-lg text-zinc-700 dark:text-zinc-300 sm:text-xl mb-4 drop-shadow-sm">
            Effortlessly create, manage, and finalize escrow transactions with multi-signature security.
          </p>

          <p className="text-base text-zinc-600 dark:text-zinc-400 sm:text-lg mb-6">
            Our escrow system ensures secure fund releases, auto-reversals on expiry, and decentralized approvals—giving
            you complete financial control.
          </p>

          <div
            className="bg-white dark:bg-zinc-900/50 backdrop-blur-sm p-5 rounded-xl 
              border border-zinc-200/80 dark:border-zinc-800/50 
              shadow-lg hover:shadow-xl dark:shadow-xl dark:hover:shadow-2xl
              shadow-zinc-200/50 hover:shadow-zinc-200/70 
              dark:shadow-blue-900/10 dark:hover:shadow-blue-900/20 
              mb-8 transform transition-all duration-300 hover:-translate-y-1"
          >
            <ul className="text-left list-none space-y-3">
              <li className="flex items-center text-zinc-700 dark:text-zinc-300">
                <div
                  className="mr-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-1 
                  shadow-md shadow-blue-200/50 dark:shadow-lg dark:shadow-blue-600/20"
                >
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span>Create & manage escrows seamlessly</span>
              </li>
              <li className="flex items-center text-zinc-700 dark:text-zinc-300">
                <div
                  className="mr-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-1 
                  shadow-md shadow-blue-200/50 dark:shadow-lg dark:shadow-blue-600/20"
                >
                  <LockKeyhole className="h-4 w-4 text-white" />
                </div>
                <span>Multi-party approval for secure transactions</span>
              </li>
              <li className="flex items-center text-zinc-700 dark:text-zinc-300">
                <div
                  className="mr-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full p-1 
                  shadow-md shadow-blue-200/50 dark:shadow-lg dark:shadow-blue-600/20"
                >
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <span>Automatic fund release or return if unsigned</span>
              </li>
            </ul>
          </div>

          {/* Fixed the commented-out button to use Dialog's API instead of direct DOM manipulation */}
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button
                className="group bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 
                  text-white font-semibold px-8 py-6 rounded-xl 
                  shadow-lg hover:shadow-xl shadow-blue-300/30 hover:shadow-blue-300/40
                  dark:shadow-xl dark:hover:shadow-2xl dark:shadow-blue-900/30 dark:hover:shadow-blue-700/40 
                  transition-all duration-300"
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
          </Dialog> */}
        </div>

        <div className="md:w-1/2 w-full max-w-md">
          <Card
            className="w-full border-zinc-200/80 dark:border-zinc-800/50 
              bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm 
              text-zinc-900 dark:text-zinc-100 
              shadow-xl hover:shadow-2xl shadow-zinc-200/70 hover:shadow-zinc-200/80
              dark:shadow-2xl dark:hover:shadow-2xl dark:shadow-blue-900/10 dark:hover:shadow-blue-800/20 
              overflow-hidden rounded-2xl transform transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-transparent dark:from-blue-600/5 dark:to-transparent"></div>

            <CardHeader className="relative space-y-1 pb-0">
              <CardTitle
                className="text-4xl text-center font-extrabold bg-gradient-to-r 
                  from-blue-700 to-blue-500 dark:from-blue-600 dark:to-white 
                  bg-clip-text text-transparent drop-shadow-sm"
              >
                MULTISIG ESCROW
              </CardTitle>

              <div className="flex flex-col items-center mt-2">
                <div className="w-40 h-40 relative">
                  <div className="absolute inset-0 bg-blue-200/30 dark:bg-blue-600/10 rounded-full blur-xl"></div>

                  <div className="w-full h-full relative z-10">
                    <Lottie options={{ animationData }} />
                  </div>

                </div>
              </div>


              <div className="flex flex-row items-center justify-center">
                <CardDescription className="text-zinc-600 dark:text-zinc-300 text-center text-sm">
                  Multi-Signature Escrow System for Secure Transactions
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6 pt-4">
              <div
                className="flex items-center justify-between rounded-xl 
                  border border-zinc-200/80 dark:border-zinc-800/80 
                  bg-zinc-50/80 dark:bg-zinc-950/80 p-2 md:p-4 text-sm 
                  shadow-inner dark:shadow-inner"
              >
                <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                  <div className="bg-blue-100/80 dark:bg-blue-600/20 p-2 rounded-full shadow-sm dark:shadow-none">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-zinc-700 md:text-base text-xs dark:text-zinc-300">Secure</span>
                </div>

                <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                  <div className="bg-blue-100/80 dark:bg-blue-600/20 p-2 rounded-full shadow-sm dark:shadow-none">
                    <LockKeyhole className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-zinc-700 md:text-base text-xs dark:text-zinc-300">Multi-Sig</span>
                </div>

                <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                  <div className="bg-blue-100/80 dark:bg-blue-600/20 p-2 rounded-full shadow-sm dark:shadow-none">
                    <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-zinc-700 md:text-base text-xs dark:text-zinc-300">Trustless</span>
                </div>
              </div>

              <ConnectWalletButton />



            </CardContent>

            <CardFooter className="flex flex-col space-y-2 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4">
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

