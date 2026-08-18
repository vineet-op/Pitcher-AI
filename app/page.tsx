'use client';

import { useState, useRef } from 'react';
import { Slide } from './api/generate-pitch/route';
import SlideCard, { ContactLinks } from '@/components/SlideCard';

type Step = 'upload' | 'result';
type Tone = 'funny' | 'sharp' | 'professional';

const TONES: { id: Tone; label: string; description: string; emoji: string }[] = [
  { id: 'funny',        label: 'Bold & Funny',         description: 'Swiggy-style. Humor + proof.',      emoji: '😈' },
  { id: 'sharp',        label: 'Confident & Sharp',     description: 'Founder energy. Zero fluff.',       emoji: '⚡' },
  { id: 'professional', label: 'Professional & Warm',   description: 'Senior engineer via referral.',     emoji: '🤝' },
];

const PREVIEW_SCALE = 0.42;

const EMPTY_CONTACT: ContactLinks = {
  name: '',
  email: '',
  linkedin: '',
  github: '',
  twitter: '',
  portfolio: '',
};

const CONTACT_FIELDS: { key: keyof ContactLinks; label: string; placeholder: string }[] = [
  { key: 'email',     label: 'Email',        placeholder: 'you@example.com' },
  { key: 'linkedin',  label: 'LinkedIn',     placeholder: 'linkedin.com/in/username' },
  { key: 'github',    label: 'GitHub',       placeholder: 'github.com/username' },
  { key: 'twitter',   label: 'Twitter / X',  placeholder: 'x.com/username' },
  { key: 'portfolio', label: 'Portfolio',    placeholder: 'yoursite.dev' },
];

export default function Home() {
  const [step, setStep]               = useState<Step>('upload');
  const [resumeJson, setResumeJson]   = useState<Record<string, unknown> | null>(null);
  const [slides, setSlides]           = useState<Slide[] | null>(null);
  const [loading, setLoading]         = useState(false);
  const [loadingStage, setLoadingStage] = useState<'parsing' | 'generating' | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [fileName, setFileName]       = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone>('funny');
  const [activeSlide, setActiveSlide] = useState(0);
  const [contact, setContact] = useState<ContactLinks>(EMPTY_CONTACT);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollToSlide(index: number) {
    const el = carouselRef.current;
    if (!el || !slides) return;
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const cardWidth = 1080 * PREVIEW_SCALE + 16; // card + gap
    el.scrollTo({ left: clamped * cardWidth, behavior: 'smooth' });
    setActiveSlide(clamped);
  }

  function handleCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = 1080 * PREVIEW_SCALE + 16;
    setActiveSlide(Math.round(el.scrollLeft / cardWidth));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setResumeJson(null);
    setSlides(null);

    setLoading(true);
    setLoadingStage('parsing');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const parsed = await parseRes.json();
      if (!parseRes.ok) throw new Error(parsed.error || 'Failed to parse resume');

      setResumeJson(parsed);

      // Prefill contact links from the parsed resume
      const parsedContact = (parsed.contact ?? {}) as Partial<ContactLinks>;
      setContact({
        name: (parsed.name as string) ?? '',
        email: parsedContact.email ?? '',
        linkedin: parsedContact.linkedin ?? '',
        github: parsedContact.github ?? '',
        twitter: (parsedContact as Record<string, string>).twitter ?? '',
        portfolio: parsedContact.portfolio ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setFileName(null);
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  }

  async function handleGenerate() {
    if (!resumeJson) return;

    setError(null);
    setLoading(true);
    setLoadingStage('generating');

    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson, tone: selectedTone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate pitch');

      setSlides(data.slides);
      setActiveSlide(0);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  }

  function handleReset() {
    setStep('upload');
    setResumeJson(null);
    setSlides(null);
    setError(null);
    setFileName(null);
    setSelectedTone('funny');
    setContact(EMPTY_CONTACT);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <button onClick={handleReset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <span className="text-gray-950 text-xs font-bold">P</span>
          </div>
          <span className="font-semibold tracking-tight">Pitcher AI</span>
          <span className="text-gray-500 text-xs ml-0.5">MVP</span>
        </button>
        {step === 'result' && (
          <button onClick={handleReset} className="text-sm text-gray-400 hover:text-white transition-colors">
            ← New pitch
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── STEP 1: Upload + Tone ── */}
        {step === 'upload' && (
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Turn your resume into a pitch.</h1>
            <p className="text-gray-400 mb-8">Upload your PDF, pick a tone, and get a carousel pitch deck in seconds.</p>

            {/* Upload zone */}
            <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-6
              ${loading && loadingStage === 'parsing'
                ? 'border-gray-700 bg-gray-900/40'
                : resumeJson
                  ? 'border-green-700 bg-green-950/20'
                  : 'border-gray-700 bg-gray-900/20 hover:border-gray-500 hover:bg-gray-900/40'
              }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={loading}
              />
              {loading && loadingStage === 'parsing' ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Parsing resume...</span>
                </div>
              ) : resumeJson ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-green-900/60 border border-green-700 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-400 text-sm font-medium">{fileName}</p>
                  <p className="text-gray-500 text-xs">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Click to upload PDF</p>
                    <p className="text-gray-500 text-xs mt-0.5">PDF only · Max 10MB</p>
                  </div>
                </div>
              )}
            </label>

            {/* Your links — shown after resume parses, prefilled from it */}
            {resumeJson && (
              <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-300">Your links</p>
                  <span className="text-xs text-gray-600">shown on the last slide</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Pulled from your resume — edit or add anything missing.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONTACT_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={contact[field.key]}
                        onChange={(e) => setContact({ ...contact, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tone selector */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-300 mb-3">Pick your pitch tone</p>
              <div className="grid grid-cols-3 gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedTone === tone.id
                        ? 'border-white bg-white/10'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">{tone.emoji}</div>
                    <div className="text-sm font-medium text-white leading-tight">{tone.label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-snug">{tone.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!resumeJson || loading}
              className="w-full bg-white text-gray-950 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && loadingStage === 'generating' ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                  Generating your pitch...
                </>
              ) : (
                'Generate Pitch Deck →'
              )}
            </button>

            {!resumeJson && (
              <p className="text-center text-gray-600 text-xs mt-3">Upload your resume first to enable this button</p>
            )}
          </div>
        )}

        {/* ── STEP 2: Results ── */}
        {step === 'result' && slides && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold tracking-tight">Your pitch deck</h1>
              <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400 capitalize">
                {TONES.find(t => t.id === selectedTone)?.emoji} {selectedTone}
              </span>
            </div>
            <p className="text-gray-400 mb-6">{slides.length} slides · 1080×1350 · Swipe or use arrows.</p>

            {/* Carousel */}
            <div className="relative -mx-6">
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 scrollbar-none"
                style={{ scrollbarWidth: 'none' }}
              >
                {slides.map((slide) => (
                  <div key={slide.slide_number} className="snap-center shrink-0 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
                    <SlideCard slide={slide} total={slides.length} scale={PREVIEW_SCALE} contact={contact} />
                  </div>
                ))}
              </div>

              {/* Nav arrows */}
              <button
                onClick={() => scrollToSlide(activeSlide - 1)}
                disabled={activeSlide === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-900/90 border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous slide"
              >
                ←
              </button>
              <button
                onClick={() => scrollToSlide(activeSlide + 1)}
                disabled={activeSlide >= slides.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-900/90 border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next slide"
              >
                →
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-gray-700 hover:bg-gray-500'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => { setSlides(null); setStep('upload'); }}
                className="flex-1 bg-gray-900 border border-gray-700 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                ← Regenerate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-white text-gray-950 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                New Pitch
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
