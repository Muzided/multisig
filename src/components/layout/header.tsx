"use client"

import { Bell, ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react"
import Link from "next/link"
import Lottie from "lottie-react"
import logo from "../../../public/logo.png"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import animationData from "../../../public/animations/secure.json"
import { ThemeToggle } from "../Global/theme-toggle"

interface HeaderProps {
  toggleMobileNav: () => void
}

export function Header({ toggleMobileNav }: HeaderProps) {

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 
      bg-gradient-to-b from-white to-zinc-50 px-4 md:px-6 shadow-sm backdrop-blur-sm
      dark:border-zinc-800 dark:bg-zinc-950 dark:from-zinc-950 dark:to-zinc-950"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-zinc-500 hover:bg-white hover:shadow-sm hover:text-zinc-900 
            transition-all duration-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white 
            dark:hover:shadow-none"
          onClick={toggleMobileNav}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
          {/* <div className="flex items-center p-1 bg-white rounded-full shadow-sm dark:bg-transparent dark:shadow-none">
            <Lottie animationData={animationData} className="w-10 h-10" />
          </div> */}
         <div className="w-10 h-10 relative">
                    <div className="absolute inset-0 bg-blue-200/30 dark:bg-blue-600/20 rounded-full blur-md"></div>
                    <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/50 dark:shadow-blue-600/20">
                    <Image src={logo} alt="Logo" width={32} height={32} className="w-8 h-8" />
                    </div>
                  </div>
          <span
            className="hidden sm:inline bg-gradient-to-r from-zinc-800 to-zinc-600 bg-clip-text text-transparent 
            dark:from-white dark:to-zinc-300"
          >
            MultiSig Escrow
          </span>
        </Link>

        
      </div>

      <div className="flex items-center gap-2">
       <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:bg-white hover:shadow-sm hover:text-zinc-900 
            transition-all duration-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white 
            dark:hover:shadow-none"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-zinc-500 hover:bg-white hover:shadow-sm hover:text-zinc-900 
                transition-all duration-200 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white 
                dark:hover:shadow-none"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"></div>
              <span className="hidden sm:inline text-zinc-700 dark:text-zinc-300">0x1a2...3b4c</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-zinc-200/80 bg-white/95 backdrop-blur-sm text-zinc-900 shadow-lg 
              dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <DropdownMenuLabel className="font-medium">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
            <DropdownMenuItem
              className="hover:bg-zinc-50 hover:shadow-sm transition-all duration-200 
              dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer dark:hover:shadow-none"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

