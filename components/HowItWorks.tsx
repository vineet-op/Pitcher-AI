interface HowItWorksProps {
  onCTA: () => void;
}

const STEPS = [
  {
    num: '01',
    title: 'UPLOAD',
    body: 'Drop your resume PDF. That\'s literally it. No account needed.',
    color: '#CCFF00',
    bg: '#F2EDE4',
  },
  {
    num: '02',
    title: 'LET AI COOK',
    body: 'Gemini reads your experience, projects and achievements — and turns your career into a story worth telling.',
    color: '#1847FF',
    bg: '#F2EDE4',
  },
  {
    num: '03',
    title: 'SHARE',
    body: 'Get 12 carousel slides ready for LinkedIn, Twitter, and anywhere people actually look.',
    color: '#FF1F5A',
    bg: '#F2EDE4',
  },
];

export default function HowItWorks({ onCTA }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="border-t-4 border-[#0A0A0A] py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="sticker bg-[#0A0A0A] text-white mb-4 inline-block">HOW IT WORKS</div>
          <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight leading-tight">
            THREE STEPS.<br />
            <span className="text-[#1847FF]">ZERO FAFF.</span>
          </h2>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-[#0A0A0A]">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`p-8 ${i < STEPS.length - 1 ? 'border-b-4 md:border-b-0 md:border-r-4' : ''} border-[#0A0A0A]`}
            >
              {/* Big number */}
              <div
                className="text-7xl font-black leading-none mb-4 tracking-tighter"
                style={{ color: step.color, WebkitTextStroke: '2px #0A0A0A' }}
              >
                {step.num}
              </div>

              {/* Title */}
              <h3 className="text-xl font-black uppercase tracking-widest text-[#0A0A0A] mb-3">
                {step.title}
              </h3>

              {/* Body */}
              <p className="text-base font-medium text-[#0A0A0A]/70 leading-relaxed">
                {step.body}
              </p>

              {/* Accent bar */}
              <div
                className="mt-6 h-1 w-12"
                style={{ background: step.color, border: '1px solid #0A0A0A' }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={onCTA}
            className="brut-btn brut-shadow-lg bg-[#1847FF] text-white border-4 border-[#0A0A0A] px-8 py-4 text-sm font-black uppercase tracking-widest transition-all"
          >
            START NOW — IT&apos;S FREE →
          </button>
        </div>
      </div>
    </section>
  );
}
