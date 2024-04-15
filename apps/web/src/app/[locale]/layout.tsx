import "./globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import {ReactNode} from "react";
import {LocaleContext} from "@/context/LocaleContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const languages = ['en', 'zh']

export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}

export default function RootLayout({ children, params }: {children: ReactNode, params: {
  lng: string
}}) {
  return (
    <html lang={params.lng} suppressHydrationWarning>
    <head>
      <link rel="icon" href="/apps/web/src/app/[locale]/icon.png" sizes="any" />
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
