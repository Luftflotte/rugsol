import { Navbar } from "@/components/Navbar";
import { SearchInput } from "@/components/SearchInput";
import { RecentScans } from "@/components/RecentScans";
import { Stats } from "@/components/Stats";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--silver-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--silver-accent)]"></span>
              </span>
              <span className="text-sm font-medium silver-accent tracking-wide">Live on Solana Mainnet</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-text-primary">Check any Solana</span>
              <br />
              <span className="gradient-text">token in seconds</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              Instant rug pull detection powered by on-chain analysis.
              <br className="hidden sm:block" />
              Protect yourself before you ape in.
            </p>

            {/* Search Input */}
            <SearchInput />
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <Stats />
          </div>

          {/* Recent Scans Section */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-6 px-4">
              <h2 className="text-xl font-semibold text-text-primary">Recent Scans</h2>
            </div>
            <RecentScans />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 px-4">
            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 silver-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">On-Chain Analysis</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Real-time checks on mint authority, freeze authority, holder distribution, and LP status.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 silver-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Instant Results</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Get comprehensive risk assessment in under 5 seconds. No sign-up required.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 silver-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">API & Bot</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Integrate with your trading bot or use our Telegram bot for instant alerts.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
