"use client";

import SlideCard from "@/components/SlideCard";
import { Slide } from "@/app/api/generate-pitch/route";

const EXAMPLE_SLIDES: Slide[] = [
  {
    slide_number: 1,
    slide_title: "Hook",
    headline: "I build things that ship.",
    subtext: "Not just prototypes. Actual production software.",
    bullet_points: [],
    slide_type: "hook",
    image_tag: "",
  },
  {
    slide_number: 2,
    slide_title: "Proof",
    headline: "7 modules. Solo. 3 months.",
    subtext: "React + TypeScript. All in prod.",
    bullet_points: [],
    slide_type: "proof",
    image_tag: "galaxy-brain",
  },
  {
    slide_number: 3,
    slide_title: "Skills",
    headline: "The actual stack.",
    subtext: "",
    bullet_points: [
      "React — 7 shipped CRM modules",
      "Node.js — REST APIs at scale",
      "LLMs — RAG pipelines in prod",
    ],
    slide_type: "skills",
    image_tag: "",
  },
  {
    slide_number: 4,
    slide_title: "Punchline",
    headline: "This is fine. (The deploy, I mean.)",
    subtext: "Actually no. Everything is great.",
    bullet_points: [],
    slide_type: "punchline",
    image_tag: "this-is-fine",
  },
];

const SCALE = 0.265;
const CARD_W = Math.round(1080 * SCALE); // 286px
const CARD_H = Math.round(1350 * SCALE); // 358px

const SLIDE_LABELS: Record<string, string> = {
  hook: "Opening Hook",
  proof: "Proof of Work",
  skills: "Skills",
  punchline: "Punchline",
};

export default function ExampleSection() {
  return (
    <section id="examples" className="py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="sticker bg-[#CCFF00] text-[#0A0A0A] border-[#0A0A0A] mb-4 inline-block">
              EXAMPLE OUTPUT
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight leading-tight">
              FROM RESUME
              <br />
              TO <span className="text-[#FF1F5A]">CONTENT.</span>
            </h2>
          </div>
          <p className="text-sm font-bold text-[#0A0A0A]/50 max-w-xs">
            This is what Pitcher AI actually generates. No fake mockups.
          </p>
        </div>

        {/* Cards — w-fit so the border hugs the cards with zero extra space */}
        <div className="flex flex-wrap w-full justify-start gap-8">
          {EXAMPLE_SLIDES.map((slide, i) => (
            <div
              key={slide.slide_number}
              className="flex flex-col"
              style={{
                width: CARD_W,
              }}
            >
              {/* Slide at fixed scale — box is exactly as wide as the card */}
              <div
                className="overflow-hidden"
                style={{ width: CARD_W, height: CARD_H }}
              >
                <SlideCard
                  slide={slide}
                  total={EXAMPLE_SLIDES.length}
                  scale={SCALE}
                />
              </div>

              {/* Label */}
              <div className="px-4 py-3 bg-[#F2EDE4] flex-1">
                <div className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]/50">
                  {SLIDE_LABELS[slide.slide_type] ?? slide.slide_type}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/40">
          Generated from a real resume · Your slides will match your actual
          experience
        </p>
      </div>
    </section>
  );
}
