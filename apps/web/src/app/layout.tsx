import "./globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import {ReactNode} from "react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({ children }: {children: ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/icon.png" sizes="any" />
      <title>域名比价</title>
    </head>
    <body
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
    {children}
    </body>
    </html>
  )
}
