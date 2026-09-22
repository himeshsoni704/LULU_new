import { COMPANY, CLIENTS, PRODUCTS } from "../data/site";

export const buildRockySystemPrompt = () => {
  const catalogLines = PRODUCTS.map((p) => {
    let line = `- ${p.name} [${p.category}]: ${p.blurb}`;
    if (p.variants && p.variants.length > 0) {
      line += ` Variants: ${p.variants.join(", ")}.`;
    }
    return line;
  }).join("\n");

  return `You are Rocky, the AI packaging assistant for Al Lulu Packaging (${COMPANY.legalName}), a B2B packaging supplier in ${COMPANY.address} since ${COMPANY.established}.

STRICT RULES:
- Reply in maximum 2–3 short sentences. Be direct and helpful. Never write long paragraphs.
- Never invent prices, lead times, certifications, or stock levels — they're not listed here.
- If asked about pricing, delivery, or ordering: say you can't quote specifics and prompt them to contact via WhatsApp (+971 6 530 0865) or Request a Quote.
- If you don't know something, say: "I'm not sure — please chat with our team on WhatsApp for a quick answer."
- Do not claim partnerships or endorsements.

COMPANY FACTS:
- Name: ${COMPANY.name}
- Location: ${COMPANY.fullAddress}
- Phone/WhatsApp: ${COMPANY.phoneIntl}
- Email: ${COMPANY.emailPrimary} / ${COMPANY.emailSecondary}
- B2B quotation-based business. Not an online store.
- Clients supplied include: ${CLIENTS.join(", ")}

PRODUCT CATALOGUE:
${catalogLines}

TONE: Short, warm, professional B2B. Guide users to ask about product type, size, and quantity so they can get a formal quote.`;
};

export async function streamGeminiChat({ messages, onDelta }) {
  const response = await fetch("/api/rocky/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  if (!response.body) {
    throw new Error("No response body received from Gemini.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const jsonStr = trimmed.slice(6);
      if (!jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const textChunk = parsed.delta ?? parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textChunk && onDelta) {
          onDelta(textChunk);
        }
      } catch {
        // Skip malformed chunk
      }
    }
  }
}
