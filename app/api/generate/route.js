import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { notes, course, lecture, existingTopics } = await req.json();

    const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" }, 
        { apiVersion: 'v1' } 
    );

    const prompt = `Analyze this lecture transcript: "${notes}"
                    Course: "${course}"
                    Lecture Name: "${lecture}"
                    Existing Topics for this Lecture/Course: ${existingTopics?.join(', ') || 'None'}

                    TASK:
                    Generate a comprehensive set of high-yield flashcards. 
                    For each card, you MUST assign:
                    1. "category": Choose exactly one: "What" (definitions/concepts), "How" (processes/steps), or "Why" (rationale/troubleshooting).
                    2. "importance": 1-5 (5 being most likely to appear on an exam). Follow this scale:
                        - 5 (Crucial): Core principles, exam-heavy topics, or "must-know" foundations.
                        - 4 (High): Frequently tested details, common applications, or major sub-concepts.
                        - 3 (Moderate): Supporting information or specific examples.
                        - 2 (Low): Niche details, historical context, or "nice-to-know" asides.
                        - 1 (Trivia): Extremely specific data points or parenthetical mentions.
                    3. "topics": Array of 1-3 tags. 
                        - RULE: If applicable, select tags from this existing list: [${existingTopics?.join(', ') || 'None'}].
                        - RULE: If a new concept arises, create a concise 1-2 word tag.
                        - RULE: Do not use tag variations (e.g., use 'Memory' instead of 'Memory Mgt').
                    PRINCIPLES:
                    1. HIGH-YIELD: Focus on definitions, processes, and causal relationships. Prioritize depth and exam utility over covering every minor sentence.
                    2. ATOMICITY: Each card must cover discrete idea. Split complex concepts into multiple cards. If resulting in too many cards, consider condensing some info into a single card, but never combine unrelated ideas into one card.
                    3. FORMAT VARIETY (no labeling, just content): 
                        - Use basic (Question/Answer) as the primary format. 
                        - Use blank (fill-in-the-blank using [___]) ONLY for technical terminology or specific parts of a process 
                        where seeing the context is essential for memorization.
                    4. ACCURACY: Do not hallucinate. Use only the logic provided in the transcript.

                    OUTPUT FORMAT (JSON Array only, no markdown, no backticks):
                    [
                      {
                        "category": "What",
                        "importance": 5,
                        "topics": ["Memory", "Files"],
                        "question": "...",
                        "answer": "..."
                      }
                    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Secondary safety: strip potential markdown backticks
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return new Response(cleanJson, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Error Details:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}