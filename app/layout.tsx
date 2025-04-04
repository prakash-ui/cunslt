import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
// In your application startup
import { testRedisConnection } from '@/utils/redis-cache'

testRedisConnection().then(connected => {
  console.log('Redis connection:', connected ? '✅ Connected' : '❌ Disconnected')
})

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}