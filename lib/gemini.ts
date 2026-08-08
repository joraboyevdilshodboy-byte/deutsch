const GEMINI_API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiStreamOptions = {
  contents: GeminiChatMessage[];
  systemInstruction: string;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
};

export class GeminiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeminiRequestError";
    this.status = status;
  }
}

function geminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
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

/**
 * Gemini's REST streaming endpoint is Server-Sent Events. The browser clients
 * in this project consume a simple text stream, so this converts each Gemini
 * event into only its generated text while preserving incremental delivery.
 */
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
      // Ignore a malformed individual SSE event. The enclosing response is
      // still valid and later events can contain useful generated content.
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

export async function streamGeminiText({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.65,
  signal,
}: GeminiStreamOptions) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiRequestError(
      "GEMINI_API_KEY sozlanmagan. .env.local fayliga kalitni qo'shing.",
      503,
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
    throw new GeminiRequestError(
      "Gemini xizmatiga ulanib bo'lmadi. Internet va API kalitini tekshiring.",
      502,
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
      // The status below is enough when Gemini did not return JSON.
    }

    const message =
      response.status === 401 || response.status === 403
        ? "Gemini API kaliti noto'g'ri yoki bu modelga ruxsat yo'q."
        : response.status === 429
          ? "Gemini so'rovlar limiti tugadi. Bir ozdan keyin qayta urinib ko'ring."
          : "Gemini javob bera olmadi. Keyinroq qayta urinib ko'ring.";

    console.error("Gemini API error", response.status, detail);
    throw new GeminiRequestError(message, response.status >= 500 ? 502 : response.status);
  }

  if (!response.body) {
    throw new GeminiRequestError("Gemini bo'sh javob qaytardi.", 502);
  }

  return geminiSseToTextStream(response.body);
}
