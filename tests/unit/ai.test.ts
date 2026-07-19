import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateText, AIUnavailableError } from "@/lib/ai/index";
import { aiCache } from "@/lib/ai/cache";

// Mock the external module
vi.mock("@google/generative-ai", () => {
  const mockGenerateContent = vi.fn();
  
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
    // Export the mock so we can control it in tests
    mockGenerateContent,
  };
});

describe("ai module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiCache.clear();
    // Re-assign env variables
    process.env.GEMINI_API_KEY = "test-key";
  });

  it("should return cached result if it exists", async () => {
    const systemPrompt = "sys";
    const userContent = "user";
    const cacheKey = aiCache.generateKey(systemPrompt, userContent, undefined);
    aiCache.set(cacheKey, "cached response");

    const result = await generateText({ systemPrompt, userContent });
    expect(result).toBe("cached response");
  });

  it("should retry JSON parsing on first failure and succeed", async () => {
    // Import the mocked generateContent to manipulate it
    const { mockGenerateContent } = await import("@google/generative-ai") as any;

    // First call returns bad JSON
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "invalid json" }
    });
    
    // Second call returns good JSON
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => '{"valid": true}' }
    });

    const result = await generateText({
      systemPrompt: "sys",
      userContent: "user",
      responseSchema: { type: "object" } as any,
    });

    expect(result).toBe('{"valid": true}');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("should throw AIUnavailableError if JSON parsing fails twice", async () => {
    const { mockGenerateContent } = await import("@google/generative-ai") as any;

    mockGenerateContent.mockResolvedValue({
      response: { text: () => "invalid json" }
    });

    await expect(generateText({
      systemPrompt: "sys",
      userContent: "user",
      responseSchema: { type: "object" } as any,
    })).rejects.toThrow(AIUnavailableError);
    
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });
});
