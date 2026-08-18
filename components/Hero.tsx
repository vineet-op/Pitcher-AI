'use client';

import SlideCard from '@/components/SlideCard';
import { Slide } from '@/app/api/generate-pitch/route';

const HERO_SLIDES: Slide[] = [
  {
    slide_number: 1,
    slide_title: 'The Hook',
    headline: "I've shipped more features than most teams.",
    subtext: 'And I have the Git commits to prove it.',
    bullet_points: [],
    slide_type: 'hook',
    image_tag: '',
  },
  {
    slide_number: 2,
    slide_title: 'Proof of Work',
    headline: '90% faster. Not a typo.',
    subtext: 'Built an automation pipeline that cut 4 hours to 23 minutes.',
    bullet_points: [],
    slide_type: 'proof',
    image_tag: 'stonks',
  },
  {
    slide_number: 3,
    slide_title: 'The Ask',
    headline: 'Give me a problem. I will ship the solution.',
    subtext: "Let's talk.",
    bullet_points: [],
    slide_type: 'ask',
    image_tag: '',
  },
];

const CARD_SCALE = 0.24;
const CARD_W = Math.round(1080 * CARD_SCALE);
const CARD_H = Math.round(1350 * CARD_SCALE);

interface HeroProps {
  onCTA: () => void;
}

export default function Hero({ onCTA }: HeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-20">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── Left: text ── */}
        <div className="flex-1 min-w-0">
          {/* Sticker */}
          <div className="mb-6 inline-block">
            <span className="sticker bg-[#FF1F5A] text-white -rotate-2 inline-block">
              AI POWERED
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-none tracking-tight text-[#0A0A0A] mb-6">
            YOUR RESUME<br />
            IS BORING.<br />
            YOUR{' '}
            <span className="bg-[#CCFF00] px-1">
              STORY
            </span>{' '}
            ISN&apos;T.
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg font-medium text-[#0A0A0A]/70 mb-8 max-w-lg leading-relaxed">
            Turn your resume into a 12-slide carousel people actually want to
            read. Upload your PDF and let AI turn your experience into a story.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onCTA}
              className="brut-btn brut-shadow-lg bg-[#1847FF] text-white border-4 border-[#0A0A0A] px-7 py-4 text-sm font-black uppercase tracking-widest transition-all"
            >
              TURN MY RESUME INTO A CAROUSEL →
            </button>
            <a
              href="#how-it-works"
              className="brut-btn brut-shadow bg-[#F2EDE4] text-[#0A0A0A] border-4 border-[#0A0A0A] px-7 py-4 text-sm font-black uppercase tracking-widest transition-all text-center"
            >
              SEE HOW IT WORKS
            </a>
          </div>

          {/* Social proof tag */}
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/40">
            No sign-up required · PDF in · Carousel out
          </p>
        </div>

        {/* ── Right: stacked slide cards ── */}
        <div className="shrink-0 flex items-center justify-center">
          <div
            className="relative"
            style={{ width: CARD_W + 60, height: CARD_H + 40 }}
          >
            {/* Card 3 — back */}
            <div
              className="absolute brut-shadow-lg border-4 border-[#0A0A0A] overflow-hidden"
              style={{
                transform: 'rotate(-7deg) translate(-22px, 8px)',
                zIndex: 1,
                opacity: 0.75,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              <SlideCard slide={HERO_SLIDES[2]} total={3} scale={CARD_SCALE} />
            </div>

            {/* Card 2 — middle */}
            <div
              className="absolute brut-shadow-lg border-4 border-[#0A0A0A] overflow-hidden"
              style={{
                transform: 'rotate(-2deg) translate(-8px, 3px)',
                zIndex: 2,
                opacity: 0.88,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              <SlideCard slide={HERO_SLIDES[1]} total={3} scale={CARD_SCALE} />
            </div>

            {/* Card 1 — front */}
            <div
              className="absolute brut-shadow-lg border-4 border-[#0A0A0A] overflow-hidden"
              style={{
                transform: 'rotate(3deg)',
                zIndex: 3,
                width: CARD_W,
                height: CARD_H,
              }}
            >
              <SlideCard slide={HERO_SLIDES[0]} total={3} scale={CARD_SCALE} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
