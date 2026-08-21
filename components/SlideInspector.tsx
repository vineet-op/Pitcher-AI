'use client';

import { Slide } from '@/app/api/generate-pitch/route';
import { MEMES } from '@/lib/memes';

const TYPE_LABEL: Record<Slide['slide_type'], string> = {
  hook: 'THE HOOK',
  setup: 'SETUP',
  punchline: 'PUNCHLINE',
  proof: 'PROOF OF WORK',
  skills: 'THE STACK',
  ask: 'THE ASK',
};

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function padBullets(points: string[]): string[] {
  const next = [...points];
  while (next.length < 3) next.push('');
  return next.slice(0, 3);
}

interface SlideInspectorProps {
  slide: Slide;
  total: number;
  isDirty: boolean;
  onChange: (patch: Partial<Slide>) => void;
  onRevert: () => void;
}

export default function SlideInspector({
  slide,
  total,
  isDirty,
  onChange,
  onRevert,
}: SlideInspectorProps) {
  const bullets = padBullets(slide.bullet_points ?? []);
  const headlineWords = wordCount(slide.headline);
  const subtextWords = wordCount(slide.subtext);

  function setBullet(index: number, value: string) {
    const next = [...bullets];
    next[index] = value;
    onChange({ bullet_points: next });
  }

  return (
    <aside className="border-4 border-[#0A0A0A] bg-[#F2EDE4] brut-shadow-lg flex flex-col">
      <div className="border-b-4 border-[#0A0A0A] bg-[#CCFF00] px-5 py-3 flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]">
          Edit this slide
        </span>
        <span className="text-xs font-bold text-[#0A0A0A]/50 uppercase tracking-widest">
          {String(slide.slide_number).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-[#1847FF]">
            {TYPE_LABEL[slide.slide_type]}
          </div>
          <p className="text-xs font-bold text-[#0A0A0A]/40 mt-1">
            Changes update the preview and the export.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60">
              Headline
            </label>
            <span
              className={`text-xs font-bold ${headlineWords > 12 ? 'text-[#FF1F5A]' : 'text-[#0A0A0A]/40'}`}
            >
              {headlineWords} / 12 words
            </span>
          </div>
          <textarea
            value={slide.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            rows={3}
            className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60">
              Subtext
            </label>
            <span
              className={`text-xs font-bold ${subtextWords > 10 ? 'text-[#FF1F5A]' : 'text-[#0A0A0A]/40'}`}
            >
              {subtextWords} / 10 words
            </span>
          </div>
          <input
            type="text"
            value={slide.subtext}
            onChange={(e) => onChange({ subtext: e.target.value })}
            placeholder="Optional one-liner"
            className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
            Bullets
          </label>
          <div className="flex flex-col gap-2">
            {bullets.map((line, i) => (
              <input
                key={i}
                type="text"
                value={line}
                onChange={(e) => setBullet(i, e.target.value)}
                placeholder={`Bullet ${i + 1}`}
                className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-2">
            Meme
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onChange({ image_tag: '' })}
              className={`h-14 border-2 text-[10px] font-black uppercase tracking-wider
                ${slide.image_tag === ''
                  ? 'border-[#1847FF] bg-[#1847FF] text-white'
                  : 'border-[#0A0A0A] bg-white text-[#0A0A0A]/50 hover:bg-[#0A0A0A]/5'
                }`}
            >
              None
            </button>
            {Object.entries(MEMES).map(([tag, meme]) => (
              <button
                key={tag}
                type="button"
                title={tag}
                onClick={() => onChange({ image_tag: tag })}
                className={`h-14 border-2 overflow-hidden bg-[#0A0A0A]
                  ${slide.image_tag === tag ? 'border-[#1847FF]' : 'border-[#0A0A0A] opacity-70 hover:opacity-100'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={meme.file} alt={tag} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onRevert}
          disabled={!isDirty}
          className="brut-btn brut-shadow w-full border-2 border-[#0A0A0A] bg-white py-3 text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Revert this slide
        </button>
      </div>
    </aside>
  );
}
