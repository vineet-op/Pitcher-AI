import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildMasterPrompt, CompanyInfo } from "@/lib/prompts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface Slide {
  slide_number: number;
  slide_title: string;
  headline: string;
  body: string;
  bullet_points: string[];
  tone_note: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resumeJson,
      companyInfo,
    }: { resumeJson: Record<string, unknown>; companyInfo: CompanyInfo } = body;

    if (!resumeJson || !companyInfo) {
      return NextResponse.json(
        { error: "Missing resumeJson or companyInfo" },
        { status: 400 },
      );
    }

    if (!companyInfo.name || !companyInfo.role || !companyInfo.jobDescription) {
      return NextResponse.json(
        { error: "Company name, role, and job description are required" },
        { status: 400 },
      );
    }

    const prompt = buildMasterPrompt(resumeJson, companyInfo);

    const response = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
    });

    const responseText = response.output_text ?? "";

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
