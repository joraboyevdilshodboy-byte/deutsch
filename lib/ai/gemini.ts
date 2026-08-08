const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIProviderResult = {
  text: string;
  provider: string;
};

export class AIProviderError extends Error {
  readonly status: number;
  readonly provider: string;

  constructor(message: string, status = 502, provider = "unknown") {
    super(message);
    this.name = "AIProviderError";
    this.status = status;
    this.provider = provider;
  }
}

type GeminiStreamOptions = {
  contents: AIMessage[];
  systemInstruction: string;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
};

function geminiModel() {
  // Use environment override when available. Default to a newer Gemini model
  // name so new users who don't have access to older models won't get 404s.
  // If you see a 404 from Gemini, set GEMINI_MODEL in your .env.local to a
  // supported model (for example: "gemini-1.5").
  return process.env.GEMINI_MODEL?.trim() || "gemini-1.5";
}

function textFromGeminiEvent(event: unknown) {
  if (!event || typeof event !== "object") {
    return "";
  }

  const candidate = (event as { candidates?: unknown[] }).candidates?.[0];
  if (!candidate || typeof candidate !== "object") {
    return "";
  }

  const parts = (candidate as { content?: { parts?: unknown[] } }).content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") {
        return "";
      }
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

function geminiSseToTextStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const emitEvent = (rawEvent: string, controller: ReadableStreamDefaultController<Uint8Array>) => {
    const payload = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");

    if (!payload || payload === "[DONE]") {
      return;
    }

    try {
      const text = textFromGeminiEvent(JSON.parse(payload));
      if (text) {
        controller.enqueue(encoder.encode(text));
      }
    } catch {
      // Ignore malformed SSE events.
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();
      let pending = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          pending += decoder.decode(value, { stream: true });
          const events = pending.split(/\r?\n\r?\n/);
          pending = events.pop() ?? "";

          for (const event of events) {
            emitEvent(event, controller);
          }
        }

        pending += decoder.decode();
        if (pending.trim()) {
          emitEvent(pending, controller);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    async cancel() {
      await body.cancel();
    },
  });
}

export async function callGemini({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.65,
  signal,
}: GeminiStreamOptions): Promise<AIProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError(
      "GEMINI_API_KEY sozlanmagan.",
      503,
      "gemini",
    );
  }

  const model = geminiModel();
  const url = `${GEMINI_API_ROOT}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: contents.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new AIProviderError(
      "Gemini xizmatiga ulanib bo'lmadi.",
      502,
      "gemini",
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      detail = payload.error?.message ?? "";
    } catch {
      // Status is enough when no JSON body.
    }

    console.error("Gemini API error", response.status, detail);
    throw new AIProviderError(
      `Gemini javob bera olmadi (${response.status}).`,
      response.status >= 500 ? 502 : response.status,
      "gemini",
    );
  }

  if (!response.body) {
    throw new AIProviderError("Gemini bo'sh javob qaytardi.", 502, "gemini");
  }

  // For non-streaming callers, collect the full text.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let pending = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    pending += decoder.decode(value, { stream: true });
    const events = pending.split(/\r?\n\r?\n/);
    pending = events.pop() ?? "";

    for (const event of events) {
      const payload = event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!payload || payload === "[DONE]") continue;
      try {
        fullText += textFromGeminiEvent(JSON.parse(payload));
      } catch {
        // Skip malformed event.
      }
    }
  }

  pending += decoder.decode();
  if (pending.trim()) {
    const payload = pending
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (payload && payload !== "[DONE]") {
      try {
        fullText += textFromGeminiEvent(JSON.parse(payload));
      } catch {
        // Skip malformed event.
      }
    }
  }

  if (!fullText.trim()) {
    throw new AIProviderError("Gemini bo'sh javob qaytardi.", 502, "gemini");
  }

  return { text: fullText.trim(), provider: "gemini" };
}

/** Streaming variant for real-time chat responses. */
export async function streamGeminiText({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.65,
  signal,
}: GeminiStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError(
      "GEMINI_API_KEY sozlanmagan.",
      503,
      "gemini",
    );
  }

  const model = geminiModel();
  const url = `${GEMINI_API_ROOT}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: contents.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new AIProviderError(
      "Gemini xizmatiga ulanib bo'lmadi.",
      502,
      "gemini",
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      detail = payload.error?.message ?? "";
    } catch {
      // Status is enough when no JSON body.
    }

    console.error("Gemini API error", response.status, detail);
    throw new AIProviderError(
      `Gemini javob bera olmadi (${response.status}).`,
      response.status >= 500 ? 502 : response.status,
      "gemini",
    );
  }

  if (!response.body) {
    throw new AIProviderError("Gemini bo'sh javob qaytardi.", 502, "gemini");
  }

  return geminiSseToTextStream(response.body);
}