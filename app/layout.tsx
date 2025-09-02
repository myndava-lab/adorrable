import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

const InspirationalWidget = dynamic(() => import("@/components/InspirationalWidget"), {
  ssr: false,
  loading: () => null
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Adorrable - AI Website Builder",
  description: "Create culturally intelligent websites and apps by chatting with AI. Built for Africa and the world.",
  keywords: "AI website builder, African websites, cultural AI, Pidgin websites, Swahili websites, French websites",
  authors: [{ name: "Adorrable Team" }],
  openGraph: {
    title: "Adorrable - AI Website Builder",
    description: "Create culturally intelligent websites and apps by chatting with AI",
    url: "https://adorrable.dev",
    siteName: "Adorrable",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adorrable - AI Website Builder",
    description: "Create culturally intelligent websites and apps by chatting with AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__NEXT_HYDRATION_CB = function() {
                console.log('Hydration complete');
              };
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <main className="min-h-screen">{children}</main>
        <InspirationalWidget />
      </body>
    </html>
  );
}