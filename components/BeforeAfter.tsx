export default function BeforeAfter() {
  return (
    <section className="border-t-4 border-[#0A0A0A] bg-[#0A0A0A] py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section headline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ONE PDF.<br />
            <span className="text-[#CCFF00]">TWELVE SLIDES.</span>
          </h2>
        </div>

        {/* Split layout */}
        <div className="flex flex-col md:flex-row items-stretch gap-0">

          {/* Left: The boring way */}
          <div className="flex-1 border-4 border-[#0A0A0A] bg-[#1a1a1a] p-8">
            <div className="sticker bg-[#0A0A0A] text-white/40 border-white/20 mb-6 inline-block">
              THE BORING WAY
            </div>
            {/* PDF mockup */}
            <div className="border-2 border-white/10 bg-white/5 rounded-none p-6 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-10 bg-red-500/80 flex items-center justify-center text-white text-xs font-bold">PDF</div>
                <div>
                  <div className="h-2.5 bg-white/20 rounded-none w-32 mb-1" />
                  <div className="h-2 bg-white/10 rounded-none w-24" />
                </div>
              </div>
              {[80, 100, 60, 90, 75, 55, 85, 70].map((w, i) => (
                <div key={i} className="h-2 bg-white/10 rounded-none" style={{ width: `${w}%` }} />
              ))}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {[70, 95, 50].map((w, i) => (
                  <div key={i} className="h-2 bg-white/10 rounded-none" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <p className="mt-4 text-white/40 text-sm font-bold uppercase tracking-wider">Gets skimmed in 6 seconds</p>
          </div>

          {/* Middle arrow */}
          <div className="flex items-center justify-center bg-[#1847FF] border-y-4 md:border-y-0 md:border-x-4 border-[#0A0A0A] px-6 py-6 md:py-0">
            <span className="text-white font-black text-3xl">→</span>
          </div>

          {/* Right: The shareable way */}
          <div className="flex-1 border-4 border-[#0A0A0A] bg-[#1a1a1a] p-8">
            <div className="sticker bg-[#CCFF00] text-[#0A0A0A] border-[#0A0A0A] mb-6 inline-block">
              THE SHAREABLE WAY
            </div>

            {/* Mini carousel preview */}
            <div className="flex gap-3 overflow-hidden">
              {[
                { label: 'THE HOOK', color: '#c084fc', text: 'Built for this.' },
                { label: 'PROOF', color: '#4ade80', text: '90% faster.' },
                { label: 'THE ASK', color: '#f472b6', text: "Let's talk." },
              ].map((card) => (
                <div
                  key={card.label}
                  className="shrink-0 border-2 border-white/20 p-3"
                  style={{ width: 100, background: '#0c0d12' }}
                >
                  <div className="text-[7px] font-black uppercase tracking-widest mb-2" style={{ color: card.color }}>
                    {card.label}
                  </div>
                  <div className="text-white text-[10px] font-bold leading-tight">{card.text}</div>
                  <div className="mt-2 h-0.5 w-8" style={{ background: card.color }} />
                </div>
              ))}
            </div>

            <p className="mt-4 text-[#CCFF00] text-sm font-bold uppercase tracking-wider">Gets shared, saved, remembered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
