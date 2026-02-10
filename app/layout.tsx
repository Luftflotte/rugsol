import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "RugSol - Solana Token Scanner",
  description: "Instant rug pull detection for Solana tokens. Check any token in seconds with on-chain analysis.",
  keywords: ["solana", "rug pull", "token scanner", "crypto", "defi", "security"],
  openGraph: {
    title: "RugSol - Solana Token Scanner",
    description: "Instant rug pull detection for Solana tokens. Protect yourself before you ape in.",
    type: "website",
    siteName: "RugSol",
  },
  twitter: {
    card: "summary_large_image",
    title: "RugSol - Solana Token Scanner",
    description: "Instant rug pull detection for Solana tokens. Protect yourself before you ape in.",
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
      </body>
    </html>
  );
}
