import React from 'react'
import { ConnectWalletButton } from '../web3/connect-button'

const ConnectPage = () => {

   
    return (
        <div className='flex pt-14 items-start md:items-center  justify-center flex-col  gap-6'>
            <div className='font-bold text-3xl md:text-4xl '>🔐 Connect Your Wallet</div>
            <h2 className='font-medium'>" Unlock your escrow dashboard "</h2>

            <ul className='flex flex-col items-start md:items-center text-sm md:text-base gap-1 mb-6 text-zinc-600 dark:text-zinc-400'>
                <li>To create and manage secure escrows, connect your wallet and get started.</li>
                <li>🖊️ <strong>After connecting, you'll be asked to sign a message to verify ownership</strong></li>
                <li>🔒 Secure and transparent escrow creation</li>
                <li>📜 Track ongoing and completed escrows</li>
                <li>🚀 Initiate deals with confidence—no middlemen</li>
                <li>🛡️ Your funds stay safe in smart contracts until both parties agree</li>
            </ul>

            <div className='max-w-md w-full'>
                <ConnectWalletButton />
            </div>
        </div>
    )
}

export default ConnectPage
