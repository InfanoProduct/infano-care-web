import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Poppins, Inter, Noto_Sans, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Analytics, AnalyticsNoScript } from "@/components/common/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://infano.care";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Infano Care | Modern Healthcare & Puberty Education Solutions",
    template: "%s | Infano Care",
  },
  description: "India's first dedicated platform empowering adolescent girls through puberty education, healthcare solutions, and supportive community networks.",
  keywords: [
    "Adolescent healthcare",
    "Puberty education India",
    "Menstrual hygiene",
    "Parenting teenage girls",
    "School health workshops",
    "Infano Care",
    "Gigi The Awkward Age Book"
  ],
  authors: [{ name: "Infano Care Team", url: "https://infano.care" }],
  creator: "Infano Care",
  publisher: "Infano Care",
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
    type: "website",
    locale: "en_IN",
    url: "https://infano.care",
    siteName: "Infano Care",
    title: "Infano Care | Modern Healthcare & Puberty Education Solutions",
    description: "India's first dedicated platform empowering adolescent girls through puberty education, healthcare solutions, and supportive community networks.",
    images: [
      {
        url: "/og-images/landing-og.png",
        width: 1200,
        height: 630,
        alt: "Infano Care - Puberty Education & Adolescent Health Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infano Care | Puberty Education & Adolescent Health Solutions",
    description: "Empowering girls and supporting parents through their adolescent journey.",
    images: ["/og-images/landing-og.png"],
    creator: "@Infanocare",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  verification: process.env.NODE_ENV === "production" ? {
    other: {
      "facebook-domain-verification": ["rvcuesxaaxj1ecb6sm92t6jzgd8i0p"],
    },
  } : undefined,
};


import { Toaster } from "react-hot-toast";
import { GigiChatWidget } from "@/features/parent/components/GigiChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${poppins.variable} ${inter.variable} ${notoSans.variable} ${playfairDisplay.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Analytics />
      </head>
      <body className="min-h-full flex flex-col bg-background" suppressHydrationWarning>
        <AnalyticsNoScript />
        <QueryProvider>
          <Toaster position="top-right" />
          {children}
          <GigiChatWidget />
        </QueryProvider>
      </body>
    </html>
  );
}
