"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // No direct document/window access here
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

