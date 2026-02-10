import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">About RugCheck</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              RugCheck is a lightweight on-chain scanner for Solana tokens. We analyze mint authorities,
              holder distributions, LP status and more to surface rug pull risk in seconds.
            </p>
          </div>

          <section className="grid md:grid-cols-3 gap-6 mb-12 px-4">
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Our Mission</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Make on-chain risk visible and actionable so users can protect themselves before interacting with tokens.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-text-primary mb-2">How It Works</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We run a series of deterministic checks against token metadata, mint authorities, token holders,
                and liquidity to compute a compact score and highlight risk vectors.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Integrations</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Use our public API for programmatic checks or the Telegram bot for instant alerts. No signup required
                for basic usage.
              </p>
            </div>
          </section>

          <section className="mb-20 px-4">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">API & Bot</h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The API exposes simple endpoints for scanning tokens and retrieving recent scans. The Telegram bot
              provides quick alerts and an inline scan command for convenience.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-semibold mb-2">Public API</h4>
                <p className="text-text-secondary text-sm">Endpoint: <span className="text-text-primary">/api/scan</span></p>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <h4 className="font-semibold mb-2">Telegram Bot</h4>
                <p className="text-text-secondary text-sm">Quick alerts and scan commands for your groups.</p>
              </div>
            </div>
          </section>

          <section className="mb-20 px-4">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Open Source</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              The project is maintained with a focus on transparency and reproducible checks. Contributions and
              issue reports are welcome via the repository.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}


