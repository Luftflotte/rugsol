import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getBaseUrl } from "@/lib/utils/url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "RugSol - Solana Token Scanner",
  description: "Instant rug pull detection for Solana tokens. Check any token in seconds with on-chain analysis.",
  keywords: ["solana", "rug pull", "token scanner", "crypto", "defi", "security"],
  openGraph: {
    title: "RugSol - Solana Token Scanner",
    description: "Instant rug pull detection for Solana tokens. Protect yourself before you ape in.",
    type: "website",
    siteName: "RugSol",
    images: [
      {
        url: `${getBaseUrl()}/api/og?mode=home`,
        width: 1200,
        height: 630,
        alt: "RugSol - Solana Token Scanner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RugSol - Solana Token Scanner",
    description: "Instant rug pull detection for Solana tokens. Protect yourself before you ape in.",
    images: [`${getBaseUrl()}/api/og?mode=home`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "RugSol",
              url: "https://rugsol.info",
              description:
                "Free Solana token security scanner. Instant rug pull detection with on-chain analysis — risk scores, holder analysis, honeypot checks, and more.",
              applicationCategory: "SecurityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Solana token risk scoring (0-100)",
                "Mint & freeze authority checks",
                "Holder concentration analysis",
                "Honeypot detection via swap simulation",
                "Liquidity pool verification",
                "Pump.fun bonding curve tracking",
                "Telegram bot integration",
                "REST API for trading bots",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script src="/noir.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
