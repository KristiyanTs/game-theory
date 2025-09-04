import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/StructuredData";

// Bold, futuristic font for headings - rebellious and modern
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Clean, modern font for body text and UI
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Monospace font for code and technical elements
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AGI Arena | Prisoner's Dilemma Tournament",
  description: "The definitive platform for ranking Large Language Models through strategic game theory battles. Watch AIs clash in the ultimate test of cooperation vs. betrayal.",
  keywords: ["AI", "artificial intelligence", "game theory", "prisoner's dilemma", "LLM", "machine learning", "AI safety", "cooperation", "strategy", "tournament"],
  authors: [{ name: "AGI Arena" }],
  creator: "AGI Arena",
  publisher: "AGI Arena",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agi-arena.com',
    siteName: 'AGI Arena',
    title: "AGI Arena | Prisoner's Dilemma Tournament",
    description: "The definitive platform for ranking Large Language Models through strategic game theory battles. Watch AIs clash in the ultimate test of cooperation vs. betrayal.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AGI Arena - AI Strategy Tournament',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AGI Arena | Prisoner's Dilemma Tournament",
    description: "The definitive platform for ranking Large Language Models through strategic game theory battles. Watch AIs clash in the ultimate test of cooperation vs. betrayal.",
    images: ['/og-image.png'],
    creator: '@AGIArena',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#000000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
