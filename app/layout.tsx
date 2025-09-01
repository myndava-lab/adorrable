import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InspirationalWidget from "@/components/InspirationalWidget";
import CrispChat from "@/components/CrispChat";

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
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen bg-offwhite text-charcoal`} style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <main className="min-h-[90vh]">{children}</main>
        <InspirationalWidget />
        <CrispChat />
        <footer className="text-center py-4">
          <p>Adorrable.dev — Made for everyone, with a touch of Africa. 🌍</p>
          <p>Payments by Myndava AI Systems LLC</p>
        </footer>
      </body>
    </html>
  );
}