"use client"
import { ThemeProvider } from '@/components/Global/theme-provider'
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Poppins } from "next/font/google";
import './globals.css'
import { AppKit } from '@/context/appkit';
import { Web3Provider } from '@/context/Web3Context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProvider } from '@/context/userContext';
import { EscrowProvider } from "@/context/EscrowContext";
import { TabProvider } from '@/context/TabContext';

const queryClient = new QueryClient()

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add desired weights
});
const customToastStyle = {
  backgroundColor: '#161A25',
  color: '#fff', // Black text color
  backdropFilter: 'blur(4px)', // Blur for frosted glass effect
  border: '1px solid rgba(255, 255, 255, 0.2)', // Optional: subtle white border
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Optional: shadow for depth
}

const metadata = {
  title: 'MultiSig',
  manifest: '/manifest.webmanifest',
  themeColor: '#000000',
};
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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          transition={Slide}
          theme="dark"
          toastStyle={customToastStyle}
        />
        <TabProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" >
            <QueryClientProvider client={queryClient}>
              <AppKit>
                <Web3Provider>
                  <UserProvider>
                    <EscrowProvider>
                      {children}
                    </EscrowProvider>
                  </UserProvider>
                </Web3Provider>
              </AppKit>
            </QueryClientProvider>
          </ThemeProvider>
        </TabProvider>
      </body>
    </html>
  )
}