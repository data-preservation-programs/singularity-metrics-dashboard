import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Singularity Metrics Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
