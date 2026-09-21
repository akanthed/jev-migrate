import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Score each support reply for how urgent it is on a 1-5 scale so the
// dashboard can sort the queue by priority.
export async function scoreUrgency(replyText: string) {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `Rate the urgency of this message from 1 to 5: ${replyText}` }],
      },
    ],
  });

  return result.response.text();
}
