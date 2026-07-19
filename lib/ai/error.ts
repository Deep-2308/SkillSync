/**
 * Thrown when the AI service is unavailable due to network issues,
 * quota limits, or when the model fails to return a valid response.
 * 
 * Centralizing this error allows consumers to catch one predictable
 * error type rather than parsing raw SDK exceptions.
 */
export class AIUnavailableError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, cause ? { cause } : undefined);
    this.name = "AIUnavailableError";
  }
}
