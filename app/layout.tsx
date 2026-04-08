// @ts-ignore
import './globals.css'

export const metadata = {
  title: 'The Wedding Elephant',
  description: 'Plan your day, one bite at a time.',
  manifest: '/manifest.json', // This makes it a PWA
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* This ensures the mobile address bar matches your pink theme */}
        <meta name="theme-color" content="#fff1f2" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}