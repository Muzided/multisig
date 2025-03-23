"use client"
import { ThemeProvider } from '@/components/Global/theme-provider'

import { Poppins } from "next/font/google";
import './globals.css'
import { AppKit } from '@/context/appkit';
import { Web3Provider } from '@/context/Web3Context';
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add desired weights
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${poppins.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" >
          <AppKit>
           
              <Web3Provider>
                {children}
              </Web3Provider>
          </AppKit>
        </ThemeProvider>
      </body>
    </html>
  )
}