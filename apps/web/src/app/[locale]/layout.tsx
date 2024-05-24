import "../globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import {ReactNode} from "react";
import { useTranslation } from "@/app/i18n";
import { headers } from "next/headers";
export const runtime = 'edge';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const languages = ['en', 'zh']

export async function generateStaticParams() {
  return languages.map((locale) => ({ locale }))
}

export default async function RootLayout({ children }: {children: ReactNode}) {
  const header = headers()
  const language = header.get('next-url')?.slice(1)
  const {t} = await useTranslation(language)
  return (
    <html lang={language} suppressHydrationWarning>
    <head>
      <link rel="icon" href="/apps/web/src/app/icon.png" sizes="any" />
      <title>{t('metadata.title')}</title>
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
