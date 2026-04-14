import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/index.js";

let model;

function getModel() {
  if (!env.geminiApiKey) {
    const err = new Error("AI is not configured (set GEMINI_API_KEY)");
    err.statusCode = 503;
    throw err;
  }
  if (!model) {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    model = genAI.getGenerativeModel({
      model: env.geminiModel,
      systemInstruction:
        "You are a concise professional resume coach. Output plain text or short bullet points only, no markdown unless asked.",
    });
  }
  return model;
}

function mapGeminiError(err) {
  const msg = err?.message ?? String(err);
  const status = err?.status ?? err?.statusCode;
  const is404 =
    status === 404 || /404|not found|is not found for API/i.test(msg);
  if (is404) {
    const e = new Error(
      "Gemini model not found (retired or wrong name). Set GEMINI_MODEL to a current model from Google AI Studio, e.g. gemini-2.5-flash or gemini-2.5-flash-lite."
    );
    e.statusCode = 404;
    return e;
  }
  const is429 =
    status === 429 ||
    /429|Too Many Requests|RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg);
  if (is429) {
    const e = new Error(
      "Gemini quota or rate limit reached. Wait and retry, enable billing in Google AI Studio, or try GEMINI_MODEL=gemini-2.5-flash-lite."
    );
    e.statusCode = 429;
    return e;
  }
  if (/API key|API_KEY|401|403|permission/i.test(msg)) {
    const e = new Error("Gemini API rejected the request. Check GEMINI_API_KEY and API access in Google AI Studio.");
    e.statusCode = 502;
    return e;
  }
  const e = new Error(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
  e.statusCode = status >= 400 && status < 600 ? status : 502;
  return e;
}

export async function suggestResumeSection({ section, context }) {
  const m = getModel();
  const user = `Section: ${section}\nContext (JSON or text):\n${typeof context === "string" ? context : JSON.stringify(context, null, 2)}\nSuggest improved content for this section.`;
  try {
    const result = await m.generateContent(user);
    const text = result.response.text()?.trim() ?? "";
    return { suggestion: text };
  } catch (err) {
    throw mapGeminiError(err);
  }
}
