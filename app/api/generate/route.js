import { GoogleGenerativeAI } from "@google/generative-ai";

// Force the SDK to use the stable 'v1' instead of 'v1beta'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { notes, course, lecture, existingTopics } = await req.json();

    
    // Explicitly use the model via the stable v1 endpoint
    const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" }, 
        { apiVersion: 'v1' } 
    );

    const prompt = `Analyze this lecture transcript: "${notes}"
                    Course: "${course}"
                    Lecture Name: "${lecture}"
                    Existing Topics for this Lecture/Course: ${existingTopics?.join(', ') || 'None'}


                    TASK:
                    Generate a comprehensive set of high-yield flashcards. For each card, assign 2 to 3 relevant topics.

                    STUDY PRINCIPLES:
                    1. HIGH-YIELD: Focus on definitions, processes, and causal relationships. Prioritize depth and exam utility over covering every minor sentence.
                    2. ATOMICITY: Each card must cover exactly one discrete idea. Split complex concepts into multiple cards.
                    3. TAGGING: Assign 2-3 relevant topics to each card, using the "Existing Topics" list as a guide. Balance between specificity and generality in topic selection to enhance retrieval and spaced repetition effectiveness.
                    4. FORMAT VARIETY: 
                        - Use 'Basic' (Question/Answer) as the primary format. 
                        - Use 'Cloze' (fill-in-the-blank using [___]) ONLY for technical terminology or specific parts of a process 
                        where seeing the context is essential for memorization.
                    5. ACCURACY: Do not hallucinate. Use only the logic provided in the transcript.

                    OUTPUT FORMAT (JSON Array only, no markdown, no backticks):
                    [
                        {
                        "topics": ["ExistingTopic", "NewTopic"],
                        "question": "...",
                        "answer": "..."
                        }
                    ]
                    `;

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