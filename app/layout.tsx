import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NoteCraft — Faculty PDFs, ready in minutes',
  description: 'Turn messy faculty PDFs into upload-ready notes with one focused workspace.',
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
