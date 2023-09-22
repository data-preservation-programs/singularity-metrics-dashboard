import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Singularity',
  description: 'This real-time dashboard tracks a variety of metrics pertaining to the Singularity project, data preparation, deals made, and filtering on a per-client basis.',
  openGraph: {
    title: 'Dashboard - Singularity',
    description: 'This real-time dashboard tracks a variety of metrics pertaining to the Singularity project, data preparation, deals made, and filtering on a per-client basis.',
    images: [
      {
        url: 'https://stats.singularity.storage/images/open-graph.png',
        width: 2000,
        height: 1050,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon/favicon-32x32.png',
    apple: [
      { url: '/favicon/apple-icon-57x57.png', sizes: '57x57', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-60x60.png', sizes: '60x60', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-72x72.png', sizes: '72x72', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-76x76.png', sizes: '76x76', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-114x114.png', sizes: '114x114', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-152x152.png', sizes: '152x152', rel: 'apple-touch-icon' },
      { url: '/favicon/apple-icon-180x180.png', sizes: '180x180', rel: 'apple-touch-icon' },
    ],
    other: {
      rel: 'apple-touch-icon',
      url: '/favicon/apple-icon-180x180.png',
    },
  },
  themeColor: '#ffffff',
  manifest: '/favicon/manifest.json'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
