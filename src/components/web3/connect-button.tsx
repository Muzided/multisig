"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
export function ConnectWalletButton() {
    const { address, isConnected } = useAppKitAccount();
    const { open, close } = useAppKit()

    const openAppkit = () => {
        open()
    }


    return (
        <Button
            onClick={openAppkit}
            className="w-full bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white shadow-md 
hover:shadow-lg hover:from-[#965C29] hover:to-[#7A4A21] transition-all duration-300
dark:bg-[#BB7333] dark:from-[#BB7333] dark:to-[#965C29] dark:text-white dark:hover:bg-[#965C29] 
dark:hover:from-[#965C29] dark:hover:to-[#7A4A21] dark:shadow-none dark:hover:shadow-none"
        >
            {isConnected ? `${address?.slice(0, 8)}...${address?.slice(-7)}` : 'Connect Wallet'}
        </Button>
    )

}
