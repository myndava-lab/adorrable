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
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="__next">
          {children}
        </div>
        <DynamicCrispChat />

      </body>
    </html>
  )
}