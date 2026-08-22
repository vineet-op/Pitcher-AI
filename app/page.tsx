'use client';

import { useState, useRef, useEffect } from 'react';
import { Slide } from './api/generate-pitch/route';
import SlideCard, { ContactLinks } from '@/components/SlideCard';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BeforeAfter from '@/components/BeforeAfter';
import HowItWorks from '@/components/HowItWorks';
import ExampleSection from '@/components/ExampleSection';
import FinalCTA from '@/components/FinalCTA';
import SlideInspector from '@/components/SlideInspector';
import { exportCarouselZip, exportCarouselPdf, slugifyName } from '@/lib/exportCarousel';

/* ── Types ── */
type View = 'landing' | 'upload' | 'result';
type Tone = 'funny' | 'sharp' | 'professional';

/* ── Constants ── */
const TONES: { id: Tone; label: string; description: string; emoji: string }[] = [
  { id: 'funny',        label: 'Bold & Funny',        description: 'Swiggy-style. Humor + proof.',    emoji: '😈' },
  { id: 'sharp',        label: 'Confident & Sharp',    description: 'Founder energy. Zero fluff.',     emoji: '⚡' },
  { id: 'professional', label: 'Professional & Warm',  description: 'Senior engineer via referral.',   emoji: '🤝' },
];

const CONTACT_FIELDS: { key: keyof ContactLinks; label: string; placeholder: string }[] = [
  { key: 'email',     label: 'Email',       placeholder: 'you@example.com' },
  { key: 'linkedin',  label: 'LinkedIn',    placeholder: 'linkedin.com/in/username' },
  { key: 'github',    label: 'GitHub',      placeholder: 'github.com/username' },
  { key: 'twitter',   label: 'Twitter / X', placeholder: 'x.com/username' },
  { key: 'portfolio', label: 'Portfolio',   placeholder: 'yoursite.dev' },
];

const EMPTY_CONTACT: ContactLinks = {
  name: '', email: '', linkedin: '', github: '', twitter: '', portfolio: '',
};

const LOADING_MESSAGES = [
  'READING YOUR RESUME...',
  'FINDING THE GOOD STUFF...',
  'TURNING EXPERIENCE INTO A STORY...',
  'COOKING YOUR 12 SLIDES...',
];

const RESEARCH_LOADING_MESSAGES = [
  'READING YOUR RESUME...',
  'RESEARCHING THE COMPANY...',
  'MATCHING YOUR PROOF TO THE ROLE...',
  'COOKING YOUR 12 SLIDES...',
];

const PREVIEW_SCALE = 0.38;
const THUMB_SCALE   = 0.09;

/* ── Component ── */
export default function Home() {
  const [view, setView]             = useState<View>('landing');
  const [resumeJson, setResumeJson] = useState<Record<string, unknown> | null>(null);
  const [slides, setSlides]         = useState<Slide[] | null>(null);
  const [loading, setLoading]       = useState(false);
  const [loadingStage, setLoadingStage] = useState<'parsing' | 'generating' | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError]           = useState<string | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone>('funny');
  const [activeSlide, setActiveSlide]   = useState(0);
  const [contact, setContact]       = useState<ContactLinks>(EMPTY_CONTACT);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle]   = useState('');
  const [jobUrl, setJobUrl]         = useState('');
  const [jobText, setJobText]       = useState('');
  const [target, setTarget]         = useState<{
    company: string;
    role: string;
    warnings: string[];
  } | null>(null);
  const [exporting, setExporting]   = useState(false);
  const [exportDone, setExportDone] = useState(0);
  const [exportKind, setExportKind] = useState<'zip' | 'pdf' | null>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const exportNodesRef = useRef<Map<number, HTMLElement>>(new Map());
  const originalSlidesRef = useRef<Slide[] | null>(null);

  /* Cycle loading messages while generating */
  useEffect(() => {
    if (loadingStage !== 'generating') { setLoadingMsgIdx(0); return; }
    const msgs = (companyName.trim() || jobUrl.trim() || jobText.trim())
      ? RESEARCH_LOADING_MESSAGES
      : LOADING_MESSAGES;
    const id = setInterval(() => setLoadingMsgIdx(i => (i + 1) % msgs.length), 2400);
    return () => clearInterval(id);
  }, [loadingStage]);

  /* ── Handlers (all existing logic preserved) ── */
  function scrollToSlide(index: number) {
    if (!slides) return;
    setActiveSlide(Math.max(0, Math.min(index, slides.length - 1)));
  }

  function updateSlide(slideNumber: number, patch: Partial<Slide>) {
    setSlides((prev) =>
      prev
        ? prev.map((s) => (s.slide_number === slideNumber ? { ...s, ...patch } : s))
        : prev,
    );
  }

  function revertSlide(slideNumber: number) {
    const original = originalSlidesRef.current?.find((s) => s.slide_number === slideNumber);
    if (!original) return;
    updateSlide(slideNumber, { ...original });
  }

  function isSlideDirty(slide: Slide): boolean {
    const original = originalSlidesRef.current?.find((s) => s.slide_number === slide.slide_number);
    return !!original && JSON.stringify(original) !== JSON.stringify(slide);
  }

  function hasAnyEdits(): boolean {
    if (!slides || !originalSlidesRef.current) return false;
    return JSON.stringify(slides) !== JSON.stringify(originalSlidesRef.current);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setResumeJson(null);
    setSlides(null);
    originalSlidesRef.current = null;
    setLoading(true);
    setLoadingStage('parsing');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res  = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      const parsed = await res.json();
      if (!res.ok) throw new Error(parsed.error || 'Failed to parse resume');
      setResumeJson(parsed);
      const pc = (parsed.contact ?? {}) as Partial<ContactLinks>;
      setContact({
        name:      (parsed.name as string) ?? '',
        email:     pc.email     ?? '',
        linkedin:  pc.linkedin  ?? '',
        github:    pc.github    ?? '',
        twitter:   (pc as Record<string, string>).twitter ?? '',
        portfolio: pc.portfolio ?? '',
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
      const res  = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeJson,
          tone: selectedTone,
          companyName,
          roleTitle,
          jobUrl,
          jobText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate pitch');
      setSlides(data.slides);
      setTarget(data.target ?? null);
      originalSlidesRef.current = structuredClone(data.slides);
      setActiveSlide(0);
      setView('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  }

  function handleReset() {
    setView('landing');
    setResumeJson(null);
    setSlides(null);
    originalSlidesRef.current = null;
    setError(null);
    setFileName(null);
    setSelectedTone('funny');
    setContact(EMPTY_CONTACT);
    setCompanyName('');
    setRoleTitle('');
    setJobUrl('');
    setJobText('');
    setTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function goToUpload() {
    setError(null);
    setView('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleExport(kind: 'zip' | 'pdf') {
    if (!slides || exporting) return;
    setError(null);
    setExporting(true);
    setExportKind(kind);
    setExportDone(0);
    try {
      const nodes = slides.map((slide) => {
        const el = exportNodesRef.current.get(slide.slide_number);
        if (!el) throw new Error('Export cards are not ready yet. Try again.');
        return el;
      });
      const base = slugifyName(contact.name);
      if (kind === 'pdf') {
        await exportCarouselPdf({
          nodes,
          pdfName: `${base}-carousel.pdf`,
          onProgress: (done) => setExportDone(done),
        });
      } else {
        const fileNames = slides.map(
          (slide) =>
            `${String(slide.slide_number).padStart(2, '0')}-${slide.slide_type}.png`,
        );
        await exportCarouselZip({
          nodes,
          fileNames,
          zipName: `${base}-carousel.zip`,
          onProgress: (done) => setExportDone(done),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
      setExportKind(null);
    }
  }

  /* ── Render ── */
  return (
    <div className="grid-bg min-h-screen text-[#0A0A0A]">
      <Navbar onLogoClick={handleReset} onCTAClick={goToUpload} />

      {/* ═══════════════════════════════════════ LANDING ═══ */}
      {view === 'landing' && (
        <>
          <Hero       onCTA={goToUpload} />
          <BeforeAfter />
          <HowItWorks onCTA={goToUpload} />
          <ExampleSection />
          <FinalCTA   onCTA={goToUpload} />

          {/* Footer */}
          <footer className="border-t-4 border-[#0A0A0A] py-8 px-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/40">
              © 2026 PITCHER AI · BUILT WITH GEMINI
            </span>
          </footer>
        </>
      )}

      {/* ═══════════════════════════════════════ UPLOAD ════ */}
      {view === 'upload' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">

          {/* Back link */}
          <button
            onClick={handleReset}
            className="mb-8 text-xs font-black uppercase tracking-widest text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors flex items-center gap-2"
          >
            ← BACK
          </button>

          {/* Page heading */}
          <div className="mb-10">
            <div className="sticker bg-[#FF1F5A] text-white -rotate-1 inline-block mb-4">STEP 01</div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-[#0A0A0A]">
              DROP YOUR<br />RESUME.
            </h1>
            <p className="mt-3 text-base font-medium text-[#0A0A0A]/60">
              Let&apos;s turn that boring PDF into something people actually want to read.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 border-4 border-[#FF1F5A] bg-[#FF1F5A]/10 px-4 py-3 text-sm font-bold text-[#FF1F5A]">
              {error}
            </div>
          )}

          {/* ── Upload dropzone ── */}
          <label
            className={`brut-shadow-lg flex flex-col items-center justify-center w-full border-4 cursor-pointer transition-all mb-8
              ${loading && loadingStage === 'parsing'
                ? 'border-[#0A0A0A] bg-[#0A0A0A]/5'
                : resumeJson
                  ? 'border-[#0A0A0A] bg-[#CCFF00]/20'
                  : 'border-[#0A0A0A] bg-[#F2EDE4] hover:bg-[#CCFF00]/10'
              }`}
            style={{ minHeight: 200 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
              disabled={loading}
            />

            {loading && loadingStage === 'parsing' ? (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-6 h-6 border-4 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60">Parsing resume...</span>
              </div>
            ) : resumeJson ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#CCFF00] border-4 border-[#0A0A0A] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-[#0A0A0A]">{fileName}</p>
                <div className="sticker bg-[#CCFF00] text-[#0A0A0A] border-[#0A0A0A]">READY TO COOK.</div>
                <p className="text-xs font-bold text-[#0A0A0A]/40 uppercase tracking-widest mt-1">Click to replace</p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-[#0A0A0A] bg-[#F2EDE4] flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="square" d="M12 4v12M8 8l4-4 4 4" />
                    <path strokeLinecap="square" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-base font-black uppercase tracking-widest text-[#0A0A0A]">DROP YOUR RESUME HERE</p>
                  <p className="text-xs font-bold text-[#0A0A0A]/50 mt-1">or click to browse</p>
                  <p className="text-xs font-bold text-[#0A0A0A]/30 uppercase tracking-widest mt-2">PDF · MAX 10MB</p>
                </div>
              </div>
            )}
          </label>

          {/* ── Your links ── */}
          {resumeJson && (
            <div className="mb-8 border-4 border-[#0A0A0A] brut-shadow">
              <div className="border-b-4 border-[#0A0A0A] px-5 py-3 flex items-center justify-between bg-[#0A0A0A]">
                <span className="text-xs font-black uppercase tracking-widest text-white">YOUR LINKS</span>
                <span className="text-xs font-bold text-white/40">shown on the last slide</span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F2EDE4]">
                {CONTACT_FIELDS.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={contact[field.key]}
                      onChange={e => setContact({ ...contact, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-[#F2EDE4] text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Target a role (optional RAG) ── */}
          {resumeJson && (
            <div className="mb-8 border-4 border-[#0A0A0A] brut-shadow">
              <div className="border-b-4 border-[#0A0A0A] px-5 py-3 flex items-center justify-between bg-[#1847FF]">
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Target a role · optional
                </span>
                <span className="text-xs font-bold text-white/50">Tavily researches the org</span>
              </div>
              <div className="p-5 bg-[#F2EDE4] flex flex-col gap-4">
                <p className="text-xs font-medium text-[#0A0A0A]/60">
                  Leave empty for a personal-brand carousel. Add a company to tailor the pitch.
                  Use a Greenhouse / Lever / careers URL — not LinkedIn. If you only have LinkedIn, paste the JD below.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Stripe"
                      className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
                      Role
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Frontend engineer"
                      className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
                    Job URL
                  </label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://boards.greenhouse.io/company/jobs/..."
                    className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-1.5">
                    Paste JD
                  </label>
                  <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    rows={5}
                    placeholder="Paste the job description if the URL is LinkedIn or extract fails"
                    className="w-full border-2 border-[#0A0A0A] px-3 py-2 text-sm font-medium bg-white text-[#0A0A0A] placeholder-[#0A0A0A]/30 focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Tone selector ── */}
          <div className="mb-8">
            <div className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/60 mb-3">
              PICK YOUR PITCH TONE
            </div>
            <div className="grid grid-cols-3 gap-0 border-4 border-[#0A0A0A] brut-shadow">
              {TONES.map((tone, i) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-4 text-left transition-all border-[#0A0A0A] ${i < TONES.length - 1 ? 'border-r-4' : ''}
                    ${selectedTone === tone.id
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-[#F2EDE4] text-[#0A0A0A] hover:bg-[#0A0A0A]/5'
                    }`}
                >
                  <div className="text-xl mb-2">{tone.emoji}</div>
                  <div className="text-xs font-black uppercase tracking-wider leading-tight">{tone.label}</div>
                  <div className={`text-xs mt-1 font-medium leading-snug ${selectedTone === tone.id ? 'text-white/60' : 'text-[#0A0A0A]/50'}`}>
                    {tone.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Generate button / loading state ── */}
          {loading && loadingStage === 'generating' ? (
            <div className="border-4 border-[#0A0A0A] bg-[#1847FF] p-8 text-center brut-shadow-lg">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-white font-black text-sm uppercase tracking-widest">
                {((companyName.trim() || jobUrl.trim() || jobText.trim())
                  ? RESEARCH_LOADING_MESSAGES
                  : LOADING_MESSAGES)[loadingMsgIdx]}
              </p>
              <p className="text-white/40 text-xs font-bold mt-2 uppercase tracking-wider">
                {(companyName.trim() || jobUrl.trim() || jobText.trim())
                  ? 'Research + generation can take 30–50 seconds'
                  : 'This takes 15–30 seconds'}
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!resumeJson || loading}
              className="brut-btn brut-shadow-lg w-full bg-[#1847FF] text-white border-4 border-[#0A0A0A] py-5 text-sm font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              GENERATE MY CAROUSEL →
            </button>
          )}

          {!resumeJson && !loading && (
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/30 mt-4">
              Upload your resume first
            </p>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════ RESULT ════ */}
      {view === 'result' && slides && (
        <div className="px-4 sm:px-6 py-10">

          {/* Off-screen full-size cards for PNG capture (1080×1350) */}
          <div
            aria-hidden
            className="pointer-events-none fixed top-0 overflow-hidden"
            style={{ left: -4000, width: 1080 }}
          >
            {slides.map((slide) => (
              <SlideCard
                key={slide.slide_number}
                slide={slide}
                total={slides.length}
                scale={1}
                contact={contact}
                innerRef={(el) => {
                  if (el) exportNodesRef.current.set(slide.slide_number, el);
                  else exportNodesRef.current.delete(slide.slide_number);
                }}
              />
            ))}
          </div>

          {/* Result header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-4 border-[#0A0A0A] pb-6">
              <div>
                <div className="sticker bg-[#CCFF00] text-[#0A0A0A] border-[#0A0A0A] mb-3 inline-block">
                  AI GENERATED
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0A0A0A]">
                  YOUR STORY IS READY.
                </h1>
                <p className="text-sm font-bold text-[#0A0A0A]/50 uppercase tracking-widest mt-1">
                  {slides.length} SLIDES · 1080×1350 ·{' '}
                  {TONES.find(t => t.id === selectedTone)?.emoji} {selectedTone.toUpperCase()} TONE
                </p>
                {target?.company && (
                  <div className="sticker bg-[#1847FF] text-white border-[#0A0A0A] mt-3 inline-block">
                    Target: {target.company}{target.role ? ` · ${target.role}` : ''}
                  </div>
                )}
                {target?.warnings?.length ? (
                  <p className="text-xs font-bold text-[#FF1F5A] mt-2 max-w-xl">
                    {target.warnings[0]}
                  </p>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (hasAnyEdits() && !window.confirm('This discards your edits. Continue?')) return;
                    setSlides(null);
                    originalSlidesRef.current = null;
                    setTarget(null);
                    setView('upload');
                  }}
                  className="brut-btn brut-shadow border-4 border-[#0A0A0A] bg-[#F2EDE4] px-5 py-3 text-xs font-black uppercase tracking-widest transition-all"
                >
                  ← REDO
                </button>
                <button
                  onClick={handleReset}
                  className="brut-btn brut-shadow-lg border-4 border-[#0A0A0A] bg-[#1847FF] text-white px-5 py-3 text-xs font-black uppercase tracking-widest transition-all"
                >
                  NEW PITCH
                </button>
              </div>
            </div>
          </div>

          {/* Studio: editor first so it cannot hide off-screen */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">

              <div className="order-2 xl:order-1">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#0A0A0A]/50">
                  Preview · tap a thumbnail or use arrows
                </p>
                <div className="relative flex justify-center">
                  <div className="border-4 border-[#1847FF] brut-shadow-blue overflow-hidden">
                    <SlideCard
                      slide={slides[activeSlide]}
                      total={slides.length}
                      scale={PREVIEW_SCALE}
                      contact={contact}
                    />
                  </div>

                  <button
                    onClick={() => scrollToSlide(activeSlide - 1)}
                    disabled={activeSlide === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 border-4 border-[#0A0A0A] bg-[#F2EDE4] brut-shadow flex items-center justify-center font-black text-lg hover:bg-[#0A0A0A] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous slide"
                  >←</button>
                  <button
                    onClick={() => scrollToSlide(activeSlide + 1)}
                    disabled={activeSlide >= slides.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 border-4 border-[#0A0A0A] bg-[#F2EDE4] brut-shadow flex items-center justify-center font-black text-lg hover:bg-[#0A0A0A] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next slide"
                  >→</button>
                </div>

                <div className="text-center mt-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/50">
                    {activeSlide + 1} / {slides.length}
                  </span>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.slide_number}
                      onClick={() => scrollToSlide(i)}
                      className={`shrink-0 overflow-hidden border-2 transition-all
                        ${i === activeSlide ? 'border-[#1847FF]' : 'border-[#0A0A0A] opacity-50 hover:opacity-80'}`}
                      style={{
                        width:  Math.round(1080 * THUMB_SCALE),
                        height: Math.round(1350 * THUMB_SCALE),
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    >
                      <SlideCard slide={slide} total={slides.length} scale={THUMB_SCALE} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="order-1 xl:order-2 xl:sticky xl:top-6">
                <SlideInspector
                  slide={slides[activeSlide]}
                  total={slides.length}
                  isDirty={isSlideDirty(slides[activeSlide])}
                  onChange={(patch) => updateSlide(slides[activeSlide].slide_number, patch)}
                  onRevert={() => revertSlide(slides[activeSlide].slide_number)}
                />
              </div>
            </div>

            {/* Export CTA */}
            <div className="mt-8 border-4 border-[#0A0A0A] p-6 bg-[#0A0A0A] flex flex-col sm:flex-row items-center justify-between gap-4 brut-shadow-lg">
              <div>
                <p className="text-white font-black text-sm uppercase tracking-widest">EXPORT YOUR CAROUSEL</p>
                <p className="text-white/40 text-xs font-bold mt-1">
                  {exporting
                    ? `Rendering slide ${exportDone} of ${slides.length}…`
                    : 'PNG zip for LinkedIn · PDF to send as a deck'}
                </p>
                {error && view === 'result' && (
                  <p className="text-[#FF1F5A] text-xs font-bold mt-2">{error}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="brut-btn bg-white text-[#0A0A0A] border-4 border-white px-6 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ boxShadow: '4px 4px 0px #CCFF00' }}
                  onClick={() => handleExport('zip')}
                  disabled={exporting}
                >
                  {exporting && exportKind === 'zip'
                    ? `ZIP ${exportDone}/${slides.length}…`
                    : 'EXPORT ZIP'}
                </button>
                <button
                  className="brut-btn bg-[#CCFF00] text-[#0A0A0A] border-4 border-[#CCFF00] px-6 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ boxShadow: '4px 4px 0px #CCFF00' }}
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                >
                  {exporting && exportKind === 'pdf'
                    ? `PDF ${exportDone}/${slides.length}…`
                    : 'EXPORT PDF →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
