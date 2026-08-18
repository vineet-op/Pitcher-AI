'use client';

interface NavbarProps {
  onLogoClick: () => void;
  onCTAClick: () => void;
}

export default function Navbar({ onLogoClick, onCTAClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#F2EDE4] border-b-4 border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-1 font-black text-lg tracking-tight"
        >
          <span className="text-[#0A0A0A]">PITCHER</span>
          <span className="text-[#1847FF]">AI</span>
        </button>

        {/* Nav links — hidden on small screens */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] hover:text-[#1847FF] transition-colors">
            How it works
          </a>
          <a href="#examples" className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] hover:text-[#1847FF] transition-colors">
            Examples
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-sm font-bold uppercase tracking-widest text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors">
            Sign in
          </button>
          <button
            onClick={onCTAClick}
            className="brut-btn brut-shadow bg-[#1847FF] text-white border-2 border-[#0A0A0A] px-4 py-2 text-xs font-black uppercase tracking-widest transition-all"
          >
            Create Yours →
          </button>
        </div>
      </div>
    </header>
  );
}
