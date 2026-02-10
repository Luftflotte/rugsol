import React, { forwardRef } from 'react';

interface CheckItem {
  id?: string;
  name?: string;
  status: 'pass' | 'warn' | 'fail';
  value?: string | number;
  shortLabel?: string;
}

interface ShareCardProps {
  token: {
    name: string | null;
    symbol: string | null;
    image?: string | null;
    address?: string;
  };
  score: number;
  checks: CheckItem[];
  scannedAt: string;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return '#00ff88';
  if (score >= 50) return '#fbbf24';
  if (score >= 30) return '#f97316';
  return '#ef4444';
};

const getGradeLabel = (score: number) => {
  if (score >= 85) return 'SAFE';
  if (score >= 70) return 'LOW RISK';
  if (score >= 50) return 'CAUTION';
  if (score >= 30) return 'HIGH RISK';
  return 'DANGER';
};

const formatCheckLabel = (c: CheckItem) => {
  if (c.shortLabel) return c.shortLabel;
  const id = (c.id || c.name || '').toString();
  const v = c.value;
  switch (id) {
    case 'mintAuthority':
      return c.status === 'pass' ? 'Mint Revoked' : 'Mint Active';
    case 'freezeAuthority':
      return c.status === 'pass' ? 'Freeze Revoked' : 'Freeze Active';
    case 'lpStatus':
      return c.status === 'pass' ? 'LP Burned' : 'LP Not Burned';
    case 'topHolders':
      return `Top Holder ${v ?? ''}`;
    case 'topTenPercent':
      return `Top 10: ${v ?? ''}`;
    case 'lpSize':
      return `LP: ${v ?? ''}`;
    case 'tokenAge':
      return `Age: ${v ?? ''}`;
    case 'volume':
    case 'volume24h':
      return `Vol: ${v ?? ''}`;
    case 'metadata':
      return c.status === 'pass' ? 'Meta Immutable' : 'Meta Mutable';
    case 'socials':
      return c.status === 'pass' ? 'Socials Found' : 'No Socials';
    case 'holders':
      return `Holders: ${v ?? ''}`;
    case 'supply':
      return `Supply: ${v ?? ''}`;
    default:
      return c.name || id || '';
  }
};

function ShareCardComponent({ token, score, checks, scannedAt }: ShareCardProps, ref: React.Ref<HTMLDivElement>) {
  const scoreColor = getScoreColor(score);
  const gradeLabel = getGradeLabel(score);
  const shortAddress = token?.address ? `${token.address.slice(0, 6)}...${token.address.slice(-4)}` : '';

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '0',
        width: '1200px',
        height: '630px',
        boxSizing: 'border-box',
        background: 'linear-gradient(160deg, #0c0c14 0%, #0a0f18 40%, #0d0a14 100%)',
        color: '#e4e4e7',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(0, 255, 136, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* glow accent */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -50,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 1,
        }}
      >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
              color: '#0a0a0f',
            }}
          >
            R
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: 0.5, color: '#ffffff' }}>RUGCHECK</span>
        </div>
        <span style={{ fontSize: 14, color: '#52525b', letterSpacing: 0.5 }}>rugcheck.xyz</span>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, padding: '32px 40px', position: 'relative', zIndex: 1 }}>
        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* token row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1a1a2e', border: '2px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0 }}>
              {token.image ? (
                <img src={token.image} crossOrigin="anonymous" alt={token.name || 'token'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a', fontWeight: 700 }}>{(token.symbol && token.symbol.charAt(0)) || '?'}</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: '#ffffff' }}>{token.name || 'Unknown Token'}</div>
              <div style={{ fontSize: 15, color: '#71717a', marginTop: 2 }}>${token.symbol || '???'}</div>
              <div style={{ fontSize: 12, color: '#3f3f46', fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace", marginTop: 3, letterSpacing: 0.5 }}>{shortAddress}</div>
            </div>
          </div>

          {/* chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {checks.map((c, i) => {
              const label = formatCheckLabel(c);
              const status = c.status || 'pass';
                const colorData =
                  status === 'pass'
                    ? { color: '#00ff88', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.15)' }
                    : status === 'fail'
                    ? { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)' }
                    : { color: '#fbbf24', bg: 'rgba(251,191,36,0.06)', border: 'rgba(251,191,36,0.15)' };
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: colorData.bg,
                      border: `1px solid ${colorData.border}`,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: colorData.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: colorData.color }}>{label}</span>
                  </div>
                );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', background: `${scoreColor}0a`, border: `3px solid ${scoreColor}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: -2 }}>{score}</div>
            <div style={{ fontSize: 18, color: '#52525b', fontWeight: 500, marginTop: 2 }}>/100</div>
          </div>

          <div style={{ marginTop: 16, padding: '6px 24px', borderRadius: 100, background: scoreColor === '#00ff88' ? 'rgba(0,255,136,0.1)' : scoreColor === '#fbbf24' ? 'rgba(251,191,36,0.1)' : scoreColor === '#f97316' ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)', border: scoreColor === '#00ff88' ? '1px solid rgba(0,255,136,0.25)' : scoreColor === '#fbbf24' ? '1px solid rgba(251,191,36,0.25)' : scoreColor === '#f97316' ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(239,68,68,0.25)', fontSize: 13, fontWeight: 700, color: scoreColor, letterSpacing: 2, textTransform: 'uppercase' }}>{gradeLabel}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 12, color: '#3f3f46' }}>Scanned by RugSol</span>
        <span style={{ fontSize: 12, color: '#3f3f46' }}>{scannedAt}</span>
      </div>
    </div>
  );
}

const ShareCard = forwardRef(ShareCardComponent);

ShareCard.displayName = 'ShareCard';
export default ShareCard;
