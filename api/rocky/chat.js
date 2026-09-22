import { buildRockySystemPrompt } from "../../frontend/src/lib/gemini";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GCP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Chatbot API is not configured" });

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const contents = messages
      .filter((message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
      )
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content.slice(0, 4000) }],
      }));

    if (!contents.length || contents[contents.length - 1].role !== "user") {
      return res.status(400).json({ error: "A user message is required" });
    }

    const upstream = await fetch(
      `${GEMINI_API_URL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: buildRockySystemPrompt() }] },
          generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
        }),
      }
    );

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("[rocky] Gemini request failed", upstream.status, detail.slice(0, 500));
      return res.status(502).json({ error: "The chatbot provider rejected the request" });
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const delta = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        } catch {
          // Ignore incomplete provider events.
        }
      }
    }
    return res.end();
  } catch (error) {
    console.error("[rocky] Chat handler error", error);
    if (!res.headersSent) return res.status(500).json({ error: "Unable to reach the chatbot" });
    return res.end();
  }
}

export const config = { runtime: "nodejs20.x" };
