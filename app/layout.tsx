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
