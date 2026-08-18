import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildMasterPrompt } from "@/lib/prompts";

export interface Slide {
  slide_number: number;
  slide_title: string;
  headline: string;
  subtext: string;
  bullet_points: string[];
  slide_type: "hook" | "setup" | "punchline" | "proof" | "skills" | "ask";
  image_tag: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeJson, tone }: { resumeJson: Record<string, unknown>; tone: string } = body;

    if (!resumeJson) {
      return NextResponse.json({ error: "Missing resume data" }, { status: 400 });
    }

    const prompt = buildMasterPrompt(resumeJson, tone ?? "funny");
    const responseText = await generateWithFallback(prompt);

    const cleanedJson = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const slides: Slide[] = JSON.parse(cleanedJson);

    if (!Array.isArray(slides) || slides.length === 0) {
      throw new Error("Invalid slides format returned from model");
    }

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Pitch generation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse pitch content. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to generate pitch. Please try again." },
      { status: 500 },
    );
  }
}
