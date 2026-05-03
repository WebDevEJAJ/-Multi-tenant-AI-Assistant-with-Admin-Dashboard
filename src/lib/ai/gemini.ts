/**
 * AI INTEGRATION - Google Gemini
 *
 * Handles all AI model interactions with:
 * - Structured prompt construction
 * - Integration data injection
 * - Error handling with rate limit fallback
 * - Response streaming preparation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ───
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  processingTimeMs: number;
}

export interface AIRequestOptions {
  systemPrompt: string;
  messages: AIMessage[];
  integrationContext: string;
  maxTokens?: number;
  model?: string;
}

// ─── Rate Limit Tracking ───
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // 1 second minimum between requests
let consecutiveErrors = 0;
const MAX_RETRIES = 3;

/**
 * Simple rate limiter - waits if requests are too frequent.
 */
async function rateLimitGuard(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Build the full prompt with system instructions and integration context.
 */
function buildSystemPrompt(
  basePrompt: string,
  integrationContext: string
): string {
  let fullPrompt = basePrompt;

  if (integrationContext) {
    fullPrompt += `\n\n${integrationContext}`;
  }

  fullPrompt += `\n\nIMPORTANT INSTRUCTIONS:
- Always be helpful, accurate, and professional.
- If integration data is available, reference specific numbers and metrics when relevant.
- Format responses clearly using markdown when appropriate.
- If you don't know something, say so rather than making up information.`;

  return fullPrompt;
}

/**
 * Send a chat completion request to Gemini.
 */
export async function generateAIResponse(
  options: AIRequestOptions
): Promise<AIResponse> {
  const {
    systemPrompt,
    messages,
    integrationContext,
    maxTokens = 2048,
    model = "gemini-2.5-flash",
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add it to your .env.local file."
    );
  }

  await rateLimitGuard();

  const startTime = Date.now();
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({
    model,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
    systemInstruction: buildSystemPrompt(systemPrompt, integrationContext),
  });

  // Build conversation history for Gemini
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const chat = genModel.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      consecutiveErrors = 0;

      const processingTimeMs = Date.now() - startTime;

      return {
        content: text,
        model,
        tokensUsed: text.length / 4, // rough estimate
        processingTimeMs,
      };
    } catch (error: unknown) {
      consecutiveErrors++;
      const err = error as Error & { status?: number };

      // Rate limit error (429)
      if (err.status === 429 || err.message?.includes("429")) {
        if (attempt < MAX_RETRIES) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          console.warn(
            `Rate limited. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
      }

      // If all retries exhausted or non-retryable error
      if (attempt === MAX_RETRIES) {
        console.error("AI generation failed after retries:", err.message);

        // Return a fallback response
        return {
          content:
            "I'm currently experiencing high demand. Please try again in a moment. If this persists, the AI service may be temporarily unavailable.",
          model,
          tokensUsed: 0,
          processingTimeMs: Date.now() - startTime,
        };
      }

      throw error;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error("Unexpected error in AI response generation");
}
