
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import CrispChat from '@/components/CrispChat'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Adorrable.dev - AI Website Builder',
  description: 'Build beautiful websites with AI in minutes',
  metadataBase: new URL('https://adorrable.dev'),
}

// Dynamically import client components to prevent hydration issues
const DynamicCrispChat = dynamic(() => import('@/components/CrispChat'), {
  ssr: false,
  loading: () => null,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="__next">
          {children}
        </div>
        <DynamicCrispChat />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration timing issues
              window.__NEXT_HYDRATION_CB = function() {
                console.log('Hydration complete');
              };
              
              // Force reload on chunk load error
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ChunkLoadError')) {
                  console.log('Chunk load error detected, reloading...');
                  setTimeout(() => window.location.reload(), 100);
                }
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
