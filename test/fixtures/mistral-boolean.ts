import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// needs_escalation: ask the model whether this email should_be_escalated, yes/no only.
export async function checkEscalation(emailBody: string) {
  const response = await client.chat.complete({
    model: "mistral-small-latest",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Does this email need escalation? Answer yes/no only.\n\n${emailBody}`,
      },
    ],
  });

  const needs_escalation = response.choices[0].message.content?.trim().toLowerCase() === "yes";
  return needs_escalation;
}
