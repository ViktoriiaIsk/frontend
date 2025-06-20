import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'BookSwap - Book Exchange Platform',
  description: 'Buy and sell books online with BookSwap - the modern platform for book lovers',
  keywords: 'books, exchange, buy, sell, reading, literature',
  authors: [{ name: 'BookSwap Team' }],
  creator: "BookSwap",
  publisher: "BookSwap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bookswap-save-planet.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: 'BookSwap - Book Exchange Platform',
    description: 'Buy and sell books online with BookSwap - the modern platform for book lovers',
    url: 'https://bookswap-save-planet.vercel.app',
    siteName: 'BookSwap',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "BookSwap - Book Exchange Platform",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookSwap - Book Exchange Platform',
    description: 'Buy and sell books online with BookSwap - the modern platform for book lovers',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={inter.variable}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BookSwap" />
      </head>
      <body className={`${inter.className} antialiased bg-accent-cream text-neutral-800`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
