import { Metadata } from "next";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const ogImageUrl = `/api/og?address=${address}`;

  return {
    title: `Token Scan: ${shortAddress} | RugSol`,
    description: `Security analysis for Solana token ${shortAddress}. Check mint authority, freeze authority, liquidity, and holder distribution.`,
    openGraph: {
      title: `Token Scan: ${shortAddress}`,
      description: `Security analysis for Solana token. Powered by RugSol.`,
      type: "website",
      siteName: "RugSol",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `RugSol scan result for ${shortAddress}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Token Scan: ${shortAddress}`,
      description: `Security analysis for Solana token. Powered by RugSol.`,
      images: [ogImageUrl],
    },
  };
}

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
