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
            className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 
              text-white font-semibold py-6 rounded-xl 
              shadow-md hover:shadow-lg shadow-blue-300/30 hover:shadow-blue-300/40
              dark:shadow-lg dark:hover:shadow-lg dark:shadow-blue-900/30 dark:hover:shadow-blue-700/40 
              transition-all duration-300"
        >
            {isConnected ?`${address?.slice(0, 8)}...${address?.slice(-7)}` : 'Connect Wallet'}
        </Button>
    )

}