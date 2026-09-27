import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — RugSol",
  description: "Security research, rug pull analysis, and Solana ecosystem insights from the RugSol team.",
};

const posts = [
  {
    title: "Anatomy of a Solana Rug Pull: What Happens On-Chain",
    excerpt: "A deep dive into the most common rug pull patterns on Solana — from mint authority abuse to coordinated LP removal. We analyze real cases and show what the blockchain reveals.",
    date: "Feb 8, 2026",
    tag: "Research",
    readTime: "8 min read",
  },
  {
    title: "How RugSol Detects Honeypot Tokens",
    excerpt: "Our honeypot detection works by simulating a sell transaction through Jupiter aggregator. Here's how the technical process works and why some edge cases are harder to catch.",
    date: "Feb 3, 2026",
    tag: "Technical",
    readTime: "6 min read",
  },
  {
    title: "Pump.fun Security: What to Watch For",
    excerpt: "Pump.fun tokens have a unique lifecycle with bonding curves. We break down the specific risks at each stage — from launch through DEX migration — and how our scanner handles them.",
    date: "Jan 27, 2026",
    tag: "Guide",
    readTime: "5 min read",
  },
  {
    title: "Sniper Bots and Jito Bundles: The Insider Trading Problem",
    excerpt: "When wallets buy tokens in the same block as deployment, it signals insider activity. We explain how sniper detection works and what Jito bundle analysis reveals about coordinated buys.",
    date: "Jan 20, 2026",
    tag: "Research",
    readTime: "7 min read",
  },
  {
    title: "Understanding Token Holder Concentration Risk",
    excerpt: "A single wallet holding 40% of supply is a red flag — but context matters. We explore how RugSol distinguishes between legitimate accumulation and potential dump risks.",
    date: "Jan 14, 2026",
    tag: "Guide",
    readTime: "4 min read",
  },
  {
    title: "RugSol v2.4: Advanced Wallet Clustering",
    excerpt: "Our latest update introduces linked wallet detection — identifying wallets funded from the same source that appear to be independent holders. Here's how the algorithm works.",
    date: "Jan 8, 2026",
    tag: "Update",
    readTime: "3 min read",
  },
];

const tagColors: Record<string, string> = {
  Research: "bg-blue-500/10 text-blue-500",
  Technical: "bg-purple-500/10 text-purple-500",
  Guide: "bg-emerald-500/10 text-emerald-500",
  Update: "bg-[var(--silver-accent)]/10 text-[var(--silver-accent)]",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen premium-bg text-text-primary">
      <Navbar />

      <main className="pt-20 md:pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--silver-accent)]/10 border border-[var(--silver-accent)]/30 mb-6 backdrop-blur-sm">
              <span className="text-sm font-medium silver-accent tracking-wide">Blog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              Security research, technical deep dives, and ecosystem insights
              from the RugSol team.
            </p>
          </div>

          {/* Featured Post */}
          <section className="mb-12">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--silver-accent)]/20 group cursor-pointer hover:border-[var(--silver-accent)]/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${tagColors[posts[0].tag]}`}>
                  {posts[0].tag}
                </span>
                <span className="text-xs text-text-muted">{posts[0].date}</span>
                <span className="text-xs text-text-muted">{posts[0].readTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 group-hover:text-[var(--silver-accent)] transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {posts[0].excerpt}
              </p>
              <span className="text-sm font-medium text-text-primary inline-flex items-center gap-1.5 group-hover:text-[var(--silver-accent)] transition-colors">
                Read article
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </div>
          </section>

          {/* All Posts */}
          <section>
            <div className="space-y-4">
              {posts.slice(1).map((post) => (
                <div key={post.title} className="glass-card p-5 sm:p-6 rounded-2xl group cursor-pointer hover:border-[var(--silver-accent)]/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${tagColors[post.tag]}`}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-text-muted">{post.date}</span>
                    <span className="text-xs text-text-muted">{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-[var(--silver-accent)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="mt-16">
            <div className="glass-card p-6 sm:p-8 rounded-2xl text-center">
              <h2 className="text-lg font-bold text-text-primary mb-2">Stay in the loop</h2>
              <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                Follow us on Twitter and join our Telegram for the latest security research and platform updates.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-premium inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
                <a
                  href="https://t.me/rugsolinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border-color/50 text-text-primary hover:bg-bg-secondary/50 transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
