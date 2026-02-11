import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real-Time Alerts — RugSol",
  description: "Get instant notifications when token security conditions change. Monitor your portfolio in real-time.",
};

const alertTypes = [
  {
    title: "Authority Changes",
    desc: "Instant notification when a token's mint or freeze authority is revoked — or re-enabled.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "Liquidity Drops",
    desc: "Alert when a token's liquidity pool drops below a critical threshold or LP is removed.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
  },
  {
    title: "Large Holder Movements",
    desc: "Track when top holders sell significant portions of their bags or new whales accumulate.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Dev Wallet Activity",
    desc: "Monitor deployer wallet transactions — sells, transfers, and new token deployments.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Score Changes",
    desc: "Get notified when a token's risk score changes significantly — in either direction.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Honeypot Detection",
    desc: "Immediate alert if a previously sellable token becomes a honeypot — critical escape signal.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
];

const channels = [
  {
    name: "Telegram",
    desc: "Receive alerts directly in DMs or group chats via our bot.",
    available: true,
  },
  {
    name: "Discord",
    desc: "Webhook integration for your Discord server channels.",
    available: true,
  },
  {
    name: "Email",
    desc: "Digest alerts delivered to your inbox — daily or instant.",
    available: true,
  },
  {
    name: "Webhook",
    desc: "Custom HTTP webhooks for programmatic alert handling.",
    available: true,
  },
];

export default function AlertsPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Monitoring</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-text-primary">Real-Time</span>{" "}
              <span className="gradient-text">Alerts</span>
            </h1>
            <p className="text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              Monitor token security conditions 24/7. Get instant notifications when
              something changes — before it&apos;s too late.
            </p>
          </div>

          {/* Alert Types */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">What We Monitor</h2>
            <p className="text-sm text-text-secondary mb-8">Six critical on-chain signals tracked continuously.</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {alertTypes.map((alert) => (
                <div key={alert.title} className="glass-card p-5 rounded-2xl flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--silver-accent)]/10 flex items-center justify-center shrink-0 silver-accent">
                    {alert.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{alert.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">How It Works</h2>
            <p className="text-sm text-text-secondary mb-8">Simple setup, powerful monitoring.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "01", title: "Add tokens", desc: "Submit the token addresses you want to monitor. No limit on watchlist size." },
                { step: "02", title: "Choose alerts", desc: "Select which types of changes matter to you. Configure thresholds." },
                { step: "03", title: "Get notified", desc: "Receive instant alerts through Telegram, Discord, email, or webhooks." },
              ].map((item) => (
                <div key={item.step} className="glass-card p-5 rounded-2xl">
                  <span className="text-xs font-mono silver-accent tracking-widest">{item.step}</span>
                  <h3 className="text-base font-semibold text-text-primary mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Channels */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Delivery Channels</h2>
            <p className="text-sm text-text-secondary mb-8">Choose how you receive notifications.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {channels.map((ch) => (
                <div key={ch.name} className="glass-card p-5 rounded-2xl text-center">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{ch.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Preview */}
          <section className="mb-16">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Free</h3>
                <p className="text-3xl font-bold text-text-primary mb-1">$0</p>
                <p className="text-xs text-text-muted mb-4">Forever</p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Up to 5 tokens monitored
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Telegram alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Critical alerts only
                  </li>
                </ul>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-[var(--silver-accent)]/30">
                <h3 className="text-sm font-medium silver-accent uppercase tracking-wider mb-3">Pro</h3>
                <p className="text-3xl font-bold text-text-primary mb-1">$9<span className="text-base font-normal text-text-muted">/mo</span></p>
                <p className="text-xs text-text-muted mb-4">Billed monthly</p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Unlimited tokens
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    All channels (TG, Discord, Email, Webhook)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    All alert types with custom thresholds
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Priority API access
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="glass-card rounded-2xl p-8 sm:p-12">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">Start monitoring now</h2>
              <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
                Add our Telegram bot and set up your first alert in under a minute.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://t.me/rugsolinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                >
                  Set up alerts
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-border-color/50 text-text-primary hover:bg-bg-secondary/50 transition-colors"
                >
                  View docs
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
