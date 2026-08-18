interface FinalCTAProps {
  onCTA: () => void;
}

export default function FinalCTA({ onCTA }: FinalCTAProps) {
  return (
    <section className="border-t-4 border-[#0A0A0A] bg-[#1847FF] py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">

        {/* Sticker */}
        <div className="mb-8 flex justify-center">
          <span className="sticker bg-[#CCFF00] text-[#0A0A0A] border-[#0A0A0A] rotate-1 inline-block">
            YOUR CAREER DESERVES BETTER
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight leading-none mb-8">
          STOP SENDING PDFs.<br />
          START TELLING<br />
          YOUR STORY.
        </h2>

        {/* CTA button */}
        <button
          onClick={onCTA}
          className="brut-btn bg-[#CCFF00] text-[#0A0A0A] border-4 border-[#0A0A0A] px-10 py-5 text-base font-black uppercase tracking-widest transition-all"
          style={{ boxShadow: '6px 6px 0px #0A0A0A' }}
        >
          CREATE MY CAROUSEL →
        </button>

        <p className="mt-8 text-white/50 text-sm font-bold uppercase tracking-wider">
          Free · No account needed · PDF in, carousel out
        </p>
      </div>
    </section>
  );
}
