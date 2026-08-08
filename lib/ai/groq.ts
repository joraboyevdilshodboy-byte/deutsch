import { AIProviderError, type AIMessage, type AIProviderResult } from "./gemini";

const GROQ_API_ROOT = "https://api.groq.com/openai/v1/chat/completions";

type GroqStreamOptions = {
  contents: AIMessage[];
  systemInstruction: string;
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
};

function groqModel() {
  return process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
}

export async function callGroq({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.65,
  signal,
}: GroqStreamOptions): Promise<AIProviderResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError("GROQ_API_KEY sozlanmagan.", 503, "groq");
  }

  const messages = [
    { role: "system", content: systemInstruction },
    ...contents.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    })),
  ];

  let response: Response;
  try {
    response = await fetch(GROQ_API_ROOT, {
      method: "POST",
      cache: "no-store",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel(),
        messages,
        max_tokens: maxOutputTokens,
        temperature,
        stream: false,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new AIProviderError("Groq xizmatiga ulanib bo'lmadi.", 502, "groq");
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

    console.error("Groq API error", response.status, detail);
    throw new AIProviderError(
      `Groq javob bera olmadi (${response.status}).`,
      response.status >= 500 ? 502 : response.status,
      "groq",
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new AIProviderError("Groq bo'sh javob qaytardi.", 502, "groq");
  }

  return { text, provider: "groq" };
}

/** Streaming variant for real-time chat responses. */
export async function streamGroqText({
  contents,
  systemInstruction,
  maxOutputTokens = 700,
  temperature = 0.65,
  signal,
}: GroqStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError("GROQ_API_KEY sozlanmagan.", 503, "groq");
  }

  const messages = [
    { role: "system", content: systemInstruction },
    ...contents.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    })),
  ];

  let response: Response;
  try {
    response = await fetch(GROQ_API_ROOT, {
      method: "POST",
      cache: "no-store",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel(),
        messages,
        max_tokens: maxOutputTokens,
        temperature,
        stream: true,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new AIProviderError("Groq xizmatiga ulanib bo'lmadi.", 502, "groq");
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

    console.error("Groq API error", response.status, detail);
    throw new AIProviderError(
      `Groq javob bera olmadi (${response.status}).`,
      response.status >= 500 ? 502 : response.status,
      "groq",
    );
  }

  if (!response.body) {
    throw new AIProviderError("Groq bo'sh javob qaytardi.", 502, "groq");
  }

  // Convert Groq SSE stream to plain text stream.
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
      const parsed = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      const text = parsed.choices?.[0]?.delta?.content ?? "";
      if (text) {
        controller.enqueue(encoder.encode(text));
      }
    } catch {
      // Ignore malformed SSE events.
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body!.getReader();
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
      await response.body!.cancel();
    },
  });
}