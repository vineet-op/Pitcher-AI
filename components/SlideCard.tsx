'use client';

import { Slide } from '@/app/api/generate-pitch/route';
import { MEMES } from '@/lib/memes';

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

export interface ContactLinks {
  name: string;
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
  portfolio: string;
}

/** Ensure a URL is absolute so links open correctly. */
function toHref(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

/** Short display text: strip protocol, www, and trailing slash. */
function toDisplay(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

const LINK_ICONS: Record<string, React.ReactNode> = {
  email: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  ),
  linkedin: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
  github: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.11-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.05 11.05 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .3.21.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
  twitter: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  ),
  portfolio: (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

interface Accent {
  color: string;
  glow: string;
  label: string;
}

const ACCENTS: Record<string, Accent> = {
  hook:      { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.14)', label: 'THE HOOK' },
  setup:     { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.12)',  label: 'SETUP' },
  punchline: { color: '#facc15', glow: 'rgba(250, 204, 21, 0.12)',  label: 'PUNCHLINE' },
  proof:     { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.12)',  label: 'PROOF OF WORK' },
  skills:    { color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.12)',  label: 'THE STACK' },
  ask:       { color: '#f472b6', glow: 'rgba(244, 114, 182, 0.14)', label: 'THE ASK' },
};

function headlineSize(text: string, hasImage: boolean): number {
  const len = text.length;
  if (hasImage) {
    if (len > 60) return 52;
    if (len > 40) return 58;
    return 64;
  }
  if (len > 70) return 60;
  if (len > 45) return 70;
  return 82;
}

interface SlideCardProps {
  slide: Slide;
  total: number;
  scale?: number;
  contact?: ContactLinks;
  innerRef?: React.Ref<HTMLDivElement>;
}

export default function SlideCard({ slide, total, scale = 1, contact, innerRef }: SlideCardProps) {
  const accent = ACCENTS[slide.slide_type] ?? ACCENTS.setup;
  const meme = slide.image_tag ? MEMES[slide.image_tag] : undefined;
  const headline = slide.headline.replace(/\*\*/g, '');
  const isAskSlide = slide.slide_type === 'ask';

  const contactLinks: { key: string; href: string; display: string }[] = [];
  if (isAskSlide && contact) {
    if (contact.email)     contactLinks.push({ key: 'email',     href: `mailto:${contact.email}`,      display: contact.email });
    if (contact.linkedin)  contactLinks.push({ key: 'linkedin',  href: toHref(contact.linkedin),       display: toDisplay(contact.linkedin) });
    if (contact.github)    contactLinks.push({ key: 'github',    href: toHref(contact.github),         display: toDisplay(contact.github) });
    if (contact.twitter)   contactLinks.push({ key: 'twitter',   href: toHref(contact.twitter),        display: toDisplay(contact.twitter) });
    if (contact.portfolio) contactLinks.push({ key: 'portfolio', href: toHref(contact.portfolio),      display: toDisplay(contact.portfolio) });
  }

  return (
    <div style={{ width: SLIDE_W * scale, height: SLIDE_H * scale }}>
      <div
        ref={innerRef}
        data-slide-card={slide.slide_number}
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          background: `radial-gradient(ellipse 120% 70% at 50% -10%, ${accent.glow}, transparent 60%), linear-gradient(160deg, #0c0d12 0%, #07080b 100%)`,
          padding: 88,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 10,
            background: `linear-gradient(90deg, ${accent.color}, transparent 70%)`,
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: 7,
              textTransform: 'uppercase',
              color: accent.color,
            }}
          >
            {accent.label}
          </span>
          <span
            style={{
              fontSize: 26,
              fontFamily: 'var(--font-geist-mono), monospace',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 4,
            }}
          >
            {String(slide.slide_number).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 44,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <h2
            style={{
              fontSize: headlineSize(headline, !!meme),
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: -1,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {headline}
          </h2>

          {slide.subtext && !(isAskSlide && contactLinks.length > 0) && (
            <p
              style={{
                fontSize: 34,
                lineHeight: 1.45,
                color: 'rgba(255,255,255,0.55)',
                margin: 0,
                fontWeight: 500,
                maxWidth: '90%',
              }}
            >
              {slide.subtext}
            </p>
          )}

          {isAskSlide && contactLinks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              {contact?.name && (
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.85)',
                    letterSpacing: 5,
                    textTransform: 'uppercase',
                  }}
                >
                  {contact.name}
                </span>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {contactLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '18px 30px',
                      borderRadius: 999,
                      border: `2px solid ${accent.color}55`,
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 26,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ color: accent.color, display: 'flex' }}>{LINK_ICONS[link.key]}</span>
                    {link.display}
                  </a>
                ))}
              </div>
            </div>
          )}

          {slide.bullet_points?.some((p) => p.trim()) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              {slide.bullet_points.filter((p) => p.trim()).map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: accent.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 32, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          )}

          {meme && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meme.file}
              alt={slide.image_tag}
              style={{
                maxHeight: 430,
                maxWidth: '88%',
                objectFit: 'contain',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.1)',
                alignSelf: 'center',
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#0a0a0a', fontSize: 24, fontWeight: 900 }}>P</span>
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              Pitcher AI
            </span>
          </div>

          {slide.slide_number < total ? (
            <span style={{ fontSize: 28, color: accent.color, fontWeight: 700, letterSpacing: 2 }}>
              swipe →
            </span>
          ) : (
            <span style={{ fontSize: 28, color: accent.color, fontWeight: 700, letterSpacing: 2 }}>
              ■
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
