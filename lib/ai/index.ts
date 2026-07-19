import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { AIUnavailableError } from "./error";
import { aiCache } from "./cache";
import { aiRateLimiter } from "./rate-limit";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Base models
const MODEL_TEXT = "gemini-1.5-flash";
const MODEL_EMBEDDING = "text-embedding-004";

/**
 * Checks if AI features are enabled and correctly configured.
 * Consumers MUST check this before attempting to use the AI module.
 * If this returns false, AI enhancements should be skipped gracefully.
 */
export function aiEnabled(): boolean {
  return !!genAI && !!apiKey;
}

export interface GenerateTextOptions {
  systemPrompt: string;
  userContent: string;
  responseSchema?: Schema; // Native Gemini schema (equivalent to Zod schema converted)
}

/**
 * Standard text generation with JSON retry logic.
 */
export async function generateText({ systemPrompt, userContent, responseSchema }: GenerateTextOptions): Promise<string> {
  if (!genAI) throw new AIUnavailableError("Gemini API key is not configured.");

  // Check cache first
  // Note: we can't reliably serialize schema objects for hashing, so we just use a flag.
  const cacheKey = aiCache.generateKey(systemPrompt, userContent, responseSchema ? "json" : undefined);
  const cached = aiCache.get(cacheKey);
  if (cached) return cached;

  const model = genAI.getGenerativeModel({
    model: MODEL_TEXT,
    systemInstruction: systemPrompt,
    generationConfig: responseSchema ? {
      responseMimeType: "application/json",
      responseSchema,
    } : undefined
  });

  try {
    const result = await model.generateContent(userContent);
    const responseText = result.response.text();
    
    // Parse to ensure it's valid if JSON is expected
    if (responseSchema) {
      try {
        JSON.parse(responseText);
      } catch (err) {
        // Retry once on JSON parse failure
        console.warn("[AI] JSON parse failed, retrying once...");
        const retryResult = await model.generateContent(
          userContent + "\n\nWARNING: Your previous response was not valid JSON. Please try again."
        );
        const retryText = retryResult.response.text();
        JSON.parse(retryText); // Throws if still invalid
        aiCache.set(cacheKey, retryText);
        return retryText;
      }
    }

    aiCache.set(cacheKey, responseText);
    return responseText;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new AIUnavailableError("Model returned malformed JSON after retry.", error);
    }
    throw new AIUnavailableError(error?.message || "AI request failed.", error);
  }
}

/**
 * Generates an embedding for the given text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!genAI) throw new AIUnavailableError("Gemini API key is not configured.");

  const model = genAI.getGenerativeModel({ model: MODEL_EMBEDDING });
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error: any) {
    throw new AIUnavailableError(error?.message || "Embedding generation failed.", error);
  }
}

/**
 * Streams a text response for chat-style interfaces.
 */
export async function streamText(systemPrompt: string, userContent: string) {
  if (!genAI) throw new AIUnavailableError("Gemini API key is not configured.");

  const model = genAI.getGenerativeModel({
    model: MODEL_TEXT,
    systemInstruction: systemPrompt,
  });

  try {
    const result = await model.generateContentStream(userContent);
    return result.stream;
  } catch (error: any) {
    throw new AIUnavailableError(error?.message || "Stream generation failed.", error);
  }
}

export { AIUnavailableError, aiRateLimiter };
