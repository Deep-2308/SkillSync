# SkillSync AI Architecture

This document describes the foundational AI layer in SkillSync (Phase 7). The platform uses Google's Gemini API via the `@google/generative-ai` SDK to power its intelligent features.

## Core Principles

1. **Server-Side Only**: The `GEMINI_API_KEY` must never be exposed to the client. All interactions with the Gemini SDK occur exclusively within server environments (`lib/ai/index.ts`).
2. **Graceful Degradation**: Every AI feature must degrade gracefully if the API is unreachable, the API key is missing, or rate limits are exceeded. The platform must never crash or block core product flows due to AI unavailability.
3. **Centralized Access**: All AI calls must go through the functions exposed in `lib/ai/index.ts`. Individual features should **never** instantiate the `GoogleGenerativeAI` client directly.

## Using AI Features

Before making any call to the AI helpers, consumers MUST check if AI is enabled:

```typescript
import { aiEnabled, generateText } from "@/lib/ai";

if (aiEnabled()) {
  try {
    const response = await generateText({ systemPrompt: "...", userContent: "..." });
    // Proceed with AI-enhanced flow
  } catch (err) {
    // Fall back to non-AI flow
  }
} else {
  // Fall back to non-AI flow
}
```

## Available Models

- **Text Generation**: `gemini-1.5-flash` (used for `generateText` and `streamText`)
- **Embeddings**: `text-embedding-004` (used for `generateEmbedding`)

## Cost Control & Performance

To protect the platform from runaway costs and abuse:

1. **Rate Limiting**: `lib/ai/rate-limit.ts` enforces a strict cap (e.g., 20 requests per hour per user). Unauthenticated access to AI routes is forbidden.
2. **Deterministic Caching**: `generateText` requests are automatically cached via `lib/ai/cache.ts` based on a SHA-256 hash of the `systemPrompt`, `userContent`, and `responseSchema`. If an identical request is made, the cached response is served instantly without hitting the Gemini API.

## Error Handling

All raw SDK exceptions (network timeouts, quota exceeded, malformed JSON outputs) are intercepted and wrapped into a standardized `AIUnavailableError`. Consumers should catch this error to seamlessly trigger fallback logic.
