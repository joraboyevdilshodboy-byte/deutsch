import { callGemini, streamGeminiText, AIProviderError, type AIMessage, type AIProviderResult } from "./gemini";
import { callGroq, streamGroqText } from "./groq";

export type { AIMessage, AIProviderResult } from "./gemini";
export { AIProviderError } from "./gemini";

export type AITask = "chat" | "writing-check" | "speaking-pronunciation";

export type AIOptions = {
  contents: AIMessage[];
  systemInstruction: string;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
};

type ProviderCall = (options: AIOptions) => Promise<AIProviderResult>;

/**
 * Main AI router with simplified logic:
 *
 * For "chat" tasks: Groq (fastest) → Gemini
 * For "writing-check" tasks: Gemini
 *
 * Fallbacks to other providers have been removed to keep behavior
 * predictable and to rely only on the two chosen providers.
 */
export async function callAI(task: AITask, options: AIOptions): Promise<AIProviderResult> {
  const disableGemini = (process.env.DISABLE_GEMINI || "0").trim() === "1" || (process.env.DISABLE_GEMINI || "").toLowerCase() === "true";

  const allProviders: Array<{ name: string; call: ProviderCall }> = task === "chat"
    ? [
        { name: "groq", call: callGroq },
        { name: "gemini", call: callGemini },
      ]
    : [
        { name: "groq", call: callGroq },
        { name: "gemini", call: callGemini },
      ];

  const providers = disableGemini ? allProviders.filter((p) => p.name !== "gemini") : allProviders;
  if (disableGemini) console.log("[AI Router] GEMINI disabled via DISABLE_GEMINI env var; using only Groq if available.");

  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      console.log(`[AI Router] ${task} trying provider ${provider.name}`);
      const result = await provider.call(options);
      console.log(`[AI Router] ${task} → ${provider.name} muvaffaqiyatli`);
      return result;
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn(
        `[AI Router] ${provider.name} ishlamadi, keyingisiga o'tilmoqda`,
        error instanceof Error ? error.message : error,
      );
      continue;
    }
  }

  console.error("[AI Router] Barcha AI provayderlar javob bermadi", lastError);
  throw new AIProviderError(
    "Barcha AI provayderlar javob bermadi. Keyinroq qayta urinib ko'ring.",
    503,
    "all",
  );
}

/**
 * Streaming variant for real-time chat.
 * Tries Groq first (fastest), then Gemini.
 * Returns a plain text ReadableStream.
 */
export async function streamAI(
  task: AITask,
  options: AIOptions,
): Promise<{ stream: ReadableStream<Uint8Array>; provider: string }> {
  const disableGeminiStream = (process.env.DISABLE_GEMINI || "0").trim() === "1" || (process.env.DISABLE_GEMINI || "").toLowerCase() === "true";

  const allStreamProviders: Array<{ name: string; stream: (options: AIOptions) => Promise<ReadableStream<Uint8Array>> }> = task === "chat"
    ? [
        { name: "groq", stream: streamGroqText },
        { name: "gemini", stream: streamGeminiText },
      ]
    : [
        { name: "groq", stream: streamGroqText },
        { name: "gemini", stream: streamGeminiText },
      ];

  const providers = disableGeminiStream ? allStreamProviders.filter((p) => p.name !== "gemini") : allStreamProviders;
  if (disableGeminiStream) console.log("[AI Router] GEMINI streaming disabled via DISABLE_GEMINI env var; using only Groq if available.");

  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      console.log(`[AI Router] ${task} stream trying provider ${provider.name}`);
      const stream = await provider.stream(options);
      console.log(`[AI Router] ${task} stream → ${provider.name} muvaffaqiyatli`);
      return { stream, provider: provider.name };
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }
      console.warn(
        `[AI Router] ${provider.name} stream ishlamadi, keyingisiga o'tilmoqda`,
        error instanceof Error ? error.message : error,
      );
      continue;
    }
  }

  // If no streaming provider works, fall back to non-streaming callAI.
  try {
    const result = await callAI(task, options);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(result.text));
        controller.close();
      },
    });
    console.log(`[AI Router] ${task} stream → non-streaming fallback (${result.provider})`);
    return { stream, provider: result.provider };
  } catch (error) {
    console.error("[AI Router] Barcha AI provayderlar javob bermadi", error);
    throw new AIProviderError(
      "Barcha AI provayderlar javob bermadi. Keyinroq qayta urinib ko'ring.",
      503,
      "all",
    );
  }
}