"use client"
import { ThemeProvider } from '@/components/Global/theme-provider'

import { Poppins } from "next/font/google";
import './globals.css'
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
        <ThemeProvider attribute="class"  defaultTheme="dark" >
         
            {children}
        
        </ThemeProvider>
      </body>
    </html>
  )
}