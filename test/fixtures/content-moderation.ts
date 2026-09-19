import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function classifyContent(text: string) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    temperature: 0,
    max_tokens: 50,
    messages: [
      {
        role: "user",
        content: `Classify this content into one category: spam, safe, abusive. Return JSON like {"category": "safe"}.\n\nContent: ${text}`,
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "{}";
  const result = JSON.parse(raw);
  return result.category;
}
