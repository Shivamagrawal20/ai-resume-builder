import OpenAI from "openai";
import { env } from "../config/index.js";

let client;

function getClient() {
  if (!env.openaiApiKey) {
    const err = new Error("AI is not configured (set OPENAI_API_KEY)");
    err.statusCode = 503;
    throw err;
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

export async function suggestResumeSection({ section, context }) {
  const openai = getClient();
  const system =
    "You are a concise professional resume coach. Output plain text or short bullet points only, no markdown unless asked.";
  const user = `Section: ${section}\nContext (JSON or text):\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}\nSuggest improved content for this section.`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    max_tokens: 800,
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  return { suggestion: text };
}
