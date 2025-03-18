
import { ThemeProvider } from '@/components/Global/theme-provider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
         
            {children}
        
        </ThemeProvider>
      </body>
    </html>
  )
}