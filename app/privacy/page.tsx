import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RugSol",
  description: "Privacy Policy for the RugSol platform.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "RugSol is designed with privacy in mind. We do not require user accounts, email addresses, or personal information to use the token scanner. The only data processed is the publicly available on-chain data associated with the Solana token addresses you submit for analysis.",
  },
  {
    title: "2. Usage Data",
    content:
      "We may collect anonymized usage data including: pages visited, scan frequency, browser type, device type, and general geographic region. This data is used exclusively for improving Platform performance and user experience. We do not link usage data to individual identities.",
  },
  {
    title: "3. Blockchain Data",
    content:
      "Token addresses submitted for scanning are used to query public blockchain data. All information retrieved (holder data, authority status, liquidity, transactions) is publicly available on the Solana blockchain. We do not collect or store wallet private keys, seed phrases, or transaction signing capabilities.",
  },
  {
    title: "4. Cookies & Local Storage",
    content:
      "We use minimal local storage to remember your theme preference (light/dark mode) and recent scan history for convenience. No third-party tracking cookies are used. You can clear this data at any time through your browser settings.",
  },
  {
    title: "5. Third-Party Services",
    content:
      "Our Platform integrates with third-party APIs (Helius, Birdeye, Jupiter, DexScreener) to retrieve blockchain and market data. These services may have their own privacy policies. We do not share user-identifying information with these services — only public token addresses needed to fulfill scan requests.",
  },
  {
    title: "6. Data Retention",
    content:
      "Scan results may be cached temporarily to improve performance. We do not maintain long-term databases of user activity or scan history associated with identifiable individuals. Cached results are automatically purged on a regular basis.",
  },
  {
    title: "7. Data Security",
    content:
      "We implement industry-standard security measures to protect the Platform infrastructure. All connections are encrypted via HTTPS. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "8. Telegram Bot",
    content:
      "If you interact with our Telegram bot, we process your Telegram chat ID and message content to provide scan results. We do not store message history beyond what is needed to fulfill the current request. We do not access your Telegram contacts or profile information beyond your public display name.",
  },
  {
    title: "9. Children's Privacy",
    content:
      "RugSol is not intended for use by individuals under the age of 18. We do not knowingly collect information from minors.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "11. Contact",
    content:
      "For privacy-related inquiries, please contact us through our official Telegram channel or GitHub repository.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Legal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-text-muted">
              Last updated: February 1, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="glass-card p-6 rounded-2xl">
                <h2 className="text-base font-semibold text-text-primary mb-3">
                  {section.title}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
