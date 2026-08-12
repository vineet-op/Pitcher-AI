'use client';

import { useState, useRef } from 'react';
import { Slide } from './api/generate-pitch/route';

type Step = 'upload' | 'company' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [resumeJson, setResumeJson] = useState<Record<string, unknown> | null>(null);
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to parse resume');
      }

      setResumeJson(json);
      setStep('company');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const companyInfo = {
      name: (form.elements.namedItem('companyName') as HTMLInputElement).value,
      role: (form.elements.namedItem('role') as HTMLInputElement).value,
      jobDescription: (form.elements.namedItem('jobDescription') as HTMLTextAreaElement).value,
      about: (form.elements.namedItem('about') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeJson, companyInfo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate pitch');
      }

      setSlides(data.slides);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep('upload');
    setResumeJson(null);
    setSlides(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <span className="text-gray-950 text-xs font-bold">P</span>
          </div>
          <span className="font-semibold tracking-tight">Pitcher AI</span>
          <span className="text-gray-500 text-xs ml-1">MVP</span>
        </div>
        {step !== 'upload' && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Start over
          </button>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-10">
          {(['upload', 'company', 'result'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step === s ? 'opacity-100' : step === 'result' || (step === 'company' && s === 'upload') ? 'opacity-60' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${step === s ? 'bg-white text-gray-950 border-white' : 'border-gray-600 text-gray-400'}`}>
                  {i + 1}
                </div>
                <span className="text-sm capitalize hidden sm:block">{s === 'upload' ? 'Upload Resume' : s === 'company' ? 'Company Info' : 'Your Pitch'}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-gray-700" />}
            </div>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Upload your resume</h1>
            <p className="text-gray-400 mb-8">We&apos;ll parse it and use it to build your personalized pitch deck.</p>

            <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${loading ? 'border-gray-700 bg-gray-900/40' : 'border-gray-700 bg-gray-900/20 hover:border-gray-500 hover:bg-gray-900/40'}`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleResumeUpload}
                disabled={loading}
              />
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Parsing resume with Gemini...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">Click to upload PDF</p>
                    <p className="text-gray-500 text-sm mt-1">PDF only · Max 10MB</p>
                  </div>
                </div>
              )}
            </label>
          </div>
        )}

        {/* Step 2: Company Info */}
        {step === 'company' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-900/50 border border-green-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">{fileName} parsed successfully</span>
            </div>

            <h1 className="text-3xl font-bold mb-2 mt-4 tracking-tight">Where are you applying?</h1>
            <p className="text-gray-400 mb-8">The more context you give, the more specific and compelling your pitch will be.</p>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                  <input
                    name="companyName"
                    required
                    placeholder="e.g. Stripe, xPay, Notion"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role Applying For *</label>
                  <input
                    name="role"
                    required
                    placeholder="e.g. Frontend Engineer"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Description *</label>
                <textarea
                  name="jobDescription"
                  required
                  rows={6}
                  placeholder="Paste the full job description here..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  About the Company
                  <span className="text-gray-500 font-normal ml-1">(optional but recommended)</span>
                </label>
                <textarea
                  name="about"
                  rows={3}
                  placeholder="What does the company do? Any recent news, their mission, culture signals..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-950 font-semibold py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                    Generating your pitch...
                  </>
                ) : (
                  'Generate Pitch Deck →'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'result' && slides && (
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Your pitch is ready</h1>
            <p className="text-gray-400 mb-8">{slides.length} slides generated. Review and refine before sending.</p>

            <div className="space-y-4">
              {slides.map((slide) => (
                <div
                  key={slide.slide_number}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-gray-800 rounded-md flex items-center justify-center text-xs font-mono text-gray-400 shrink-0">
                        {slide.slide_number}
                      </span>
                      <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {slide.slide_title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 italic ml-4 text-right shrink-0 max-w-35">
                      {slide.tone_note}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2 leading-snug">
                    {slide.headline.replace(/\*\*/g, '')}
                  </h2>

                  <p className="text-gray-400 text-sm leading-relaxed mb-3">
                    {slide.body}
                  </p>

                  {slide.bullet_points && slide.bullet_points.length > 0 && (
                    <ul className="space-y-1.5">
                      {slide.bullet_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-gray-600 mt-0.5">–</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep('company')}
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
