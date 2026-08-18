import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

export async function generateWithFallback(prompt: string): Promise<string> {
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text ?? "";
      if (text) return text;
      throw new Error("Empty response from model");
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const isRetryable = status === 503 || status === 429 || status === 404;
      if (isRetryable) {
        console.warn(`Model ${model} unavailable (${status}), trying next...`);
        lastError = err;
        continue;
      }
      // Non-retryable error — throw immediately
      throw err;
    }
  }

  throw lastError;
}
