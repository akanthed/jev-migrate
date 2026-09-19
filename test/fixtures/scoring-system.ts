import OpenAI from "openai";

const openai = new OpenAI();

export async function scoreLeadPriority(leadNotes: string): Promise<number> {
  // urgency scoring: rate this lead's priority on a scale of 1 to 5
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 10,
    messages: [
      {
        role: "system",
        content: "Score the urgency of this lead from 1 to 5, where 5 is most urgent.",
      },
      { role: "user", content: leadNotes },
    ],
  });

  const score = Number(response.choices[0].message.content?.trim());
  return score;
}
