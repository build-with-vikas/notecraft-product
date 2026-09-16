import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NoteCraft — Make every page land better',
  description: 'Merge, split, convert, and prepare documents privately in your browser.',
  generator: 'NoteCraft',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfaf8',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
