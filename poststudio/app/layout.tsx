import type { Metadata } from "next"
import { Inter, Space_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import TopNav from "@/components/TopNav"
import { SessionProvider } from "next-auth/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PostStudio — AI Social Media Creator",
  description: "AI-powered social posts, on-brand every time.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#2E2E2E" }}>
      <body
        className={`${inter.variable} ${spaceMono.variable} font-[family-name:var(--font-inter)] antialiased`}
      >
        <SessionProvider>
          <TopNav />
          <div className="pt-14">{children}</div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
