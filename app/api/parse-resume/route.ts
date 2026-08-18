import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { generateWithFallback } from "@/lib/gemini";
import { buildResumeParsePrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const pdf = await getDocumentProxy(buffer);
    const { text: rawText } = await extractText(pdf, { mergePages: true });

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Make sure it is not a scanned image." },
        { status: 400 },
      );
    }

    const prompt = buildResumeParsePrompt(rawText);
    const responseText = await generateWithFallback(prompt);

    const cleanedJson = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const resumeJson = JSON.parse(cleanedJson);
    return NextResponse.json(resumeJson);
  } catch (error) {
    console.error("Resume parse error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse resume structure. Try a cleaner PDF format." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to process resume. Please try again." },
      { status: 500 },
    );
  }
}
