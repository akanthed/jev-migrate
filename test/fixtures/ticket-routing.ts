import OpenAI from "openai";

const openai = new OpenAI();

export async function routeTicket(ticketText: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 20,
    messages: [
      {
        role: "system",
        content: "Route this support ticket to the correct department: billing, technical, sales.",
      },
      { role: "user", content: ticketText },
    ],
  });

  const department = response.choices[0].message.content?.trim();
  return department;
}
