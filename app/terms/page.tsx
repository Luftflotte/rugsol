import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RugSol",
  description: "Terms of Service for using the RugSol platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      'By accessing or using RugSol ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the Platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.',
  },
  {
    title: "2. Description of Service",
    content:
      "RugSol provides on-chain security analysis tools for Solana-based tokens. The Platform performs automated risk assessments including authority checks, holder distribution analysis, liquidity verification, honeypot detection, and other security evaluations. Results are generated algorithmically and presented for informational purposes only.",
  },
  {
    title: "3. No Financial Advice",
    content:
      "Nothing on this Platform constitutes financial, investment, legal, or tax advice. Token scores, risk ratings, letter grades, and any other outputs are the result of automated analysis and should not be the sole basis for any investment or trading decision. You are solely responsible for your own financial decisions.",
  },
  {
    title: "4. Accuracy of Information",
    content:
      "While we strive for accuracy, RugSol does not guarantee that any analysis, score, or data presented on the Platform is complete, accurate, or up-to-date. Blockchain data may change rapidly, and our analysis reflects a point-in-time snapshot. A high score does not guarantee token safety, and a low score does not guarantee a token is a scam.",
  },
  {
    title: "5. User Responsibilities",
    content:
      "You agree to use the Platform lawfully and not to: (a) attempt to reverse-engineer, decompile, or extract source code; (b) use automated systems to scrape data at excessive rates; (c) misrepresent RugSol analysis results; (d) use the Platform for market manipulation or fraudulent purposes; (e) circumvent any rate limiting or access controls.",
  },
  {
    title: "6. API Usage",
    content:
      "Access to the RugSol API is provided subject to rate limits and fair use policies. We reserve the right to restrict or terminate API access for any account that exceeds reasonable usage limits or engages in abusive behavior. Commercial use of the API requires prior written consent.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "All content, branding, scoring methodologies, and software on the Platform are the intellectual property of RugSol. You may not reproduce, distribute, or create derivative works without explicit written permission. You may share individual scan results with proper attribution.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      'The Platform is provided "as is" without warranties of any kind. RugSol, its founders, contributors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Platform, including but not limited to financial losses from trading decisions influenced by our analysis.',
  },
  {
    title: "9. Third-Party Services",
    content:
      "The Platform relies on third-party data sources including Helius, Birdeye, Jupiter, DexScreener, and Solana blockchain nodes. We are not responsible for the availability, accuracy, or reliability of third-party services. Disruptions to these services may affect Platform functionality.",
  },
  {
    title: "10. Termination",
    content:
      "We reserve the right to suspend or terminate access to the Platform at any time, for any reason, without prior notice. Upon termination, your right to use the Platform ceases immediately.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration.",
  },
  {
    title: "12. Contact",
    content:
      "For questions regarding these Terms of Service, please reach out through our official Telegram channel or GitHub repository.",
  },
];

export default function TermsPage() {
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
              Terms of Service
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
